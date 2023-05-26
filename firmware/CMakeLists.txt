cmake_minimum_required(VERSION 3.13)


include(pico_sdk_import.cmake)

set(FAMILY rp2040)

include(/home/honza/tinyusb/hw/bsp/family_support.cmake)

project(webscope_fw)


pico_sdk_init()

add_executable(webscope_fw
	main.c
	usb_descriptors.c
	driver.c
	core1_task.c
)

target_include_directories(webscope_fw PRIVATE ${CMAKE_CURRENT_LIST_DIR})

target_link_libraries(webscope_fw PRIVATE pico_stdlib tinyusb_device tinyusb_board hardware_adc hardware_dma hardware_pwm pico_multicore)
pico_add_extra_outputs(webscope_fw)