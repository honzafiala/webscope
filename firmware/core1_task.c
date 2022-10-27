#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/dma.h"

#include "tusb_option.h"

#include "device/usbd_pvt.h"
#include "pico/stdlib.h"

void core1_task() {
    board_init();
    tusb_init();


    while (1) {
        tud_task();
    }
}