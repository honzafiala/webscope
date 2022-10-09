#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"

void usb_thread() {
    tusb_init();

    while (1) {
            tud_task();
            //sleep_ms(10);
        }
}