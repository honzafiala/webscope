// SPDX-License-Identifier: CC0-1.0

#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"
// For ADC input:
#include "hardware/adc.h"
#include "hardware/dma.h"

static uint32_t led_on_ms, led_off_ms;

static void board_led_blink_on(uint32_t off_ms)
{
    board_led_on();
    led_on_ms = 0;
    led_off_ms = off_ms;
}

static void board_led_blink_off(uint32_t on_ms)
{
    board_led_off();
    led_on_ms = on_ms;
    led_off_ms = 0;
}

void board_led_activity(void)
{
    board_led_blink_on(board_millis() + 10); // blink on 10ms
}

static void board_led_task(void)
{
    uint32_t now_ms = board_millis();

    if (led_off_ms && now_ms >= led_off_ms)
        board_led_blink_off(now_ms + 5000); // schedule new idle blink in 5 seconds
    else if (led_on_ms && now_ms >= led_on_ms)
        board_led_blink_on(now_ms + 1000); // idle blink on for one second
}

#define BULK_BUFLEN    (32 * 1024)
extern uint8_t * _bulk_in_buf;

#define CAPTURE_CHANNEL 0
#define CAPTURE_DEPTH 32768

uint8_t capture_buf[CAPTURE_DEPTH];
uint8_t capture_buf2[CAPTURE_DEPTH];

uint dma_chan;
uint dma_chan2;

dma_channel_config cfg, cfg2;

uint dma_pin = 16;
uint usb_pin = 17;

volatile int buf_ready = -1;

void dma1_irq() {
    dma_hw->ints1 = (1u << dma_chan);
    gpio_put(dma_pin, 1);
    printf("1\n");
    gpio_put(dma_pin, 0);
    buf_ready = 0;
    // reconfigure DMA 2
 dma_channel_configure(dma_chan2, &cfg2,
        capture_buf2,    // dst
        &adc_hw->fifo,  // src
        CAPTURE_DEPTH,  // transfer count
        false            // start immediately
    );
   //printf("irq1\n");
    // Clear interrupt for trigger DMA channel.
}

void dma2_irq() {
    dma_hw->ints1 = (1u << dma_chan2);
    gpio_put(dma_pin, 1);
    printf("2\n");
    gpio_put(dma_pin, 0);
    buf_ready = 1;
    // reconfigure DMA 1
    dma_channel_configure(dma_chan, &cfg,
        capture_buf,    // dst
        &adc_hw->fifo,  // src
        CAPTURE_DEPTH,  // transfer count
        false            // start immediately
    );

    //printf("irq2\n");
    // Clear interrupt for trigger DMA channel.
}



int main(void)
{
    board_init();

    gpio_init(dma_pin);
    gpio_set_dir(dma_pin, GPIO_OUT);
    gpio_init(usb_pin);
    gpio_set_dir(usb_pin, GPIO_OUT);


    // Configure ADC
    adc_gpio_init(26 + CAPTURE_CHANNEL);
    adc_init();
    adc_select_input(CAPTURE_CHANNEL);
    adc_fifo_setup(
        true,    // Write each completed conversion to the sample FIFO
        true,    // Enable DMA data request (DREQ)
        1,       // DREQ (and IRQ) asserted when at least 1 sample present
        false,   // We won't see the ERR bit because of 8 bit reads; disable.
        true     // Shift each sample to 8 bits when pushing to FIFO
    );

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
    printf("%d chained to %d\n", dma_chan, dma_chan2);

    channel_config_set_dreq(&cfg, DREQ_ADC);
    dma_channel_configure(dma_chan, &cfg,
        capture_buf,    // dst
        &adc_hw->fifo,  // src
        CAPTURE_DEPTH,  // transfer count
        false            // start immediately
    );
    adc_set_clkdiv(960/4);


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
    printf("%d chained to %d\n", dma_chan2, dma_chan);


    channel_config_set_dreq(&cfg2, DREQ_ADC);
    dma_channel_configure(dma_chan2, &cfg2,
        capture_buf2,    // dst
        &adc_hw->fifo,  // src
        CAPTURE_DEPTH,  // transfer count
        false            // start immediately
    );

    printf("Starting capture\n");
    adc_run(true);

     dma_start_channel_mask(1u << dma_chan);



    // Once DMA finishes, stop any new conversions from starting, and clean up
    // the FIFO in case the ADC was still mid-conversion.
    // dma_channel_wait_for_finish_blocking(dma_chan);
    // dma_channel_wait_for_finish_blocking(dma_chan2);
    // printf("Capture finished\n");
    // adc_run(false);
    // adc_fifo_drain();


    tusb_init();


    printf("usbtest\n");

    board_led_blink_on(board_millis() + 100);



    while (1)
    {
        tud_task();
        board_led_task();
        //sleep_ms(10);
    }

    return 0;
}
