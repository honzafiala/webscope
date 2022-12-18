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
import CursorSliderOverlay from './CursorSliderOverlay';
import SideMenu from './SideMenu';
import SplashScreen from './SplashScreen';
import ConnectDevice from './ConnectDevice';
import HorizontalSlider from './HorizontalSlider';


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
      {false && <CursorMeasurementBox captureConfig={captureConfig} captureData={captureData} cursorConfig={cursorConfig}/>}
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
      <div className="main overflow-hidden">
      <div className='bg-slate-100 px-1 border-l select-none w-[140px]'>
            <CursorControl cursorConfig={cursorConfig} viewConfig={viewConfig} captureConfig={captureConfig} 
            setCursorConfig={setCursorConfig} captureData={captureData}/>

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


        <div className='bg-slate-100 px-1 border-l select-none w-[140px]'>
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