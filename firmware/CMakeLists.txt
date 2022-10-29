cmake_minimum_required(VERSION 3.13)

#set(TINYUSB_DEBUG_LEVEL 2)

include(pico_sdk_import.cmake)

project(usbtest_project)

pico_sdk_init()

add_executable(usbtest
	main.c
	usb_descriptors.c
	driver.c
	core1_task.c
)

target_include_directories(usbtest PRIVATE ${CMAKE_CURRENT_LIST_DIR})

target_link_libraries(usbtest PRIVATE pico_stdlib tinyusb_device tinyusb_board hardware_adc hardware_dma hardware_pwm pico_multicore)
pico_add_extra_outputs(usbtest)
