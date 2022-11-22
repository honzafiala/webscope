import React, {useEffect, useState} from 'react';
import './App.css';
import ChannelControl from './ChannelControl';
import HorizontalControl from './HorizontalControl';
import CanvasPlot from './CanvasPlot';
import CursorControl from './CursorControl';
import TriggerControl from './TriggerControl';
import Floating from './Floating';
import CaptureControl from './SamplingControl';
import Capture from './Capture';
import MultiRangeSlider from './MultiRangeSlider';
import CaptureSave from './CaptureSave';

let defaultCaptureConfig = {
  activeChannels: [true, false, false],
  channelColors: ['#d4c84e', '#E78787', '#68e05d'],
  trigger: {
    channels: [true, false, false], 
    threshold: 77, // 1 V
    edge: "UP"
  },
  preTrigger: 0.1,
  sampleRate: 500000,
  captureDepth: 10000,
  captureMode: "Auto"
};

let defaultCaptureData = [[], [], []];


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
    visible: false,
    start: 0,
    end: defaultCaptureConfig.captureDepth,
    channel: 0
}


let defaultCaptureState = "Stopped";

let defaultAppState = {
  menu: false
}


export default function App() {
  let [captureConfig, setCaptureConfig] = useState(defaultCaptureConfig);
  let [savedCaptureConfig, setSavedCaptureConfig] = useState(defaultCaptureConfig);
  let [viewConfig, setViewConfig] = useState(defaultViewConfig);
  let [captureData, setCaptureData] = useState(defaultCaptureData);
  let [cursorConfig, setCursorConfig] = useState(defaultCursorConfig);
  let [USBDevice, setUSBDevice] = useState(null);
  let [captureState, setCaptureState] = useState(defaultCaptureState);
  let [appState, setAppState] = useState(defaultAppState);


  async function connectDevice() {
    let device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0xcafe }] });
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(2);
    setUSBDevice(device);

    // "Dummy" IN transfer
    let result = await device.transferIn(3, 4);

  }




  return (
    <div className='root'>
      {cursorConfig.visible && <Floating captureConfig={captureConfig} captureData={captureData} cursorConfig={cursorConfig}/>}
    <div className="app">
      <div className="topbar">
        <div className='leftMenu'>
        <button onClick={connectDevice}
        style={USBDevice != null ? {backgroundColor: "#1fa924", color: 'lightgray', boxShadow: "0px 0px 5px #1fa924"} : {}}>
          {USBDevice == null ? "Connect device" : "Connected"}
          </button>
       
        <Capture 
          captureConfig={captureConfig} 
          setCaptureConfig={setCaptureConfig}
          setSavedCaptureConfig={setSavedCaptureConfig}
          captureState={captureState} 
          setCaptureState={setCaptureState}  
          USBDevice={USBDevice} 
          setCaptureData={setCaptureData}
          />
        
        <CaptureControl captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}/>
        
        <button onClick={() => setViewConfig({...viewConfig, grid: !viewConfig.grid})}>Toggle grid</button>
        </div>
        <div className='rightMenu'>
        <button onClick={() => setAppState({...appState, menu : !appState.menu})}>{appState.menu ? "> > >" : "< < <"}</button>

        </div>

      </div>
      <div className="main">
        <CanvasPlot 
          data={captureData} 
          viewConfig={viewConfig} 
          cursorConfig={cursorConfig} 
          captureConfig={savedCaptureConfig}
        />
        {cursorConfig.visible && <MultiRangeSlider cursorConfig={cursorConfig} viewConfig={viewConfig} 
        captureConfig={captureConfig} setCursorConfig={setCursorConfig}/>}

        <div className='side'>
          {appState.menu ?  
          <div style={{backgroundColor: "#D9D9D9",  margin: "5px", padding: "5px", borderRadius: "10px"}}>
            <div>Save</div>
            <div>View</div>
            <hr/>
            <div>User manual</div>
            <div>Firmware</div>
            <div>Demo capture</div>
            <hr/>
            <div>WebScope</div>
            <div>Version 1.0</div>
            <hr/>
            <div>Czech Technical University in Prague</div>
            <div>Department of Measurement</div>
            <img src="./cvut_logo.png" width="100%"></img>
            <CaptureSave captureData={captureData} captureConfig={captureConfig}/>
          </div>
          :
          <div>
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
          }
        </div>
      </div>
      </div>
    </div>
  );
}