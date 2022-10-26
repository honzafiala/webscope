#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/dma.h"

#include "tusb_option.h"

#include "device/usbd_pvt.h"
#include "pico/stdlib.h"


void core1_task() {
    tusb_init();

    while (1) {
        // Handle USB
        tud_task();

        /*
        if (send_buf_len > 0) {
            if (usbd_edpt_busy(0, _bulk_in)) {
                printf("sending %p %d\n", send_buf, send_buf_len);
                usbd_edpt_xfer(0, _bulk_in, send_buf, send_buf_len);
                send_buf_len = 0;
            }
        }
        */
        
    }
}