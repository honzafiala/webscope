// SPDX-License-Identifier: CC0-1.0

#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"
// For ADC input:
#include "hardware/adc.h"
#include "hardware/dma.h"
#include "hardware/pwm.h"

#include "hardware/pll.h"
#include "hardware/clocks.h"
#include "hardware/structs/pll.h"
#include "hardware/structs/clocks.h"

#include "pico/multicore.h"

extern void core1_task();

extern inline dma_channel_hw_t *dma_channel_hw_addr(uint channel);

extern void usb_send(uint8_t * buf, uint size);
extern uint usb_rec(uint8_t * buf, uint size);
extern uint usb_data_ready();

#define CAPTURE_CHANNEL 0

#define DEBUG_PIN0 16
#define DEBUG_PIN1 17
#define DEBUG_PIN2 18


volatile uint16_t capture_buf[100000] = {0};



typedef enum {EDGE_UP, EDGE_DOWN, EDGE_BOTH} trigger_edge_t;

typedef enum {PWM, PFM} smps_mode_t;

typedef struct {
    bool active_channels[3];
    uint num_active_channels;
    uint capture_depth;
    uint sample_rate;
    uint adc_div;
    bool auto_mode;
    bool force_trigger;
    uint trigger_threshold;
    uint pretrigger;
    uint capture_buffer_len;
    bool trigger_channels[3];
    trigger_edge_t trigger_edge;
    smps_mode_t smps_mode;
} capture_config_t;

typedef struct {
    bool active;
    uint wrap;
    uint div;
    uint high_count;
} generator_config_t;

generator_config_t parse_generator_config(uint8_t config_bytes[]) {
    generator_config_t generator_config;
    generator_config.wrap = (config_bytes[1] << 8) + config_bytes[2];
    generator_config.div = (config_bytes[3] << 8) + config_bytes[4];
    generator_config.high_count = config_bytes[5] * generator_config.wrap / 100;
    if (generator_config.high_count < 1) generator_config.high_count = 1;
    generator_config.active = config_bytes[6];

    printf("PWM Div: %d, Wrap %d\n", generator_config.div, generator_config.wrap);
    return generator_config;
}

void debug_gpio_init() {
    gpio_init(DEBUG_PIN0);
    gpio_set_dir(DEBUG_PIN0, GPIO_OUT);
    gpio_init(DEBUG_PIN1);
    gpio_set_dir(DEBUG_PIN1, GPIO_OUT);
    gpio_init(DEBUG_PIN2);
    gpio_set_dir(DEBUG_PIN2, GPIO_OUT);
}

void smps_set_mode(smps_mode_t mode) {
    gpio_init(24);
    gpio_set_dir(24, GPIO_OUT);
    gpio_put(24, mode == PWM ? 1 : 0);
    printf("GPIO 24 set to %d\n", mode == PWM ? 1 : 0);
}

