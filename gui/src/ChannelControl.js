import ValueBox from './ValueBox';
import React, {useState} from 'react';
import './ChannelControl.css';


export default function ChannelControl({color, number, captureConfig, setCaptureConfig, viewConfig, setViewConfig}) {

  const channelNumber = parseInt(number);

  function changeZoom(dir) {
      let newVertical = viewConfig.vertical;
      let oldVal = newVertical[channelNumber - 1].zoom;

      if (dir == '0') {
        newVertical[channelNumber - 1].zoom = 1;
        setViewConfig({...viewConfig, vertical: newVertical});
        return;
      }
      let d = String(oldVal)[0];
      let newVal = oldVal;
      if (d == 1)
        if (dir == '-' ) newVal /= 2;
        else newVal *= 2;
      else if (d == 2)
        if (dir == '-') newVal /= 2;
        else newVal *= 5/2;
      else if (d == 5)
        if (dir == '-') newVal /= 5/2;
        else newVal *= 2;
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
    let newActiveChannels = captureConfig.activeChannels;
    newActiveChannels[channelNumber - 1] = !newActiveChannels[channelNumber - 1];
    let newNumActiveChannels = captureConfig.numActiveChannels + (newActiveChannels[channelNumber - 1] ? 1 : -1);
    setCaptureConfig({...captureConfig, activeChannels: newActiveChannels, numActiveChannels: newNumActiveChannels});
  }

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
