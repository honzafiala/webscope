// SPDX-License-Identifier: CC0-1.0

#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"
// For ADC input:
#include "hardware/adc.h"
#include "hardware/dma.h"

#include "pico/multicore.h"

extern void core1_task();

extern inline dma_channel_hw_t *dma_channel_hw_addr(uint channel);

#define CAPTURE_CHANNEL 0
#define CAPTURE_DEPTH (1024*96*2)     


volatile uint8_t capture_buf[CAPTURE_DEPTH] = {0};

uint dma_pin = 16;
uint debug_pin = 17;
uint usb_pin = 18;

volatile int trig_index = -1;

extern void usb_send(uint8_t * buf, uint size);
extern uint usb_rec(uint8_t * buf, uint size);


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
    CAPTURE_DEPTH,
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


int main(void)
{
    board_init();


    multicore_launch_core1(core1_task);


    gpio_init(dma_pin);
    gpio_set_dir(dma_pin, GPIO_OUT);
    gpio_init(debug_pin);
    gpio_set_dir(debug_pin, GPIO_OUT);
    gpio_init(usb_pin);
    gpio_set_dir(usb_pin, GPIO_OUT);

    // Configure ADC
    adc_gpio_init(26 + CAPTURE_CHANNEL);
    adc_gpio_init(26 + CAPTURE_CHANNEL + 1);
    adc_select_input(CAPTURE_CHANNEL);
    adc_init();
    //  adc_set_round_robin(0x3);
    adc_fifo_setup(
        true,    // Write each completed conversion to the sample FIFO
        true,    // Enable DMA data request (DREQ)
        1,       // DREQ (and IRQ) asserted when at least 1 sample present
        false,   // We won't see the ERR bit because of 8 bit reads; disable.
        true     // Shift each sample to 8 bits when pushing to FIFO
    );

    // Set the ADC sampling
    adc_set_clkdiv(96);


    //==================
    const uint main_chan = dma_claim_unused_channel(true);
    const uint ctrl_chan = dma_claim_unused_channel(true);

    analog_dma_configure(main_chan, ctrl_chan);


    gpio_put(dma_pin, 1);
    gpio_put(debug_pin, 1);
    dma_start_channel_mask(1u << main_chan);
    gpio_put(dma_pin, 0);
    gpio_put(debug_pin, 0);

    sleep_ms(600);

    //printf("Starting capture\n");
     adc_run(true);

    int pretrigger = CAPTURE_DEPTH / 2;

    uint capture_start_index;

    bool triggered = false;
    uint xfer_count_since_trigger = 0;
    uint prev_xfer_count = 0;
    while (1) {
        uint xfer_count = CAPTURE_DEPTH - dma_channel_hw_addr(main_chan)->transfer_count;
        if (triggered) {
            if (xfer_count > prev_xfer_count) xfer_count_since_trigger += xfer_count - prev_xfer_count;
            else if (xfer_count < prev_xfer_count) xfer_count_since_trigger += CAPTURE_DEPTH - prev_xfer_count + xfer_count;

            if (xfer_count_since_trigger >= CAPTURE_DEPTH  - pretrigger) {
                adc_run(false);
                printf("Stopping adc at idx %d after %d xfers\n", xfer_count, xfer_count_since_trigger);
                break;
            }
        } else {
            for (uint i = prev_xfer_count; i != xfer_count; i = ++i % CAPTURE_DEPTH) {
                if (capture_buf[i] > 140 && trig_index == -1) {
                    triggered = true;
                    capture_start_index = (i - pretrigger + CAPTURE_DEPTH) % CAPTURE_DEPTH;
                    printf("Trigger found at %d\n", i);
                    break;
                }
            }
        }
        prev_xfer_count = xfer_count;
    }

    uint32_t trig_msg = capture_start_index;
    while (1) {
        usb_send(&trig_msg, 4);
        for (int i = 0; i < 6; i++) usb_send(&capture_buf[i * 32768], 32768);
    }

    return 0;
}
