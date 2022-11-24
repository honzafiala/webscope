import React, {useEffect, useState} from 'react';
import getNumActiveChannels from './Utils';

export default function Capture({captureConfig, setCaptureConfig, setSavedCaptureConfig, captureState, setCaptureState, setCaptureData, USBDevice}) {
const [complete, setComplete] = useState(true);

async function readSingle() {
  try {
        // Set the current captureConfig as savedCaptureConfig
        // A deep copy needs to be created
        let savedCaptureConfig = JSON.parse(JSON.stringify(captureConfig));
        setSavedCaptureConfig(savedCaptureConfig);
        console.log('Requesting capture:', JSON.stringify(savedCaptureConfig));

        // Send capture configuration to the device
        let captureConfigMessage = captureConfigToByteArray(savedCaptureConfig);    
        console.log("encoded request:", captureConfigMessage);

        await USBDevice.transferOut(3, captureConfigMessage);
    
        let result;
    
        // Wait for capture status message from the device
        // Status can be either OK = 0, Aborted = 1 or Timeout = 2
        result = await pollUSB(1);
        let captureStatus = result.data.getUint8();
        console.log('Capture status', captureStatus);
        if (captureStatus != 0) {
          console.log("Capture was aborted!");
          setComplete(true);
          return;
        }
    
        // Read trigger index and parse
        result = await pollUSB(1);
        let trigIndex = result.data.getUint32(0, true);
        console.log('trigger:', trigIndex); 
        
        console.log('requesting bytes', savedCaptureConfig.captureDepth * getNumActiveChannels(savedCaptureConfig));
        result = await USBDevice.transferIn(3, savedCaptureConfig.captureDepth * getNumActiveChannels(savedCaptureConfig));
        console.log('reply:', result);

        let rawData = [];
        for (let i = 0; i < savedCaptureConfig.captureDepth * getNumActiveChannels(savedCaptureConfig); i++) 
        rawData.push(result.data.getUint8(i));

        trigIndex -= trigIndex % getNumActiveChannels(savedCaptureConfig);
        
        //let rawShiftedData = rawData;
        let rawShiftedData = rawData.slice(trigIndex).concat(rawData.slice(0, trigIndex));

        let parsedData = [[],[],[]];
        let i = 0;

        // This solves the issue with channel order being swapped in the capture buffer when activeChannels = [0, 1, 1]
        if (!savedCaptureConfig.activeChannels[0] && savedCaptureConfig.activeChannels[1] && savedCaptureConfig.activeChannels[2])
          while (i < savedCaptureConfig.captureDepth * getNumActiveChannels(savedCaptureConfig)) {
            parsedData[2].push(rawShiftedData[i++]);
            parsedData[1].push(rawShiftedData[i++]);
          }
        else 
          while (i < savedCaptureConfig.captureDepth * getNumActiveChannels(savedCaptureConfig)) {
            if (savedCaptureConfig.activeChannels[0]) {
              parsedData[0].push(rawShiftedData[i]);
              i++;
            }
            if (savedCaptureConfig.activeChannels[1]) {
              parsedData[1].push(rawShiftedData[i]);
              i++;
            }
            if (savedCaptureConfig.activeChannels[2]) {
              parsedData[2].push(rawShiftedData[i]);
              i++;
            }
          }

        console.log(parsedData);
        setCaptureData(parsedData);

      } catch (error) {
        console.log("Capture failed:", error);
        setCaptureState("Stopped");
      }

        setComplete(true);
        return true;
}

function captureConfigToByteArray(cfg) {
  let activeChannelsByte = 0;
    for (let i = 0; i < cfg.activeChannels.length; i++) {
        if (cfg.activeChannels[i]) activeChannelsByte += 1 << i;
    }
    let captureDepth_kb = cfg.captureDepth / 1000;

    let pretriggerByte = cfg.preTrigger * 10;

    let captureModeByte = cfg.captureMode == "Auto" ? 1 : 0;

    let sampleRateByte = cfg.sampleRate / 10000;

    let triggerChannelsByte = 0;
    for (let i = 0; i < cfg.trigger.channels.length; i++) {
        if (cfg.trigger.channels[i]) triggerChannelsByte += 1 << i;
    }

    let triggerEdgeByte;
    if (captureConfig.trigger.edge == "UP") triggerEdgeByte = 0;
    else if (captureConfig.trigger.edge == "DOWN") triggerEdgeByte = 1;
    else triggerEdgeByte = 2;


    return new Uint8Array([
        1, 
        cfg.trigger.threshold, 
        activeChannelsByte, 
        captureDepth_kb, 
        pretriggerByte, 
        captureModeByte, 
        sampleRateByte,
        triggerChannelsByte,
        triggerEdgeByte
    ]);
}

function abortCapture() {
    let abortMessage = new Uint8Array([0]);
    USBDevice.transferOut(3, abortMessage);

    setCaptureState("Stopped");
  }

  useEffect(() => {
    const capture = async () => {
    if (complete && captureState == "Run") {
      setComplete(false);
      readSingle();
    }
    else if (complete && captureState == "Single") {
      setComplete(false);
      await readSingle();
      console.log("Stop.");
      setCaptureState("Stopped");
    }
  }
  capture();
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

    return (
        <div>
        <button 
          onClick={() => {setCaptureState("Run"); setCaptureData([[], [], []])}} 
          disabled={USBDevice == null}
          style={captureState == "Run" ? {backgroundColor: "#0076fa", color: 'lightgray', boxShadow: "0px 0px 5px #0076fa"} : {}}
        >
        {captureState == "Run" ? "Running" : "Run"}</button>


        <button onClick={() => {setCaptureState("Single"); setCaptureData([[], [], []])}} disabled={USBDevice == null}
        style={captureState == "Single" ? {backgroundColor: "#0076fa", color: 'lightgray', boxShadow: "0px 0px 5px #0076fa"} : {}}
        >Single</button>
        
        <button 
          onClick={abortCapture} 
          style={captureState == "Stopped" ? {backgroundColor: "#e10f00", color: 'lightgray', boxShadow: "0px 0px 5px #e10f00"} : {}}
        >{captureState == "Stopped" ? "Stopped" : "Stop"}</button>

        <button onClick={toggleCaptureMode}>{captureConfig.captureMode}</button>
      </div>
    );
}