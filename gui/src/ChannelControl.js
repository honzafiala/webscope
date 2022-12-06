import ValueBox from './ValueBox';
import React, {useState} from 'react';
import './ChannelControl.css';
import {getNumActiveChannels, formatValue} from './Utils'

export default function ChannelControl({color, number, captureConfig, setCaptureConfig, viewConfig, setViewConfig}) {

  const channelNumber = parseInt(number);

  function changeZoom(dir) {
      let newVertical = viewConfig.vertical;
      let oldVal = newVertical[channelNumber - 1].zoom;
      let newVal = oldVal;
      if (dir == '0') {
        newVal = 1;
      }
      else if (dir == '+' && oldVal == 0.5) {
        newVal = 1;
      } else {
        let d = String(oldVal)[0];
        if (d == 1)
          if (dir == '-' ) newVal /= 2;
          else newVal *= 2;
        else if (d == 2)
          if (dir == '-') newVal /= 2;
          else newVal *= 5/2;
        else if (d == 5)
          if (dir == '-') newVal /= 5/2;
          else newVal *= 2;
      }
      newVertical[channelNumber - 1].zoom = newVal;
      setViewConfig({...viewConfig, vertical: newVertical});

  }

  function changeOffset(dir) {
    let newVertical = viewConfig.vertical;
    let oldVal = newVertical[channelNumber - 1].offset;

    if (dir == '0') {
      newVertical[channelNumber - 1].offset = 0;
      setViewConfig({...viewConfig, vertical: newVertical});
      return;
    }
    let newVal = oldVal;
    if (dir == '-') newVal--;
    else if (dir == '+') newVal++;

      newVertical[channelNumber - 1].offset = newVal;
    setViewConfig({...viewConfig, vertical: newVertical});
  }

  function toggleActive() {
    if (captureConfig.activeChannels[channelNumber - 1] && getNumActiveChannels(captureConfig) == 1) return;

    let newActiveChannels = captureConfig.activeChannels;
    newActiveChannels[channelNumber - 1] = !newActiveChannels[channelNumber - 1];
    setCaptureConfig({...captureConfig, activeChannels: newActiveChannels});

    console.log("active channels: ", getNumActiveChannels(captureConfig));
  }

  let channelColors = ['yellow', 'red', 'green'];

  return (
    <div className="my-1 mx-1 bg-white rounded-md  shadow text-slate-700 text-l">
    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
        <div className={`flex-1 px-1 py-[2px] whitespace-nowrap  bg-${captureConfig.activeChannels[channelNumber - 1] ? channelColors[channelNumber - 1] + "-300": "slate-200"}`} >Channel {channelNumber}</div>
        <div className="       px-3  hover:bg-slate-300 hover:text-slate-900 active:bg-slate-400  bg-slate-100" active="true" onClick={toggleActive}>
        {captureConfig.activeChannels[channelNumber - 1] ? '-' : '+'}
        </div>
   
    </div>
    <div className='flex px-1 border-x border-slate-30'>
    <div className="flex-1">Scale</div>
    <div>{viewConfig.vertical[channelNumber - 1].zoom}&nbsp;x</div>
    </div>
    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-0 bg-slate-100  leading-5 text-slate-700 border border-slate-300 shadow">
        <div className="flex-1 text-center   hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300"
          onClick={() => changeZoom('-')}>{"-"}</div>
        <div className="flex-1 text-center   hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300"
          onClick={() => changeZoom('0')}>{"0"}</div>
        <div className="flex-1 text-center   hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300"
          onClick={() => changeZoom('+')}>{"+"}</div>
    </div>

    <div className='flex px-1 border-x border-slate-30'>
    <div className="flex-1">Offset</div>
    <div>{viewConfig.vertical[channelNumber - 1].offset}&nbsp;div</div>
    </div>
    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-md bg-slate-100  leading-5 text-slate-700 border border-slate-300 shadow">
        <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300"
          onClick={() => changeOffset('-')}>{"-"}</div>
        <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300"
          onClick={() => changeOffset('0')}>{"0"}</div>
        <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300"
          onClick={() => changeOffset('+')}>{"+"}</div>
    </div>

</div>
  );

  return (
    <div className="ChannelControl">
      <div className="topBar" style={{backgroundColor: color}}>
        <div className='name'>Channel {number} </div>
          <input className="checkBox"type = "checkbox" checked={captureConfig.activeChannels[channelNumber - 1]} onChange={toggleActive}>
          </input>
        </div>
        <div className='content'>
          <ValueBox name="Scale" unit=" x" data={viewConfig.vertical[channelNumber - 1].zoom} setData={changeZoom}/>
          <ValueBox name="Offset" unit=" div" data={viewConfig.vertical[channelNumber - 1].offset} setData={changeOffset}/>
        </div>
    </div>
    )
}