void analog_dma_configure(const uint main_chan, const uint ctrl_chan, capture_config_t capture_config) {
     /* Nastaveni hlavniho DMA kanalu */
    dma_channel_config chan_cfg = dma_channel_get_default_config(main_chan);
    channel_config_set_transfer_data_size(&chan_cfg, DMA_SIZE_16);
    channel_config_set_chain_to(&chan_cfg, ctrl_chan);
    channel_config_set_write_increment(&chan_cfg, true);
    channel_config_set_read_increment(&chan_cfg, false);

    channel_config_set_dreq(&chan_cfg, DREQ_ADC);

    dma_channel_configure(main_chan,
    &chan_cfg,
    capture_buf,
    &adc_hw->fifo,
    capture_config.capture_buffer_len,
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

void adc_configure(capture_config_t capture_config) {
   // Configure ADC

    adc_gpio_init(26 + CAPTURE_CHANNEL);
    adc_gpio_init(26 + CAPTURE_CHANNEL + 1);
    adc_gpio_init(26 + CAPTURE_CHANNEL + 2);
    adc_init();

    uint8_t active_channels_byte = 0;
    for (int i = 0; i < 3; i++) {
        if (capture_config.active_channels[i]) {
            active_channels_byte += 1 << i;
           // printf("Channel %d active\n", i);
        }
    }
    //printf("Round robin setting: %d\n", active_channels_byte);
    adc_set_round_robin(active_channels_byte);
    adc_fifo_setup(
        true,    // Write each completed conversion to the sample FIFO
        true,    // Enable DMA data request (DREQ)
        1,       // DREQ (and IRQ) asserted when at least 1 sample present
        false,   // We won't see the ERR bit because of 8 bit reads; disable.
        false     // Shift each sample to 8 bits when pushing to FIFO
    );

    // Set the ADC sampling
   // uint clkdiv = (96 * 500000 / capture_config.sample_rate - 1);
    uint clkdiv = (capture_config.adc_div - 1);
    if (clkdiv < 96) clkdiv = 0;
    //adc_set_clkdiv(clkdiv);
    adc_hw->div = clkdiv << 8;
}

void pwm_configure(generator_config_t generator_config) {
    if (!generator_config.active) {

    }
    const int pwm_gpio_pin = 16;


    // Find out which PWM slice is connected to GPIO 0 (it's slice 0)
    uint slice_num = pwm_gpio_to_slice_num(pwm_gpio_pin);

    if (!generator_config.active) {
        pwm_set_enabled(slice_num, false);
        gpio_set_function(pwm_gpio_pin, GPIO_FUNC_NULL);
        return;    
    }

    // Tell GPIO 0 and 1 they are allocated to the PWM
    gpio_set_function(pwm_gpio_pin, GPIO_FUNC_PWM);


    pwm_config config = pwm_get_default_config();
    pwm_config_set_clkdiv_int(&config, generator_config.div);
    pwm_config_set_wrap(&config, generator_config.wrap);
    pwm_init(slice_num, &config, true);
    pwm_set_gpio_level(pwm_gpio_pin, generator_config.high_count);
}

capture_config_t parse_capture_config(uint8_t config_bytes[]) {
    capture_config_t capture_config;

    capture_config.trigger_threshold = (config_bytes[1] << 8) + config_bytes[2];
   // printf("THRESHOLD: %x %x => %d\n", config_bytes[1], config_bytes[2], (config_bytes[1] << 8) + config_bytes[2]);

    capture_config.num_active_channels = 0;
    uint8_t active_channels_byte = config_bytes[3];
    for (int i = 0; i < 3; i++) {
        if ((active_channels_byte >> i) & 1) {
            capture_config.active_channels[i] = true;
            capture_config.num_active_channels++;
        }
        else capture_config.active_channels[i] = false;
    }

    capture_config.capture_depth = config_bytes[4] * 1000 / capture_config.num_active_channels;


    capture_config.auto_mode = config_bytes[6] ? true : false;

    //capture_config.sample_rate = config_bytes[7] * 10000;
    capture_config.adc_div = (config_bytes[7] << 8) + config_bytes[8];
   // printf("Div: %d, SR %fkS/s\n", capture_config.adc_div, (float) 48000000 / capture_config.adc_div / 1000 );


    capture_config.capture_buffer_len = capture_config.capture_depth * capture_config.num_active_channels;

    capture_config.pretrigger = capture_config.capture_buffer_len * config_bytes[5] / 10;

   // printf("TRIGGER CHANNELS: %d\n", config_bytes[9]);
    for (int i = 0; i < 3; i++) {
        if (((config_bytes[9] >> i) & 1) && capture_config.active_channels[i]) {
            capture_config.trigger_channels[i] = true;
        }
        else capture_config.trigger_channels[i] = false;
    }

    if (config_bytes[10] == 2) capture_config.trigger_edge = EDGE_BOTH;
    else if (config_bytes[10] == 1) capture_config.trigger_edge = EDGE_DOWN;
    else capture_config.trigger_edge = EDGE_UP;

    capture_config.smps_mode = config_bytes[11] ? PFM : PWM;
    printf("SMPS mode: %s\n", capture_config.smps_mode == PFM ? "PFM" : "PWM");

    capture_config.force_trigger = config_bytes[12];
    printf("Force trigger: %d\n", capture_config.force_trigger);

    return capture_config;
}

bool is_trigger_index(const capture_config_t capture_config, uint index) {
    uint channel_pos[3]; // The position of each channel in the capture buffer
    if (capture_config.num_active_channels == 1) {
        return true;
    } else if (capture_config.num_active_channels == 2) {
        if (capture_config.active_channels[0]) {
            channel_pos[0] = 0;
            channel_pos[1] = 1;
            channel_pos[2] = 1;
        } else {
            channel_pos[0] = 2;
            channel_pos[1] = 1;
            channel_pos[2] = 0;
        }
    } else {
            channel_pos[0] = 0;
            channel_pos[1] = 1;
            channel_pos[2] = 2;
    }

    index %= capture_config.num_active_channels;
    for (int i = 0; i < 3; i++) {
        if (capture_config.trigger_channels[i] && index == channel_pos[i]) return true;
    }
    return false;
}

uint main_chan, ctrl_chan; // DMA channels for circular ADC capture 

void capture(capture_config_t capture_config) {
        uint auto_mode_timeout_samples = capture_config.capture_buffer_len * 3;    

    //printf("\n");
    //printf("Trigger threshold: %d\n", capture_config.trigger_threshold);
    //printf("Capture depth: %d\n", capture_config.capture_depth);
    //printf("Capture buffer len: %d\n", capture_config.capture_buffer_len);
    //printf("Trigger channels: %d %d %d\n", capture_config.trigger_channels[0], capture_config.trigger_channels[1], capture_config.trigger_channels[2]);

    printf("is_trigger_index: ");
    for (int i = 0; i < 10; i++) {
        printf("%d ", is_trigger_index(capture_config, i) ? 1 : 0);
    }
    printf("\n");

    adc_configure(capture_config);

    analog_dma_configure(main_chan, ctrl_chan, capture_config);

    //dma_channel_start(main_chan);
    dma_channel_set_trans_count(main_chan, capture_config.capture_buffer_len, false);
    dma_channel_start(main_chan);

    sleep_ms(100);

    adc_run(true);
    int start = dma_channel_hw_addr(main_chan)->transfer_count;
    //printf("Started at %d\n", start);

    uint capture_start_index;
    bool triggered = false;
    uint xfer_count_since_trigger = 0;
    uint prev_xfer_count = 0;
    uint32_t xfer_count_since_start = 0;
    uint prev_xfer_count_since_start = 0;
    uint trigger_index;

    typedef enum {OK, ABORTED} capture_result_t;
    capture_result_t capture_result;


    // If forced trigger is ON, trigger immediately
    if (capture_config.force_trigger) {
        triggered = true;
        trigger_index = 0;
    }

    while (1) {
        // Check if abort message was received
        if (usb_data_ready()) {
            printf("Received mesage, aborting capture\n");
            adc_run(false);
            capture_result = ABORTED;
            break;
        }

        // Calculate total xfer count and xfer count since last loop iteration
        uint xfer_count = capture_config.capture_buffer_len - dma_channel_hw_addr(main_chan)->transfer_count;
        if (xfer_count > prev_xfer_count) xfer_count_since_start += xfer_count - prev_xfer_count;
        else if (xfer_count < prev_xfer_count) xfer_count_since_start += capture_config.capture_buffer_len - prev_xfer_count + xfer_count;


        // Check trigger condition
        if (!triggered && xfer_count_since_start >= capture_config.pretrigger && xfer_count_since_start > capture_config.num_active_channels * 50) {
            for (int i = prev_xfer_count_since_start; i < xfer_count_since_start; i ++) {
                uint cur_val =  capture_buf[i % capture_config.capture_buffer_len];
                uint prev_val = capture_buf[(i - capture_config.num_active_channels) % capture_config.capture_buffer_len ];

                if (!is_trigger_index(capture_config, i)) continue;

                uint threshold = capture_config.trigger_threshold;
                trigger_edge_t edge = capture_config.trigger_edge;

                if (((cur_val >= threshold && prev_val < threshold && (edge == EDGE_UP || edge == EDGE_BOTH)) ||
                    (cur_val <= threshold && prev_val > threshold && (edge == EDGE_DOWN || edge == EDGE_BOTH))) &&
                    i >= capture_config.pretrigger) {
                    trigger_index = i - capture_config.pretrigger;
                    printf("Found trigger at %d, %d since start\n", i, xfer_count_since_start);
                    triggered = true;
                    break;
                }
            }




        // Check for timeout (in auto mode or with forced trigger)
        } if (!triggered && capture_config.auto_mode && xfer_count_since_start >= auto_mode_timeout_samples) {
            trigger_index = 0;
            adc_run(false);
            printf("Timeout at %d S\n", xfer_count_since_start);
            triggered = true;
            capture_result = OK;
            break;
        // Check for capture stop
        }  if (triggered && xfer_count_since_start - trigger_index >= capture_config.capture_buffer_len) {
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
    if (dma_channel_is_busy(main_chan)) dma_channel_abort(main_chan);
    if (dma_channel_is_busy(ctrl_chan)) dma_channel_abort(ctrl_chan);

    // Send capture status message;
    uint8_t status_msg = capture_result;
    usb_send(&status_msg, 1);
    printf("Status message sent: %d\n", status_msg);

    if (capture_result == OK) {
        printf("Sending captured data\n");
        uint32_t trig_msg = trigger_index % capture_config.capture_buffer_len;
        trig_msg -= trig_msg % 2;
        usb_send((uint8_t *) &trig_msg, 4);

        const uint usb_packet_size = 32768; 

        uint8_t * capture_buf_bytes = (uint8_t *) capture_buf;

        for (int i = 0; i < capture_config.capture_buffer_len * 2; i += usb_packet_size) {
            printf("sending %d\n", capture_config.capture_buffer_len * 2 - i > usb_packet_size ? usb_packet_size : capture_config.capture_buffer_len * 2 - i);
            usb_send(&capture_buf_bytes[i], capture_config.capture_buffer_len * 2 - i > usb_packet_size ? usb_packet_size : capture_config.capture_buffer_len * 2 - i);
        }
    }
    printf("\n");
}

int main(void) {
    multicore_launch_core1(core1_task);

    main_chan = dma_claim_unused_channel(true);
    ctrl_chan = dma_claim_unused_channel(true);

    uint8_t rec_buf[100] = {0};

    generator_config_t prev_generator_config;

    while (1) {
        uint ret = usb_rec(rec_buf, 100);
        capture_config_t capture_config;
        generator_config_t generator_config;
        // Check the type of the incoming message
        switch(rec_buf[0]) {
            case 1: // Capture config received
                printf("Capture config received\n");
                capture_config = parse_capture_config(rec_buf);
                printf("Sample rate: %f (div = %d)\n", (float) 48000000 / capture_config.adc_div, capture_config.adc_div);
                smps_set_mode(capture_config.smps_mode);
                capture(capture_config);
                break;
            case 0: // Abort message received - ignore;
                printf("Abort message received\n");

                break;
            case 2: // Generator config received
                printf("Gen config received\n");

                generator_config = parse_generator_config(rec_buf);
                if (memcmp((void *) &prev_generator_config, (void *) &generator_config, sizeof(generator_config)) != 0) {
                    printf("Generator config changed, configuring peripheral.\n");
                    pwm_configure(generator_config);
                }
                prev_generator_config = generator_config;
                break;
            default:
                break;
        }


    }

    return 0;
}
