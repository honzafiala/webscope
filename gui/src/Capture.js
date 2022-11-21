import React, {useEffect, useState} from 'react';

export default function Capture({captureConfig, setCaptureConfig, captureState, setCaptureState, setCaptureData, USBDevice}) {
const [complete, setComplete] = useState(true);

async function readSingle() {
        // Send capture configuration to the device
        let captureConfigMessage = captureConfigToByteArray(captureConfig);    
        await USBDevice.transferOut(3, captureConfigMessage);
    
        let result;
    
        // Wait for capture status message from the device
        // Status can be either OK = 0, Aborted = 1 or Timeout = 2
        result = await pollUSB(1);
        let captureStatus = result.data.getUint8();
        console.log('Capture status', captureStatus);
        if (captureStatus != 0) {
          console.log("Capture was aborted!");
          return;
        }
    
        // Read trigger index and parse
        result = await pollUSB(1);
        let trigIndex = result.data.getUint32(0, true);
        console.log('trigger:', trigIndex);
        
    
        result = await USBDevice.transferIn(3, captureConfig.captureDepth * captureConfig.numActiveChannels);
        console.log('captured data', result);
    
        let rawData = [];
        for (let i = 0; i < captureConfig.captureDepth * captureConfig.numActiveChannels; i++) 
        rawData.push(result.data.getUint8(i));

        trigIndex -= trigIndex % captureConfig.numActiveChannels;
        
        let rawShiftedData = rawData;
        //let rawShiftedData = rawData.slice(trigIndex).concat(rawData.slice(0, trigIndex));

        let parsedData = [[],[],[]];
        let i = 0;
        while (i < captureConfig.captureDepth * captureConfig.numActiveChannels) {
          if (captureConfig.activeChannels[0]) {
            parsedData[0].push(rawShiftedData[i]);
            i++;
          }
          if (captureConfig.activeChannels[1]) {
            parsedData[1].push(rawShiftedData[i]);
            i++;
          }
          if (captureConfig.activeChannels[2]) {
            parsedData[2].push(rawShiftedData[i]);
            i++;
          }
        }

        console.log(captureConfig);
        console.log(parsedData);
        setCaptureData(parsedData);
    
        setComplete(true);
        return true;
}

function captureConfigToByteArray(captureConfig) {
    let activeChannelsByte = 0;
    for (let i = 0; i < captureConfig.activeChannels.length; i++) {
        if (captureConfig.activeChannels[i]) activeChannelsByte += 1 << i;
    }

    let captureDepth_kb = captureConfig.captureDepth / 1000;

    let pretriggerByte = captureConfig.preTrigger * 10;

    let captureModeByte = captureConfig.captureMode == "Auto" ? 1 : 0;

    let sampleRateByte = captureConfig.sampleRate / 1000;
    return new Uint8Array([
        1, 
        captureConfig.trigger.threshold, 
        activeChannelsByte, 
        captureDepth_kb, 
        pretriggerByte, 
        captureModeByte, 
        sampleRateByte
    ]);
}

function abortCapture() {
    let abortMessage = new Uint8Array([0]);
    USBDevice.transferOut(3, abortMessage);

    setCaptureState({...captureState, running: false});
  }

  useEffect(() => {
    if (complete && captureState.running) {
      setComplete(false);
      readSingle();
    }
  }, [complete, captureState]);

function toggleCaptureMode() {
    let newCaptureMode = captureConfig.captureMode == "Auto" ? "Normal" : "Auto";
    setCaptureConfig({...captureConfig, captureMode: newCaptureMode});
  }

async function pollUSB(len) {
    let result
    do {
    result = await USBDevice.transferIn(3, 4);
    await new Promise(res => setTimeout(res, 50));
    } while (result.data.byteLength == 0);
    return result;
}

console.log(USBDevice);

    return (
        <div>
        <button onClick={() => setCaptureState({...captureState, running: true})} disabled={USBDevice == null}>Run</button>
        <button onClick={readSingle} disabled={USBDevice == null}>Single</button>
        <button onClick={abortCapture}>Stop</button>
        <button onClick={toggleCaptureMode}>{captureConfig.captureMode}</button>
      </div>
    );
}