#include "jsmn.h"

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

