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
extern uint usb_data_ready();

#define CAPTURE_CHANNEL 0
#define CAPTURE_DEPTH (100000)     
#define NUM_ADC_CHANNELS 2
uint capture_buffer_len;

volatile uint8_t capture_buf[200000] = {0};

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
    capture_buffer_len,
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

typedef struct {
    bool active_channels[3];
    uint num_active_channels;
    uint capture_depth;
    uint sample_rate;
    bool auto_mode;
    uint trigger_threshold;
    uint pretrigger;
} capture_config_t;

capture_config_t parse_capture_config(uint8_t config_bytes[]) {
    capture_config_t capture_config;

    capture_config.trigger_threshold = config_bytes[1];

    capture_config.num_active_channels = 0;
    uint8_t active_channels_byte = config_bytes[2];
    for (int i = 0; i < 3; i++) {
        if ((active_channels_byte >> i) && 1) {
            capture_config.active_channels[i] = true;
            capture_config.num_active_channels++;
        }
        else capture_config.active_channels[i] = false;
    }

    capture_config.capture_depth = config_bytes[3] * 1000;

    capture_config.pretrigger = config_bytes[4];

    capture_config.auto_mode = config_bytes[5] ? true : false;

    capture_config.sample_rate = config_bytes[6] * 1000;

    return capture_config;
}


int main(void)
 {
    multicore_launch_core1(core1_task);

    pwm_configure();


    const uint main_chan = dma_claim_unused_channel(true);
    const uint ctrl_chan = dma_claim_unused_channel(true);

    uint8_t rec_buf[6] = {0};




    while (1) {
    
    while (1) {
        uint ret = usb_rec(rec_buf, 7);
        if (rec_buf[0] == 1) break;
        else {
            // Abort message was sent - wait for another config message
            printf("Received abort, waiting for cfg...\n");
        } 
    }

    capture_config_t capture_config = parse_capture_config(rec_buf);


    bool auto_mode = rec_buf[5];
    printf("Auto mode: %d\n", auto_mode);



    uint capture_depth_div = rec_buf[3];

    capture_buffer_len = (CAPTURE_DEPTH * NUM_ADC_CHANNELS) / capture_depth_div;
    printf("Capture depth: %d\n", capture_buffer_len);

    uint auto_mode_timeout_samples = capture_buffer_len * 10;    

    uint32_t start;

    adc_configure(0);

    analog_dma_configure(main_chan, ctrl_chan);

    dma_channel_start(main_chan);


     adc_run(true);

    int pretrigger = capture_buffer_len * rec_buf[4] / 10;

    uint capture_start_index;
    

    bool triggered = false;
    uint xfer_count_since_trigger = 0;
    uint prev_xfer_count = 0;
    uint32_t xfer_count_since_start = 0;
    uint32_t prev_xfer_count_since_start = 0;
    uint trigger_index;

    typedef enum {OK, ABORTED} capture_result_t;
    capture_result_t capture_result;
    while (1) {
        // Check if abort message was received
        if (usb_data_ready()) {
            uint8_t msg;
            usb_rec(&msg, 1);
            printf("Received mesage: %d\n", msg);
            adc_run(false);
            capture_result = ABORTED;
            break;
        }

        // Check trigger
        uint xfer_count = capture_buffer_len - dma_channel_hw_addr(main_chan)->transfer_count;
        if (xfer_count > prev_xfer_count) xfer_count_since_start += xfer_count - prev_xfer_count;
        else if (xfer_count < prev_xfer_count) xfer_count_since_start += capture_buffer_len - prev_xfer_count + xfer_count;

        if (!triggered && xfer_count_since_start >= pretrigger) {
            for (int i = prev_xfer_count_since_start; i < xfer_count_since_start; i++) {
                if ( capture_buf[i % capture_buffer_len] == capture_config.trigger_threshold && capture_buf[(i - 10) % capture_buffer_len] < capture_config.trigger_threshold && i % 2 && i >= pretrigger) {
                    trigger_index = i - pretrigger;
                    printf("Found trigger at %d S\n", i);
                    triggered = true;
                    break;
                }
            }
        } if (!triggered && auto_mode && xfer_count_since_start >= auto_mode_timeout_samples) {
            trigger_index = xfer_count - pretrigger;
            printf("Timeout at %d S\n", xfer_count_since_start);
            triggered = true;
            break;
        }  if (triggered && xfer_count_since_start - trigger_index >= capture_buffer_len) {
            adc_run(false);
            printf("Stopping at %d, %d after %d\n", xfer_count_since_start, (xfer_count_since_start - trigger_index), trigger_index);
            capture_result = OK;
            break;
        }

        prev_xfer_count = xfer_count;
        prev_xfer_count_since_start = xfer_count_since_start;
    }

    // Atomically abort both channels.
    dma_hw->abort = (1 << main_chan) | (1 << ctrl_chan);

    // Send capture status message;
    uint8_t status_msg = capture_result;
    usb_send(&status_msg, 1);
    printf("Status message sent\n");

    if (capture_result == OK) {
        printf("Sending captured data\n");
        uint32_t trig_msg = trigger_index % capture_buffer_len;
        usb_send(&trig_msg, 4);

        const uint usb_packet_size = 32768; 

        for (int i = 0; i < capture_buffer_len; i += usb_packet_size) {
            printf("sending %d\n", capture_buffer_len - i > usb_packet_size ? usb_packet_size : capture_buffer_len - i);
            usb_send(&capture_buf[i], capture_buffer_len - i > usb_packet_size ? usb_packet_size : capture_buffer_len - i);

        }
    }
    }

    return 0;
}
