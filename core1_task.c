#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"

#define CAPTURE_DEPTH (96*1024)     

extern uint trig;
extern volatile uint trig_index;

extern uint usb_pin;
extern int complete_dma; 

extern volatile uint8_t capture_buf[CAPTURE_DEPTH];
extern volatile uint8_t capture_buf2[CAPTURE_DEPTH];

void core1_task() {
    tusb_init();

    bool log = false;
    printf("TEST %d\n", capture_buf[0]);
    printf("TEST %d\n", capture_buf2[0]);

    int prev_dma = -1;
    while (1) {
        // Handle USB
        tud_task();

        /*
        // Check trigger 
        if (complete_dma != prev_dma && complete_dma != -1) {
            volatile uint8_t * buf = complete_dma ? capture_buf2 : capture_buf;
            uint max = 0;
            for (int i = 0; i < CAPTURE_DEPTH; i++) {
                if (buf[i] > 100) {
                    if (buf[i] > max) max = buf[i];
                    gpio_put(usb_pin, 1);
                    sleep_us(100);
                    gpio_put(usb_pin, 0);
                    break;
                }
            }
            printf("%d\n", complete_dma);
            prev_dma = complete_dma;
        }
        */
    }
}