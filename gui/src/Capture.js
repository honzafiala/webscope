import React, {useEffect, useState} from 'react';
import {getNumActiveChannels, formatValue} from './Utils';
import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";

export default function Capture({captureConfig, setCaptureConfig, savedCaptureConfig, setSavedCaptureConfig, captureState, setCaptureState, setCaptureData, USBDevice, generatorConfig}) {
  const [complete, setComplete] = useState(true);
  const [savedGeneratorConfig, setSavedGeneratorConfig] = useState(generatorConfig);
  let [abortedByConfigChange, setAbortedByConfigChange] = useState(false);
  let [singleCaptureStopped, setSingleCaptureStopped] = useState(false);

async function readSingle() {
  try {
        // Set the current captureConfig as savedCaptureConfig
        // A deep copy needs to be created
        setSavedCaptureConfig(JSON.parse(JSON.stringify(captureConfig)));
        let localSavedConfig = cloneDeep(captureConfig);
        setSavedGeneratorConfig(JSON.parse(JSON.stringify(generatorConfig)));
        console.log('readSingle: Requesting capture');
        console.log(cloneDeep(captureConfig));

        // Send PWM configuration to the device
        let generatorConfigMessage = generatorConfigToByteArray(generatorConfig);
        await USBDevice.transferOut(3, generatorConfigMessage);


        // Send capture configuration to the device
        let captureConfigMessage = captureConfigToByteArray(localSavedConfig);    

        console.log(captureConfigMessage[7], captureConfigMessage[8], captureConfig.sampleRateDiv);

        await USBDevice.transferOut(3, captureConfigMessage);


        let result;
    
        // Wait for capture status message from the device
        // Status can be either OK = 0, Aborted = 1 or Timeout = 2
        result = await pollUSB(1);
        let captureStatus = result.data.getUint8();
        if (captureStatus != 0) {
          console.log("readSingle: Capture was aborted!");
          setComplete(true);
          return Promise.resolve(true);
        }
    
        // Read trigger index and parse
        result = await pollUSB(1);
        let trigIndex = result.data.getUint32(0, true);
        
        result = await USBDevice.transferIn(3, localSavedConfig.captureDepth * getNumActiveChannels(localSavedConfig) * 2);
        console.log('reply:', result);

        let rawData = [];
        for (let i = 0; i < localSavedConfig.captureDepth * getNumActiveChannels(localSavedConfig) * 2; i+=2) 
        rawData.push(result.data.getUint16(i, true));

        trigIndex -= trigIndex % getNumActiveChannels(localSavedConfig);
        
        //let rawShiftedData = rawData;
        let rawShiftedData = rawData.slice(trigIndex).concat(rawData.slice(0, trigIndex));

        let parsedData = [[],[],[]];
        let i = 0;

        // This solves the issue with channel order being swapped in the capture buffer when activeChannels = [0, 1, 1]
        if (!localSavedConfig.activeChannels[0] && localSavedConfig.activeChannels[1] && localSavedConfig.activeChannels[2])
          while (i < localSavedConfig.captureDepth * getNumActiveChannels(localSavedConfig)) {
            parsedData[2].push(rawShiftedData[i++]);
            parsedData[1].push(rawShiftedData[i++]);
          }
        else 
          while (i < localSavedConfig.captureDepth * getNumActiveChannels(localSavedConfig)) {
            if (localSavedConfig.activeChannels[0]) {
              parsedData[0].push(rawShiftedData[i]);
              i++;
            }
            if (localSavedConfig.activeChannels[1]) {
              parsedData[1].push(rawShiftedData[i]);
              i++;
            }
            if (localSavedConfig.activeChannels[2]) {
              parsedData[2].push(rawShiftedData[i]);
              i++;
            }
          }

        setCaptureData(parsedData);

      } catch (error) {
        console.log("Capture failed:", error);
        setCaptureState("Stopped");
      }

        setComplete(true);
        return Promise.resolve(true);
}

function captureConfigToByteArray(cfg) {
  let activeChannelsByte = 0;
    for (let i = 0; i < cfg.activeChannels.length; i++) {
        if (cfg.activeChannels[i]) activeChannelsByte += 1 << i;
    }
    let captureDepth_kb = cfg.totalCaptureDepth / 1000;

    let pretriggerByte = cfg.preTrigger * 10;

    let captureModeByte = cfg.captureMode == "Auto" ? 1 : 0;

    let divBytes = [cfg.sampleRateDiv >> 8, cfg.sampleRateDiv & 0xFF];

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
        divBytes[0],
        divBytes[1],
        triggerChannelsByte,
        triggerEdgeByte
    ]);
}

function generatorConfigToByteArray(generatorConfig) {
  let wrapBytes = [(generatorConfig.wrap - 1) >> 8, (generatorConfig.wrap - 1) & 0xFF];
  let divBytes = [generatorConfig.div >> 8, generatorConfig.div & 0xFF];
  return new Uint8Array([
      2, // Id of generator config message
      wrapBytes[0],
      wrapBytes[1],
      divBytes[0],
      divBytes[1],
      generatorConfig.duty,
      generatorConfig.active
  ]);
}

function abortCapture() {
    let abortMessage = new Uint8Array([0]);
    return USBDevice.transferOut(3, abortMessage);
  }

  useEffect(() => {
    const capture = async () => {

      if (!complete && !abortedByConfigChange
          && (!isEqual(savedCaptureConfig, captureConfig) || !isEqual(savedGeneratorConfig, generatorConfig)) 
          && savedCaptureConfig.captureMode == "Normal"
        ) {
        console.log("useEffect: Capture config changed. Aborting.");
        await abortCapture();
        setAbortedByConfigChange(true);
        abortedByConfigChange = true;
     //   setComplete(false);
     //   await readSingle();
      } else {
        if (complete && captureState == "Run") {
          setComplete(false);
          readSingle();
          setAbortedByConfigChange(false);
          abortedByConfigChange = false;
        }
         else if (complete && singleCaptureStopped) {
          if (!abortedByConfigChange) setCaptureState("Stopped");
          setAbortedByConfigChange(false);
          abortedByConfigChange = false;

          singleCaptureStopped = false;
          setSingleCaptureStopped(false);

        } else if (complete && captureState == "Single") {
          setComplete(false);
          await readSingle();

          singleCaptureStopped = true;
          setSingleCaptureStopped(true);

        }
    }
  }
  capture();
  }, [complete, captureState, captureConfig, savedCaptureConfig, generatorConfig, savedGeneratorConfig, abortedByConfigChange, singleCaptureStopped]);

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
      <div className="mx-1 my-1 pointer-events-auto flex flex-row divide-x divide-slate-400 overflow-hidden rounded-md text-l leading-5 text-slate-700 border border-slate-400 shadow">
       
       
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
          onClick={() => {abortCapture(); setCaptureState("Stopped");}} 
          className={`text-center py-[2px] px-1 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300
          ${captureState == "Stopped" ? "bg-red-600 text-slate-100" : "text-slate-700"}`}>
          {captureState == "Stopped" ? "Stopped" : "Stop"}
        </div>
      </div>  
      <div className="mx-1 my-1 pointer-events-auto flex flex-row divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-l leading-5 text-slate-700 border border-slate-400 shadow">
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
}