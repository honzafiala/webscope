import React, {useEffect, useState} from 'react';
import './App.css';
import WebglAppSin from "./webglAppSin";
import ChannelControl from './ChannelControl';
import getDummyData from './dummyData';
import HorizontalControl from './HorizontalControl';
import CanvasPlot from './CanvasPlot';



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

let defaultViewConfig = {
  visibleChannels: [true, true],
  vertical: [
    {offset: 0, zoom: 1}, 
    {offset: 0, zoom: 1}
  ],
  horizontal: {
    zoom: 1,
    offset: 0
  }
}



export default function App() {
  let [data, setData] = useState([]);
  let [config, setConfig] = useState({
    grid: true, 
    clk: 128, 
    zoom: 1,
    offset: 0});

  let [captureConfig, setCaptureConfig] = useState(defaultCaptureConfig);
  let [ViewConfig, setViewConfig] = useState(defaultViewConfig);

  let [USBDevice, setUSBDevice] = useState(null);


  async function connectDevice() {
    let device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x0 }] });
    await device.open();
    await device.claimInterface(0);

    setUSBDevice(device);

    // "Dummy" IN transfer
    let result = await device.transferIn(1, 4);

  }


  
  function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  async function sendConfig() {
   
    console.log("clk", config);
    return;


    let str = JSON.stringify(config);
    console.log(str);

    let buf = str2ab(str);
    console.log(buf);
    let result = await USBDevice.transferOut(1, buf);

  }

  function clkChange(event) {
    let val = parseInt(event.target.value);
    console.log(event.target.value);
    if (!isNaN(val)) 
    {
      setConfig({...config, clk: val});

    }
    if (event.target.value == '') setConfig({...config, clk: 0});
  }


  
async function readContinuous() {
  while (true) await readSingle();
}


  async function readSingle() {

    // Send capture start command
    let buf = new Uint8Array([config.clk, 2, 3, 4]);
    let status = await USBDevice.transferOut(1, buf);
    console.log(status);

    let result;

    // Read trigger index and parse
    do {
      result = await USBDevice.transferIn(1, 4);
      await new Promise(res => setTimeout(res, 50));
    } while (result.data.byteLength == 0);
    console.log('result', result);
    let trigIndex = result.data.getUint32(0, true);
    console.log('trigger:', trigIndex);
    



    result = await USBDevice.transferIn(1, 200000);
    console.log('result', result);
    
  
      let parsedData = [];
      for (let i = 0; i < result.data.byteLength; i++) {
        let val = result.data.getUint8(i);
        parsedData.push(val);
      }


    let shiftedData = parsedData.slice(trigIndex).concat(parsedData.slice(0, trigIndex));
   // let shiftedData = parsedData;
  
      data = shiftedData;
      setData(shiftedData);

      return true;
  }

  function toggleGrid() {
    setConfig({...config, grid: !config.grid});
  }

  function zoom(dir) {
    console.log(dir);
    if (config.zoom <= 1 && dir == '-') return;
    let d = String(config.zoom)[0];
    let newVal = config.zoom;
    if (d == 1)
      if (dir == '-' ) newVal /= 2;
      else newVal *= 2;
    else if (d == 2)
      if (dir == '-') newVal /= 2;
      else newVal *= 5/2;
    else if (d == 5)
      if (dir == '-') newVal /= 5/2;
      else newVal *= 2;
      setConfig({...config, zoom: newVal});
  }

  function offset(dir) {
    console.log(dir);
    let newVal = config.offset;
    let change = defaultCaptureConfig.captureDepth / 10 / config.zoom / 2;
    if (dir == '+') newVal += change;
    else newVal -= change;
    console.log(newVal);
    setConfig({...config, offset: newVal});

  }



  return (
    <div className="root">
      <div className="topbar">
      <span role="img" aria-label="dog">{USBDevice == null ? "❌" : "✅"} </span>
      
        <button onClick={connectDevice}>Request device</button>
        <button onClick={readContinuous} disabled={USBDevice == null}>read continuous</button>
        <button onClick={readSingle} disabled={USBDevice == null}>read single</button>

        <button onClick={sendConfig}>send config</button>
        <input type="text" value={config.clk} size="5" onChange={clkChange}/>

        <button onClick={toggleGrid}>Grid</button>


        </div>
      <div className="main">
         {/* <WebglAppSin data={data} test={test}/> */}
        <CanvasPlot data={data} config={config}/>
        <div className='side'>
          {/* <ChannelControl number="1" color="#ffff0078" active="true"/> */}
          <div>Zoom: {config.zoom}</div>
          <div> 
        {defaultCaptureConfig.captureDepth / 
        defaultCaptureConfig.sampleRate * 100 / config.zoom} ms/div</div>
        <button onClick={() => zoom('-')}>-</button>
        <button onClick={() => zoom('+')}>+</button>
        <div>Offset: {config.offset}</div>
        <button onClick={() => offset('-')}>-</button>
        <button onClick={() => offset('+')}>+</button>

        </div>
      </div>
    </div>
  );
}