import React, {useEffect, useState} from 'react';
import './App.css';
import WebglAppSin from "./webglAppSin";
import ChannelControl from './ChannelControl';
import getDummyData from './dummyData';
import HorizontalControl from './HorizontalControl';
import CanvasPlot from './CanvasPlot';


let dummyData = getDummyData();




export default function App() {
  let [data, setData] = useState([]);
  let [config, setConfig] = useState({grid: false});
  let [USBDevice, setUSBDevice] = useState(null);
  let [clk, setClk] = useState(0);


  async function connectDevice() {
    let device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x0 }] });
    await device.open();
    await device.claimInterface(0);

    setUSBDevice(device);

    // "Dummy" IN and OUT transfers
    let result = await device.transferIn(1, 4);
    let buf = new Uint8Array([0]);
    device.transferOut(1, buf);

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
   

    let config = {
      clk_div: clk
    };

    let str = JSON.stringify(config);
    console.log(str);

    let buf = str2ab(str);
    console.log(buf);
    let result = await USBDevice.transferOut(1, buf);

  }

  function clkChange(event) {
    let val = parseInt(event.target.value);
    console.log(event.target.value);
    if (!isNaN(val)) setClk(val);
    if (event.target.value == '') setClk(0);
  }


  
async function readContinuous() {
  while (1) {
    readSingle();
  }
}


  async function readSingle() {
    let result;

    // Read trigger index and parse
    do {
      result = await USBDevice.transferIn(1, 4);
      await new Promise(res => setTimeout(res, 200));
    } while (result.data.byteLength == 0);
    console.log('result', result);
    let trigIndex = result.data.getUint32(0, true);
    console.log('trigger:', trigIndex);
    



    result = await USBDevice.transferIn(1, 32768 * 6);
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

      let max = 0;
      for (let i = 0; i < data.length; i++)
        if (data[i] > max) max = data[i];
      console.log('max:', max);
  }

  function toggleGrid() {
    setConfig({...config, grid: !config.grid});
  }

  return (
    <div className="root">
      <div className="topbar">
      <span role="img" aria-label="dog">{USBDevice == null ? "❌" : "✅"} </span>
      
        <button onClick={connectDevice}>Request device</button>
        <button onClick={readContinuous} disabled={USBDevice == null}>read continuous</button>
        <button onClick={readSingle} disabled={USBDevice == null}>read single</button>

        <button onClick={sendConfig}>send config</button>
        <input type="text" value={clk} size="5" onChange={clkChange}/>

        <button onClick={toggleGrid}>Grid</button>


        </div>
      <div className="main">
         {/* <WebglAppSin data={data} test={test}/> */}
        <CanvasPlot data={data} config={config}/>
        <div className='side'>
          <ChannelControl number="1" color="#ffff0078" active="true"/>

        </div>
      </div>
    </div>
  );
}