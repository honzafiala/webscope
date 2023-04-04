import React, {useEffect, useState} from 'react';
import './App.css';
import ChannelControl from './ChannelControl';
import HorizontalControl from './HorizontalControl';
import CanvasPlot from './CanvasPlot';
import CursorControl from './CursorControl';
import TriggerControl from './TriggerControl';
import CaptureDepthAndSampleRateConfig from './CaptureDepthAndSampleRateConfig';
import Capture from './Capture';
import CursorSliderOverlay from './CursorSliderOverlay';
import ConnectDevice from './ConnectDevice';
import GeneratorControl from './GeneratorControl';
import PopUpWindow from './PopUpWindow';

import logo from './symbol_cvut_konturova_verze_cb.svg';
import AppMenu from './AppMenu';


let defaultCaptureConfig = {
  activeChannels: [true, false, false],
  channelColors: ['#eab308', '#E78787', '#68e05d'],
  trigger: {
    channels: [true, false, false], 
    threshold: 1,
    edge: "Rise"
  },
  preTrigger: 0.1,
  sampleRate: 500000,
  sampleRateDiv: 96,
  captureDepth: 10000,
  totalCaptureDepth: 10000,
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
    channel: 1,
    x: {
      visible: false,
      start: 5.0,
      end: 95.0
    },
    y: {
      visible: false,
      start: 5.0,
      end: 95.0
    }
}


let defaultGeneratorConfig = {
  active: false,
  realFrequency: 1000,
  setFrequency: 1000,
  duty: 50,
  wrap: 12500,
  div: 10,
  sysClk: 125000000
}



let defaultCaptureState = "Stopped";




export default function App() {
  let [captureConfig, setCaptureConfig] = useState(defaultCaptureConfig);
  let [savedCaptureConfig, setSavedCaptureConfig] = useState(defaultCaptureConfig);
  let [viewConfig, setViewConfig] = useState(defaultViewConfig);
  let [generatorConfig, setGeneratorConfig] = useState(defaultGeneratorConfig);

  let [captureData, setCaptureData] = useState(defaultCaptureData);
  let [cursorConfig, setCursorConfig] = useState(defaultCursorConfig);
  let [USBDevice, setUSBDevice] = useState(null);
  let [captureState, setCaptureState] = useState(defaultCaptureState);
  let [welcomeWindowActive, setWelcomeWindowActive] = useState(true);


  async function connect() {
    let device = await navigator.usb.requestDevice({
      filters: [{ vendorId: 0xcafe }] 
    });
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(2);
    setUSBDevice(device);

    navigator.usb.addEventListener('disconnect', event => {
      setUSBDevice(null);
      setCaptureState("Stopped");
    });

    // "Dummy" IN transfer
    let result = await device.transferIn(3, 4);
    

    // Out transfer - abort capture
    let abortMessage = new Uint8Array([0]);
    device.transferOut(3, abortMessage);

  }
  

  return (
    <div className='root'>
      
      <PopUpWindow active={welcomeWindowActive && !USBDevice} setActive={setWelcomeWindowActive} title="Build 2.4.2023">
        <div className='flex p-3'>
          <div className=''>
            <div className='text-2xl mt-2'>WebScope</div>
            <div className=''>Czech Technical University in Prague</div>
            <div className=''>Department of Measurement</div>
            <button className='border rounded-md border-slate-400 p-1 mb-1 text-xl bg-blue-600 text-slate-100 shadow-md'
            onClick={connect}>Connect device</button>
            <br/>
            <a className="underline pr-2 text-slate-500" href="https://www.seznam.cz">About/Manual</a>
            <a className="underline text-slate-500">Firmware</a>
          </div>
          <div className='align-middle'>
          <img src={logo} className="mt-[-8px] mr-[-5px] align-bottom"></img>
          </div>
        </div>
      </PopUpWindow>

    <div className="app">
      <div className="px-1 flex bg-slate-50 border-b border-slate-200 w-screen select-none">

      <AppMenu ></AppMenu>
      <div className='flex'>
      <CaptureDepthAndSampleRateConfig 
          captureConfig={captureConfig} 
          setCaptureConfig={setCaptureConfig} 
          viewConfig={viewConfig} 
          setViewConfig={setViewConfig}
          setCaptureData={setCaptureData}
          defaultCaptureData={defaultCaptureData}
        />

        <ConnectDevice USBDevice={USBDevice} setUSBDevice={setUSBDevice} setCaptureState={setCaptureState}/>
       
        <Capture 
          captureConfig={captureConfig}
          generatorConfig={generatorConfig}
          setCaptureConfig={setCaptureConfig}
          setSavedCaptureConfig={setSavedCaptureConfig}
          captureState={captureState} 
          setCaptureState={setCaptureState}  
          USBDevice={USBDevice} 
          setCaptureData={setCaptureData}
          />
        </div>
      </div>



      <div className="main overflow-hidden">
      <div className='bg-slate-50 px-1 border-l select-none w-[140px]'>
            <CursorControl cursorConfig={cursorConfig} viewConfig={viewConfig} captureConfig={captureConfig} 
            setCursorConfig={setCursorConfig} captureData={captureData}/>
            <GeneratorControl captureConfig={captureConfig} viewConfig={viewConfig} setViewConfig={setViewConfig}
             generatorConfig={generatorConfig} setGeneratorConfig={setGeneratorConfig} USBDevice={USBDevice} 
             captureState={captureState}/>
      </div>
      <div className='relative flex-1 flex overflow-hidden'>

        {<CursorSliderOverlay cursorConfig={cursorConfig} viewConfig={viewConfig} 
        captureConfig={captureConfig} setCursorConfig={setCursorConfig}/>}

        <CanvasPlot 
          data={captureData} 
          viewConfig={viewConfig} 
          cursorConfig={cursorConfig} 
          savedCaptureConfig={savedCaptureConfig}
          captureConfig={captureConfig}
        />
      </div>


        <div className='bg-slate-50 px-1 border-l select-none w-[140px]'>
         
          <div>
            <ChannelControl number="1" color="#FFF735" captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}
            viewConfig={viewConfig} setViewConfig={setViewConfig}/>
            <ChannelControl number="2" color="#E78787" captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}
            viewConfig={viewConfig} setViewConfig={setViewConfig}/>
            <ChannelControl number="3" color="#68E05D" captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}
            viewConfig={viewConfig} setViewConfig={setViewConfig}/>
            <TriggerControl captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}/>
            <HorizontalControl captureConfig={captureConfig} viewConfig={viewConfig} setViewConfig={setViewConfig}/>

          </div>
        </div>
      </div>
      </div>
    </div>
  );
}