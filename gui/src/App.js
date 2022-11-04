import React, {useEffect, useState} from 'react';
import './App.css';
import WebglAppSin from "./webglAppSin";
import ChannelControl from './ChannelControl';
import getDummyData from './dummyData';
import HorizontalControl from './HorizontalControl';
import CanvasPlot from './CanvasPlot';
import CursorControl from './CursorControl';
import TriggerControl from './TriggerControl';


let defaultCaptureConfig = {
  activeChannels: [true, true],
  trigger: {
    channels: [true, false], 
    threshold: 128,
    edge: "UP"
  },
  preTrigger: 0.5,
  sampleRate: 500000,
  captureDepth: 200000
};

let defaultCaptureData = [[], []];


let defaultViewConfig = {
  visibleChannels: [true, true],
  vertical: [
    {offset: 0, zoom: 1}, 
    {offset: 0, zoom: 1}
  ],
  horizontal: {
    zoom: 1,
    offset: 0,
    viewStartIndex: 0,
    viewEndIndex: defaultCaptureConfig.captureDepth / 2
  },
  grid: true
}


export default function App() {
  let [data, setData] = useState([]);
  let [config, setConfig] = useState({
    grid: true, 
    clk: 128, 
    zoom: 1,
    offset: 0,
  verticalZoom: 1});

  let [captureConfig, setCaptureConfig] = useState(defaultCaptureConfig);
  let [viewConfig, setViewConfig] = useState(defaultViewConfig);
  let [captureData, setCaptureData] = useState(defaultCaptureData);
  let [USBDevice, setUSBDevice] = useState(null);


  async function connectDevice() {
    let device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x0 }] });
    await device.open();
    await device.claimInterface(0);

    setUSBDevice(device);

    // "Dummy" IN transfer
    let result = await device.transferIn(1, 4);

  }

  
async function readContinuous() {
  while (true) await readSingle();
}


  async function readSingle() {

    // Send capture start command
    let buf = new Uint8Array([captureConfig.trigger.threshold, 2, 3, 4]);
    let status = await USBDevice.transferOut(1, buf);
    console.log(status);

    let result;

    // Read trigger index and parse
    do {
      result = await USBDevice.transferIn(1, 4);
      await new Promise(res => setTimeout(res, 50));
    } while (result.data.byteLength == 0);
    let trigIndex = result.data.getUint32(0, true);
    console.log('trigger:', trigIndex);
    

    result = await USBDevice.transferIn(1, captureConfig.captureDepth);
    console.log('captured data', result);

    let rawData = [];
    for (let i = 0; i < captureConfig.captureDepth; i++) rawData.push(result.data.getUint8(i));
    let rawShiftedData = rawData.slice(trigIndex).concat(rawData.slice(0, trigIndex));
    

    let parsedData = [[],[]];
    let i = 0;
    while (i < captureConfig.captureDepth) {
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
    return true;
  }

  function toggleGrid() {
    setViewConfig({...viewConfig, grid: !viewConfig.grid});
  }

  return (
    <div className="root">
      <div className="topbar">
      <span role="img" aria-label="dog">{USBDevice == null ? "❌" : "✅"} </span>
      
        <button onClick={connectDevice}>Request device</button>
        <button onClick={readContinuous} disabled={USBDevice == null}>read continuous</button>
        <button onClick={readSingle} disabled={USBDevice == null}>read single</button>

        <button onClick={toggleGrid}>Grid</button>

        </div>
      <div className="main">
        <CanvasPlot data={captureData} viewConfig={viewConfig} captureConfig={captureConfig}/>

        <div className='side'>
          <ChannelControl number="1" color="#FFF735" active="true"/>
          <ChannelControl number="2" color="#E78787" active="true"/>
          <HorizontalControl captureConfig={captureConfig} viewConfig={viewConfig} setViewConfig={setViewConfig}/>
          <CursorControl/>
          <TriggerControl/>
         
        </div>
      </div>

    </div>
  );
}