import React, {useEffect, useState} from 'react';
import './App.css';
import ChannelControl from './ChannelControl';
import HorizontalControl from './HorizontalControl';
import CanvasPlot from './CanvasPlot';
import CursorControl from './CursorControl';
import TriggerControl from './TriggerControl';
import CursorMeasurementBox from './CursorMeasurementBox';
import CaptureDepthAndSampleRateConfig from './CaptureDepthAndSampleRateConfig';
import Capture from './Capture';
import MultiRangeSlider from './MultiRangeSlider';
import SideMenu from './SideMenu';
import SplashScreen from './SplashScreen';
import ConnectDevice from './ConnectDevice';
import CaptureMap from './CaptureMap';


let defaultCaptureConfig = {
  activeChannels: [true, false, false],
  channelColors: ['#eab308', '#E78787', '#68e05d'],
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
  menu: false,
  splashScreen: true
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




  return (
    <div className='root'>
      {cursorConfig.visible && <CursorMeasurementBox captureConfig={captureConfig} captureData={captureData} cursorConfig={cursorConfig}/>}
      {false && <SplashScreen close={() => setAppState({...appState, splashScreen: false})}/>}
    <div className="app">
      <div className="px-1 flex bg-slate-100 border-b border-slate-200 w-screen justify-end select-none">

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
          setCaptureConfig={setCaptureConfig}
          setSavedCaptureConfig={setSavedCaptureConfig}
          captureState={captureState} 
          setCaptureState={setCaptureState}  
          USBDevice={USBDevice} 
          setCaptureData={setCaptureData}
          />
      </div>
      <div className="main">
      <div className='bg-slate-100 px-1 border-l select-none w-[150px]'>
            <CursorControl cursorConfig={cursorConfig} viewConfig={viewConfig} captureConfig={captureConfig} setCursorConfig={setCursorConfig}/>

      </div>
      <div className='flex flex-1 flex-col'>
        <div className='flex'>
      {true &&  <CaptureMap 
          data={captureData} 
          viewConfig={viewConfig} 
          cursorConfig={cursorConfig} 
          savedCaptureConfig={savedCaptureConfig}
          captureConfig={captureConfig}
        />}
        <div className='absolute w-60 h-8 bg-slate-50 z-10 opacity-40'></div>
        </div>
        <CanvasPlot 
          data={captureData} 
          viewConfig={viewConfig} 
          cursorConfig={cursorConfig} 
          savedCaptureConfig={savedCaptureConfig}
          captureConfig={captureConfig}
        />
      </div>



        {cursorConfig.visible && <MultiRangeSlider cursorConfig={cursorConfig} viewConfig={viewConfig} 
        captureConfig={captureConfig} setCursorConfig={setCursorConfig}/>}

        <div className='bg-slate-100 px-1 border-l select-none w-[155px]'>
          {appState.menu ?  
          <SideMenu captureData={captureData} captureConfig={captureConfig}/>
          :
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
          }
        </div>
      </div>
      </div>
    </div>
  );
}