#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"

void core1_task() {
    tusb_init();

    while (1) {
        // Handle USB
        tud_task();

    }
}