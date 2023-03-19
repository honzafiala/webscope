import React, {useEffect, useState} from 'react';
import {getNumActiveChannels, formatValue} from './Utils';

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
        
        console.log('requesting bytes', savedCaptureConfig.captureDepth * getNumActiveChannels(savedCaptureConfig) * 2);
        result = await USBDevice.transferIn(3, savedCaptureConfig.captureDepth * getNumActiveChannels(savedCaptureConfig) * 2);
        console.log('reply:', result);

        let rawData = [];
        for (let i = 0; i < savedCaptureConfig.captureDepth * getNumActiveChannels(savedCaptureConfig) * 2; i+=2) 
        rawData.push(result.data.getUint16(i, true));

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

function toUintBytes(num, bytes) {
  let byteArray = []
  for (let i = bytes - 1; i >= 0; i--) {
    byteArray.push((num >> (8 * i)) & 0xFF);
  }
  return byteArray;
}


function captureConfigToByteArray(cfg) {

  console.log('converted:', toUintBytes(0x010203FF, 4));


  let activeChannelsByte = 0;
    for (let i = 0; i < cfg.activeChannels.length; i++) {
        if (cfg.activeChannels[i]) activeChannelsByte += 1 << i;
    }
    let captureDepth_kb = cfg.totalCaptureDepth / 1000;

    let pretriggerByte = cfg.preTrigger * 10;

    let captureModeByte = cfg.captureMode == "Auto" ? 1 : 0;

    let sampleRateBytes = toUintBytes(cfg.sampleRate, 4);

    let triggerChannelsByte = 0;
    for (let i = 0; i < cfg.trigger.channels.length; i++) {
        if (cfg.trigger.channels[i]) triggerChannelsByte += 1 << i;
    }

    let triggerEdgeByte;
    if (captureConfig.trigger.edge == "Rise") triggerEdgeByte = 0;
    else if (captureConfig.trigger.edge == "Fall") triggerEdgeByte = 1;
    else triggerEdgeByte = 2;

    let trigger12Bit =  Math.round(4096 * cfg.trigger.threshold / 3.3);
    let thresholdBytes = [trigger12Bit >> 8, trigger12Bit & 0xFF];

    return new Uint8Array([
        1, 
        thresholdBytes[0],
        thresholdBytes[1], 
        activeChannelsByte, 
        captureDepth_kb, 
        pretriggerByte, 
        captureModeByte, 
        sampleRateBytes[0],
        sampleRateBytes[1],
        sampleRateBytes[2],
        sampleRateBytes[3],
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

function setCaptureMode(mode) {
    setCaptureConfig({...captureConfig, captureMode: mode});
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
      <div className='flex flex-row text-l'>
      <div className="mx-1 my-1 pointer-events-auto flex flex-row divide-x divide-slate-400/20 overflow-hidden rounded-md text-l leading-5 text-slate-700 border border-slate-300 shadow">
       
       
        <button 
          onClick={() => {setCaptureState("Run"); setCaptureData([[], [], []])}} 
          disabled={USBDevice == null}
          className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 disabled:text-slate-400
          ${captureState == "Run" ? "bg-blue-600 text-slate-100" : "text-slate-700"}`}>
          {captureState == "Run" ? "Running" : "Run"}
        </button>
        <button 
          onClick={() => {setCaptureState("Single"); setCaptureData([[], [], []])}} 
          disabled={USBDevice == null}
          className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 disabled:text-slate-400
          ${captureState == "Single" ? "bg-blue-600 text-slate-100" : "text-slate-700"}`}>
          Single
        </button>
        <div 
          onClick={abortCapture} 
          className={`text-center py-[2px] px-1 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300
          ${captureState == "Stopped" ? "bg-red-600 text-slate-100" : "text-slate-700"}`}>
          {captureState == "Stopped" ? "Stopped" : "Stop"}
        </div>
      </div>  
      <div className="mx-1 my-1 pointer-events-auto flex flex-row divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-l leading-5 text-slate-700 border border-slate-300 shadow">
      <div 
        onClick={() => {setCaptureMode("Auto")}} 
        disabled={USBDevice == null}
        className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300
        ${captureConfig.captureMode == "Auto" ? " bg-slate-300" : "text-slate-700"}`}>
        Auto
      </div>
     
      <div 
        onClick={() => setCaptureMode("Normal")} 
        className={`text-center py-[2px] px-1 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300
        ${captureConfig.captureMode == "Normal" ? " bg-slate-300" : "text-slate-700"}`}>
        Normal
      </div>
      </div>  
</div>  


      
    );


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