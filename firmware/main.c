// SPDX-License-Identifier: CC0-1.0

#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"
// For ADC input:
#include "hardware/adc.h"
#include "hardware/dma.h"
#include "hardware/pwm.h"

#include "pico/multicore.h"

extern void core1_task();

extern inline dma_channel_hw_t *dma_channel_hw_addr(uint channel);

extern void usb_send(uint8_t * buf, uint size);
extern uint usb_rec(uint8_t * buf, uint size);

#define CAPTURE_CHANNEL 0
#define CAPTURE_DEPTH (1024*96)     
#define NUM_ADC_CHANNELS 2
#define CAPTURE_BUFFER_LEN (CAPTURE_DEPTH * NUM_ADC_CHANNELS)

volatile uint8_t capture_buf[CAPTURE_BUFFER_LEN] = {0};

#define DEBUG_PIN0 16
#define DEBUG_PIN1 17
#define DEBUG_PIN2 18

void debug_gpio_init() {
    gpio_init(DEBUG_PIN0);
    gpio_set_dir(DEBUG_PIN0, GPIO_OUT);
    gpio_init(DEBUG_PIN1);
    gpio_set_dir(DEBUG_PIN1, GPIO_OUT);
    gpio_init(DEBUG_PIN2);
    gpio_set_dir(DEBUG_PIN2, GPIO_OUT);
}

void analog_dma_configure(const uint main_chan, const uint ctrl_chan) {
     /* Nastaveni hlavniho DMA kanalu */
    dma_channel_config chan_cfg = dma_channel_get_default_config(main_chan);
    channel_config_set_transfer_data_size(&chan_cfg, DMA_SIZE_8);
    channel_config_set_chain_to(&chan_cfg, ctrl_chan);
    channel_config_set_write_increment(&chan_cfg, true);
    channel_config_set_read_increment(&chan_cfg, false);

    channel_config_set_dreq(&chan_cfg, DREQ_ADC);

    dma_channel_configure(main_chan,
    &chan_cfg,
    capture_buf,
    &adc_hw->fifo,
    CAPTURE_BUFFER_LEN,
    false);

    static void * array_addr = capture_buf;
    /* Nastaveni kanalu pro restart hlavniho */
    chan_cfg = dma_channel_get_default_config(ctrl_chan);
    channel_config_set_transfer_data_size(&chan_cfg, DMA_SIZE_32);
    channel_config_set_read_increment(&chan_cfg, false);
    channel_config_set_write_increment(&chan_cfg, false);
    dma_channel_configure(ctrl_chan,
    &chan_cfg,
    &dma_channel_hw_addr(main_chan)->al2_write_addr_trig,
    &array_addr,
    1,
    false);
}

void adc_configure(float clkdiv) {
   // Configure ADC
    adc_gpio_init(26 + CAPTURE_CHANNEL);
    adc_gpio_init(26 + CAPTURE_CHANNEL + 1);
    adc_select_input(CAPTURE_CHANNEL);
    adc_init();
    adc_set_round_robin(0x3);
    adc_fifo_setup(
        true,    // Write each completed conversion to the sample FIFO
        true,    // Enable DMA data request (DREQ)
        1,       // DREQ (and IRQ) asserted when at least 1 sample present
        false,   // We won't see the ERR bit because of 8 bit reads; disable.
        true     // Shift each sample to 8 bits when pushing to FIFO
    );

    // Set the ADC sampling
    adc_set_clkdiv(clkdiv);
}

#define PWM_PIN 2
void pwm_configure() {
    // Tell GPIO 0 and 1 they are allocated to the PWM
    gpio_set_function(2, GPIO_FUNC_PWM);

    // Find out which PWM slice is connected to GPIO 0 (it's slice 0)
    uint slice_num = pwm_gpio_to_slice_num(2);


    pwm_config config = pwm_get_default_config();
    pwm_config_set_clkdiv(&config, 100.f);
    pwm_init(slice_num, &config, true);
    pwm_set_gpio_level(2, 32768); // 32768 out of 65535 = 50% duty cycle
}

int main(void)
{
    multicore_launch_core1(core1_task);

    pwm_configure();


    //==================
    const uint main_chan = dma_claim_unused_channel(true);
    const uint ctrl_chan = dma_claim_unused_channel(true);

    while (1) {
    uint32_t start;

    adc_configure(0);

    analog_dma_configure(main_chan, ctrl_chan);

    dma_channel_start(main_chan);


  //  sleep_ms(600);

    //printf("Starting capture\n");
     adc_run(true);

    int pretrigger = 0;

    uint capture_start_index;

    bool triggered = false;
    uint xfer_count_since_trigger = 0;
    uint prev_xfer_count = 0;
    while (1) {
        uint xfer_count = CAPTURE_BUFFER_LEN - dma_channel_hw_addr(main_chan)->transfer_count;
        if (triggered) {
            if (xfer_count > prev_xfer_count) xfer_count_since_trigger += xfer_count - prev_xfer_count;
            else if (xfer_count < prev_xfer_count) xfer_count_since_trigger += CAPTURE_BUFFER_LEN - prev_xfer_count + xfer_count;

            if (xfer_count_since_trigger >= CAPTURE_BUFFER_LEN  - pretrigger) {
                adc_run(false);
                printf("Stopping adc at idx %d after %d xfers\n", xfer_count, xfer_count_since_trigger);
                break;
            }
        } else {
            for (uint i = prev_xfer_count; i != xfer_count; i = (i + 2) % CAPTURE_BUFFER_LEN) {
                if (capture_buf[i] > 140 || capture_buf[i + 1] > 140) {
                    triggered = true;
                    capture_start_index = (i - pretrigger + CAPTURE_BUFFER_LEN) % CAPTURE_BUFFER_LEN;
                    printf("Trigger found at %d\n", i);
                    break;
                }
            }
        }
        prev_xfer_count = xfer_count;
    }

    // Atomically abort both channels.
    dma_hw->abort = (1 << main_chan) | (1 << ctrl_chan);


    printf("Sending captured data\n");
    uint32_t trig_msg = capture_start_index;
    usb_send(&trig_msg, 4);
    for (int i = 0; i < 6; i++) usb_send(&capture_buf[i * 32768], 32768);
    }

    return 0;
}
