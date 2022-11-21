import React, {useState} from 'react';
import './ChannelControl.css';

import ChannelPicker from './ChannelPicker.css';


export default function CursorControl({cursorConfig, captureConfig, setCursorConfig}) {

  function toggleActive() {
    setCursorConfig({...cursorConfig, visible: !cursorConfig.visible});
  }

  function setCursorChannel(channel) {
    setCursorConfig({...cursorConfig, channel: channel});
  }

  return (
    <div className="ChannelControl">
      <div className="topBar" style={{backgroundColor: "#DB75FF"}}>
        <div className='name'>Cursors</div> 
        <input className="checkBox"type = "checkbox" checked={cursorConfig.visible} onChange={toggleActive}></input>

        </div>
        <div className='content'>




        <div className='data'>
            <div className='name'>Channel</div>
            </div>

            <div className='ChannelPicker'>
            <button onClick={() => setCursorChannel(0)} style={{backgroundColor: cursorConfig.channel == 0 ? captureConfig.channelColors[0] : ""}}>1</button>
            <button onClick={() => setCursorChannel(1)} style={{backgroundColor: cursorConfig.channel == 1 ? captureConfig.channelColors[1] : ""}}>2</button>
            <button onClick={() => setCursorChannel(2)} style={{backgroundColor: cursorConfig.channel == 2 ? captureConfig.channelColors[2] : ""}}>3</button>
          </div>



        </div>
    </div>
    )
}
