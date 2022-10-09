// SPDX-License-Identifier: CC0-1.0

#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"
// For ADC input:
#include "hardware/adc.h"
#include "hardware/dma.h"

#include "pico/multicore.h"

extern void usb_thread();

#include "jsmn.h"

void handle_usb_in(uint32_t len, uint8_t * buf) {
    printf("%.*s\n", len, buf);
    jsmn_parser p;
    jsmntok_t t[16];
    jsmn_init(&p);
    int ret = jsmn_parse(&p, buf, len, t, 16);
    for (int i = 1; i < ret; i+=2) {
        jsmntok_t token = t[i];
        jsmntok_t token2 = t[i + 1];
        if (token.type == 0) continue;
        printf("%d %d, %d %d| ", token.start, token.end - token.start, token2.start, token2.end - token2.start);
        printf("%.*s: %.*s\n", token.end - token.start, &buf[token.start], token2.end - token2.start, &buf[token2.start]);
    }
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
uint dma_pin2 = 17;
uint usb_pin = 18;

volatile int buf_ready = -1;

void dma1_irq() {
    static bool s1 = false;
    s1 = !s1;
    dma_hw->ints1 = (1u << dma_chan);
    gpio_put(dma_pin, s1);

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
    static bool s1 = false;
    s1 = !s1;
    dma_hw->ints1 = (1u << dma_chan2);
    gpio_put(dma_pin2, s1);

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


extern volatile uint data_ready;
extern uint8_t _bulk_out_buf[BULK_BUFLEN];

uint usb_receive(uint8_t * buf) {
    while (data_ready == 0);
    memcpy(buf, _bulk_out_buf, data_ready);
    uint ret = data_ready;
    data_ready = 0;
    return ret;
}

uint usb_receive_nb(uint8_t * buf) {
    if (data_ready == 0) return 0;
    memcpy(buf, _bulk_out_buf, data_ready);
    uint ret = data_ready;
    data_ready = 0;
    return ret;
}

typedef struct {
    uint32_t clk_div;
} capture_config_t;

capture_config_t parse_config(uint len, uint8_t * buf) {
    capture_config_t config;

    printf("%.*s\n", len, buf);
    jsmn_parser p;
    jsmntok_t t[16];
    jsmn_init(&p);
    int ret = jsmn_parse(&p, buf, len, t, 16);
    for (int i = 1; i < ret; i+=2) {
        jsmntok_t token = t[i];
        jsmntok_t token2 = t[i + 1];
        if (token.type == 0) continue;
        printf("%.*s: %.*s\n", token.end - token.start, &buf[token.start], token2.end - token2.start, &buf[token2.start]);
        if (!strncmp("clk_div", &buf[token.start], token.end - token.start)) {
            config.clk_div = atoi(&buf[token2.start]);
        }
    }   
    return config;
}

int main(void)
{
    board_init();

    multicore_launch_core1(usb_thread);


    /*
    bool capture_aborted = false;
    bool capture_configured = false;
    enum capture_state_t {STOP, ABORTED, UNCONFIGURED, SINGLE, CONTINUOUS};
    enum capture_state_t capture_state = UNCONFIGURED;

    capture_config_t capture_config;
    while (1) {
        // Read and parse capture configuration
        uint8_t config_buf[256];
        if (capture_state == UNCONFIGURED || usb_data_ready()) {
                uint len = usb_receive(config_buf);
                capture_config = parse_config(len, config_buf);   
                capture_state = 
        }

        // Configure and start the ADC
        configure_capture(config);
        start_capture();
        // Wait until capture is done

        while (!capture_finished())
            if (usb_data_ready()) {
                abort_capture();
                capture_aborted = true;
            }
        
        // Send captured data
        if (!capture_aborted) {

        }
    }
    */



    

    gpio_init(dma_pin);
    gpio_set_dir(dma_pin, GPIO_OUT);
    gpio_init(dma_pin2);
    gpio_set_dir(dma_pin2, GPIO_OUT);

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
    adc_set_clkdiv(0);


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



    while (1) {
        uint8_t * buf[256];
        uint len = usb_receive_nb(buf);
        if (len == 0) continue;
        capture_config_t cfg = parse_config(len, buf);

        adc_run(false);
        adc_set_clkdiv(cfg.clk_div);
        adc_run(true);
    };




    return 0;
}
