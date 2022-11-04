import ValueBox from './ValueBox';
import React, {useState} from 'react';
import './ChannelControl.css';
import { act } from 'react-dom/test-utils';


export default function ChannelControl({color, number, captureConfig, setCaptureConfig}) {
  let [test1, setTest1] = useState(1);
  let [test2, setTest2] = useState(0);

  const channelNumber = parseInt(number);


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
          <ValueBox name="Scale" unit=" x" data={test1} setData={setTest1}/>
          <ValueBox name="Offset" unit=" div" data={test2} setData={setTest2}/>
        </div>
    </div>
    )
}
