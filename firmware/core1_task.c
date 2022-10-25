#include "bsp/board.h"
#include "tusb.h"
#include <stdio.h>
#include "pico/stdlib.h"
#include "hardware/dma.h"

#include "tusb_option.h"

#include "device/usbd_pvt.h"
#include "pico/stdlib.h"


extern volatile int dma_active;

volatile uint8_t * send_buf;
volatile uint send_buf_len;

extern uint _bulk_in;

void usb_send(uint8_t * buf, uint size) {
    printf("booboo %p %d\n", buf, size);
    send_buf = buf;
    send_buf_len = size;
    while (send_buf_len);
}

static volatile uint usb_rec_bytes = 0;
uint usb_rec(uint8_t * buf, uint max_len) {
//    while (usbd_edpt_busy(0, _bulk_out));
//    while(!usbd_edpt_xfer(0, _bulk_out, buf, max_len));
 //   return usb_rec_bytes;
 return 0;
}


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