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

volatile bool xfer_started = false;

extern volatile bool xfer_complete;

#define CAPTURE_CHANNEL 0
#define CAPTURE_DEPTH (96*1024)     

uint8_t capture_buf[CAPTURE_DEPTH] = {128};
uint8_t capture_buf2[CAPTURE_DEPTH] = {128};
uint8_t lol[1024];

uint dma_chan, dma_chan2;

volatile dma_channel_config cfg, cfg2;

uint dma_pin = 16;
uint dma_pin2 = 17;
uint usb_pin = 18;

volatile int buf_ready = -1;
extern volatile int dma_finished;

uint trig = -1;
volatile uint trig_index;

extern void usb_send(uint8_t * buf, uint size);

void dma_irq(int dma_num) {
    gpio_put(dma_num ? dma_pin2 : dma_pin, 1);

    // Reset IRQ flag
    int cur_dma_chan = dma_num ? dma_chan2 : dma_chan;
    dma_hw->ints1 = (1u << cur_dma_chan);

    // Set buffer ready flag so the data from this DMA transfer can be sent over USB
    buf_ready = dma_num;

    // Check the buffer for trigger condition
    if (trig == -1) {
        uint8_t * finished_buf = dma_num ? capture_buf2 : capture_buf;
        for (int i = 0; i < CAPTURE_DEPTH; i++) {
            if (finished_buf[i] > 200) {
                trig = dma_num;
                trig_index = i;
                break;
            } 
        }
    }

    uint capture_depth;
    if (trig == dma_num) {
        capture_depth = trig_index;
        channel_config_set_chain_to(dma_num ? &cfg2 : &cfg, dma_num);
    }
    else capture_depth = CAPTURE_DEPTH;

    // Reconfigure the DMA channel
    uint8_t * buf = dma_num ? capture_buf2 : capture_buf;
    dma_channel_configure(dma_num ? dma_chan2 : dma_chan, dma_num ? &cfg2 : &cfg,
        buf,    // dst
        &adc_hw->fifo,  // src
        capture_depth,  // transfer count
        false            // start immediately
    );
    gpio_put(dma_num ? dma_pin2 : dma_pin, 0);

}

void dma1_irq() {dma_irq(0);}
void dma2_irq() {dma_irq(1);}

void dma_channels_init_config() {

}

int main(void)
{
    board_init();

    multicore_launch_core1(core1_task);

    gpio_init(dma_pin);
    gpio_set_dir(dma_pin, GPIO_OUT);
    gpio_init(dma_pin2);
    gpio_set_dir(dma_pin2, GPIO_OUT);
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
    adc_set_clkdiv(0);

    printf("\n\nArming DMA\n");
    // Claim two DMA channels
    dma_chan = dma_claim_unused_channel(true);
    dma_chan2 = dma_claim_unused_channel(true);
    printf("DMA channels %d %d\n", dma_chan, dma_chan2);

            // Configure DMA 1
    cfg = dma_channel_get_default_config(dma_chan);
    channel_config_set_transfer_data_size(&cfg, DMA_SIZE_8);
    channel_config_set_read_increment(&cfg, false);
    channel_config_set_write_increment(&cfg, true);
    // Enable IRQ 0 for DMA 1
    dma_channel_set_irq0_enabled(dma_chan, true);
    irq_set_exclusive_handler(DMA_IRQ_0, dma1_irq);
    irq_set_enabled(DMA_IRQ_0, true);
    // Chain DMA2 to DMA1
    channel_config_set_chain_to(&cfg, dma_chan2);
    channel_config_set_dreq(&cfg, DREQ_ADC);
    dma_channel_configure(dma_chan, &cfg,
        capture_buf,    // dst
        &adc_hw->fifo,  // src
        CAPTURE_DEPTH,  // transfer count
        false            // start immediately
    );


    // Configure DMA 2
    cfg2 = dma_channel_get_default_config(dma_chan2);
    channel_config_set_transfer_data_size(&cfg2, DMA_SIZE_8);
    channel_config_set_read_increment(&cfg2, false);
    channel_config_set_write_increment(&cfg2, true);
    // Enable IRQ 1 for DMA 2
    dma_channel_set_irq1_enabled(dma_chan2, true);
    irq_set_exclusive_handler(DMA_IRQ_1, dma2_irq);
    irq_set_enabled(DMA_IRQ_1, true);
    // Chain DMA1 to DMA2
    channel_config_set_chain_to(&cfg2, dma_chan);
    channel_config_set_dreq(&cfg2, DREQ_ADC);
    dma_channel_configure(dma_chan2, &cfg2,
        capture_buf2,    // dst
        &adc_hw->fifo,  // src
        CAPTURE_DEPTH,  // transfer count
        false            // start immediately
    );


    gpio_put(dma_pin, 1);
    gpio_put(dma_pin2, 1);
    dma_start_channel_mask(1u << dma_chan);
    gpio_put(dma_pin, 0);
    gpio_put(dma_pin2, 0);

    sleep_ms(500);

    printf("Starting capture\n");
     adc_run(true);



    /*
    uint32_t msg;

    msg = 0xFF;
    usb_send((uint8_t * ) &msg, 4);
    printf("MSG 1 sent\n");

    msg = 0xF0F;
    usb_send((uint8_t * ) &msg, 4);
    printf("MSG 1 sent\n");
    */




    while (1) {
        while (dma_channel_is_busy(dma_chan) || dma_channel_is_busy(dma_chan2));
        printf("DMA finished\n");
        uint32_t trig_msg = trig_index;
        usb_send((uint8_t * ) &trig_msg, 4);
        printf("trigger sent\n");
        usb_send(capture_buf, 32768);

        while (1);
    }

    while (1);

    return 0;
}
