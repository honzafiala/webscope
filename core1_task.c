#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"

extern uint trig;
extern volatile uint trig_index;



void core1_task() {
    tusb_init();

    bool log = false;
    while (1) {
        // Handle USB
        tud_task();

        if (!log && trig != -1) {
            log = true;
            printf("Trigger at DMA %d, index %d\n", trig, trig_index);
        }
    }
}