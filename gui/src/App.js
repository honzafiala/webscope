import React, {useEffect, useState} from 'react';
import './App.css';
import WebglAppSin from "./webglAppSin";
import ChannelControl from './ChannelControl';
import getDummyData from './dummyData';
import HorizontalControl from './HorizontalControl';
import CanvasPlot from './CanvasPlot';
import CursorControl from './CursorControl';
import TriggerControl from './TriggerControl';
import Floating from './Floating';
import CaptureControl from './CaptureControl';

let defaultCaptureConfig = {
  activeChannels: [true, true, false],
  numActiveChannels: 2,
  channelColors: ['#d4c84e', '#E78787'],
  trigger: {
    channels: [true, false], 
    threshold: 77, // 1 V
    edge: "UP"
  },
  preTrigger: 0.1,
  sampleRate: 250000,
  captureDepth: 10000
};

let defaultCaptureData = [[], []];


let defaultViewConfig = {
  visibleChannels: [true, true, false],
  vertical: [
    {offset: 0, zoom: 1}, 
    {offset: 0, zoom: 1},
    {offset: 0, zoom: 1}
  ],
  horizontal: {
    zoom: 1,
    offset: 0,
    viewCenter: defaultCaptureConfig.captureDepth / 2
  },
  grid: true
}

let defaultCursorConfig = {
  cursorX: {
    visible: false,
    start: 0,
    end: defaultCaptureConfig.captureDepth
  }
}


export default function App() {
  let [captureConfig, setCaptureConfig] = useState(defaultCaptureConfig);
  let [viewConfig, setViewConfig] = useState(defaultViewConfig);
  let [captureData, setCaptureData] = useState(defaultCaptureData);
  let [cursorConfig, setCursorConfig] = useState(defaultCursorConfig);
  let [USBDevice, setUSBDevice] = useState(null);


  async function connectDevice() {
    let device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x0 }] });
    await device.open();
    await device.claimInterface(0);

    setUSBDevice(device);

    // "Dummy" IN transfer
    let result = await device.transferIn(1, 4);

  }

  function captureConfigToByteArray(captureConfig) {
    let activeChannelsByte = 0;
    for (let i = 0; i < captureConfig.activeChannels.length; i++) {
      if (captureConfig.activeChannels[i]) activeChannelsByte += 1 << i;
    }

    let captureLengthDiv = 100000 / captureConfig.captureDepth;

    let pretriggerByte = captureConfig.preTrigger * 10;

    return new Uint8Array([captureConfig.trigger.threshold, activeChannelsByte, captureLengthDiv, pretriggerByte]);
  }
  

 async function pollUSB(len) {
  let result
  do {
    result = await USBDevice.transferIn(1, 4);
    await new Promise(res => setTimeout(res, 50));
  } while (result.data.byteLength == 0);
  return result;
 }

  async function readSingle() {
    // Send capture configuration to the device
    let captureConfigMessage = captureConfigToByteArray(captureConfig);    
    await USBDevice.transferOut(1, captureConfigMessage);

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
    

    result = await USBDevice.transferIn(1, captureConfig.captureDepth * captureConfig.numActiveChannels);
    console.log('captured data', result);

    let rawData = [];
    for (let i = 0; i < captureConfig.captureDepth * captureConfig.numActiveChannels; i++) 
      rawData.push(result.data.getUint8(i));
    let rawShiftedData = rawData.slice(trigIndex).concat(rawData.slice(0, trigIndex));
    

    let parsedData = [[],[]];
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
    }

    setCaptureData(parsedData);

    setComplete(true);
    return true;
  }

  function abortCapture() {
    let abortMessage = new Uint8Array([0]);
    USBDevice.transferOut(1, abortMessage);
  }

  const [complete, setComplete] = useState(true);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (complete && running) {
      setComplete(false);
      readSingle();
    }
  }, [complete, running]);


  return (
    <div className='root'>
      {cursorConfig.cursorX.visible && <Floating/>}
    <div className="app">
      <div className="topbar">
      

        <button onClick={connectDevice}><span role="img" aria-label="dog">{USBDevice == null ? "❌ Connect device" : "✅ Connected"} </span></button>
        <button onClick={readSingle} disabled={USBDevice == null}>Single</button>

        <button onClick={() => setViewConfig({...viewConfig, grid: !viewConfig.grid})}>Toggle grid</button>

        <button onClick={() => setRunning(!running)}>{running ? "RUNNING" : "STOPPED"}</button>

        <button onClick={abortCapture}>Abort</button>

        <CaptureControl captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}/>

        </div>
      <div className="main">
        <CanvasPlot data={captureData} viewConfig={viewConfig} cursorConfig={cursorConfig} captureConfig={captureConfig}/>

        <div className='side'>
          <ChannelControl number="1" color="#FFF735" captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}
          viewConfig={viewConfig} setViewConfig={setViewConfig}/>
          <ChannelControl number="2" color="#E78787" captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}
          viewConfig={viewConfig} setViewConfig={setViewConfig}/>

      <ChannelControl number="3" color="#68E05D" captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}
          viewConfig={viewConfig} setViewConfig={setViewConfig}/>

          <CursorControl cursorConfig={cursorConfig} viewConfig={viewConfig} captureConfig={captureConfig} setCursorConfig={setCursorConfig}/>
          <HorizontalControl captureConfig={captureConfig} viewConfig={viewConfig} setViewConfig={setViewConfig}/>
          <TriggerControl captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}/>
         
        </div>
      </div>
      </div>
    </div>
  );
}