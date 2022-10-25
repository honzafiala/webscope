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
#define CAPTURE_DEPTH (1024*96)     


volatile uint8_t capture_buf[2][CAPTURE_DEPTH] = {0};
uint dma_chan[2];
volatile dma_channel_config cfg[2];

uint dma_pin = 16;
uint debug_pin = 17;
uint usb_pin = 18;

volatile uint trig_index;
uint pretrigger = 96*1024; // 50%

extern void usb_send(uint8_t * buf, uint size);
extern uint usb_rec(uint8_t * buf, uint size);

volatile uint trig = -1;

volatile int dma_active = -1;

volatile bool capture_complete = true;

void dma_irq() {
    // Determine which DMA channel triggered the IRQ
    int dma_num = dma_channel_is_busy(dma_chan[0]) ? 1 : 0; 

    // Reset IRQ flag
    dma_hw->ints1 = (1u << dma_chan[dma_num]);

    gpio_put(dma_pin, 1);

    dma_active = dma_num ? 0 : 1;
    /*
    // Check the buffer for trigger condition
    if (trig == -1) {
        uint8_t * finished_buf = dma_num ? capture_buf[1] : capture_buf[0];
        for (int i = 0; i < CAPTURE_DEPTH; i++) {
            if (finished_buf[i] > 200) {
                trig = dma_num;
                trig_index = i;
                 break;
            } 
        }
    }
    */

    // If trigger condition was found, trim the transfer count of the dma channel
    // according to the trigger index and disable channel chaining
    uint capture_depth;
    if (trig == dma_num) {
        capture_depth = trig_index;
        channel_config_set_chain_to(dma_num ? &cfg[1] : &cfg[0], dma_num);
    }
    else capture_depth = CAPTURE_DEPTH;

    // Reconfigure the DMA channel
    uint8_t * buf = dma_num ? capture_buf[1] : capture_buf[0];
    dma_channel_configure(dma_num ? dma_chan[1] : dma_chan[0], dma_num ? &cfg[1] : &cfg[0],
        buf,    // dst
        &adc_hw->fifo,  // src
        capture_depth,  // transfer count
        false            // start immediately
    );

    gpio_put(dma_pin, 0);
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
    adc_set_clkdiv(96*8);

    printf("\n\nArming DMA\n");

    capture_complete = true;

    // Claim cfg[1] DMA channels
    dma_chan[0] = dma_claim_unused_channel(true);
    dma_chan[1] = dma_claim_unused_channel(true);
    printf("DMA channels %d %d\n", dma_chan[0], dma_chan[1]);

    // Configure DMA 1
    cfg[0] = dma_channel_get_default_config(dma_chan[0]);
    channel_config_set_transfer_data_size(&cfg[0], DMA_SIZE_8);
    channel_config_set_read_increment(&cfg[0], false);
    channel_config_set_write_increment(&cfg[0], true);
    channel_config_set_chain_to(&cfg[0], dma_chan[1]);
    channel_config_set_dreq(&cfg[0], DREQ_ADC);
    dma_channel_configure(dma_chan[0], &cfg[0],
        capture_buf[0],    // dst
        &adc_hw->fifo,  // src
        CAPTURE_DEPTH,  // transfer count
        false            // start immediately
    );


    // Configure DMA 2
    cfg[1] = dma_channel_get_default_config(dma_chan[1]);
    channel_config_set_transfer_data_size(&cfg[1], DMA_SIZE_8);
    channel_config_set_read_increment(&cfg[1], false);
    channel_config_set_write_increment(&cfg[1], true);
    channel_config_set_chain_to(&cfg[1], dma_chan[0]);
    channel_config_set_dreq(&cfg[1], DREQ_ADC);
    dma_channel_configure(dma_chan[1], &cfg[1],
        capture_buf[1],    // dst
        &adc_hw->fifo,  // src
        CAPTURE_DEPTH,  // transfer count
        false            // start immediately
    );

    // Configure IRQ 0 to fire when either DMA1 or DMA2 occurs
    dma_channel_set_irq0_enabled(dma_chan[0], true);
    dma_channel_set_irq0_enabled(dma_chan[1], true);

    irq_set_exclusive_handler(DMA_IRQ_0, dma_irq);
    irq_set_enabled(DMA_IRQ_0, true);


    gpio_put(dma_pin, 1);
    gpio_put(debug_pin, 1);
    dma_start_channel_mask(1u << dma_chan[0]);
    gpio_put(dma_pin, 0);
    gpio_put(debug_pin, 0);

    sleep_ms(600);

    printf("Starting capture\n");
     adc_run(true);
    dma_active = 0;

    bool trig_found = false;
    trig_index = -1;
    uint trig_dma = -1;
    uint prev_xfer = 0;
    bool stop = false;
    while (1) {
        uint xfer_complete = CAPTURE_DEPTH - dma_channel_hw_addr(dma_active)->transfer_count;
            if (trig_dma != dma_active && trig_dma != -1) stop = true;

            if (trig_dma == dma_active && stop) {
                if (xfer_complete >= trig_index) {
                    gpio_put(debug_pin, 1);
                    sleep_us(100);
                    gpio_put(debug_pin, 0);
                    irq_set_enabled(DMA_IRQ_0, false);
                    dma_channel_abort(dma_active);
                    gpio_put(debug_pin, 1);
                    sleep_ms(10);
                    gpio_put(debug_pin, 0);
                    printf("stopping DMA %d at %d\n", dma_active, xfer_complete);
                    break;
                }
            }

            for (int i = prev_xfer; i < xfer_complete && trig_index == -1; i++) {
                if (capture_buf[dma_active][i] > 200) {
                    gpio_put(debug_pin, 1);
                    sleep_us(100);
                    gpio_put(debug_pin, 0);
                    printf("trig %d, %d\n", dma_active, i);
                    trig_index = i;
                    trig_dma = dma_active;
                    break;
                }
            }
        prev_xfer = xfer_complete;
    }
    uint xfer_complete = CAPTURE_DEPTH - dma_channel_hw_addr(dma_active)->transfer_count;
    printf("DMA %d aborted at %d\n", dma_active, xfer_complete);



    while (1) {
      //  while (dma_channel_is_busy(dma_chan[0]) || dma_channel_is_busy(dma_chan[1]) || trig == -1);
        printf("Trigger index: %d\n", trig_index);
        uint32_t trig_msg = trig_index + trig_dma * CAPTURE_DEPTH;


        usb_send((uint8_t * ) &trig_msg, 4);
        printf("trigger sent\n");

        //for (int i = 0; i < BUF_LEN; i++) capture_buf[0][]

        //usb_send(capture_buf, 32768 * 6);

        while (1);
    }

    while (1);

    return 0;
}
