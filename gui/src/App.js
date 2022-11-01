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
  let [stop, setStop] = useState(false);


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
  await readSingle();
  if (!stop) await readContinuous();
}


  async function readSingle() {

    // Send capture start command
    let buf = new Uint8Array([1, 2, 3, 4]);
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

      return true;
  }

  function toggleGrid() {
    setConfig({...config, grid: !config.grid});
  }

  function stopCapture() {
    setStop(true);
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
        <button onClick={() => setStop(true)}>Stop</button>
        {stop? "stopped" : ""}

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