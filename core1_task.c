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
    }
}