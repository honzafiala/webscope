import SettingControl from './SettingControl';
import React, {useState} from 'react';
import './ChannelControl.css';


export default function CursorControl({cursorConfig, captureConfig, viewConfig, setCursorConfig}) {
  let zoomStart = viewConfig.horizontal.viewCenter - captureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
  let zoomEnd = viewConfig.horizontal.viewCenter + captureConfig.captureDepth / viewConfig.horizontal.zoom / 2;

  function toggleActive() {
    setCursorConfig({...cursorConfig, cursorX: {...cursorConfig.cursorX, visible: !cursorConfig.cursorX.visible}});
  }



  return (
    <div className="ChannelControl">
      <div className="topBar" style={{backgroundColor: "#DB75FF"}}>
        <div className='name'>Cursors</div> 
        <input className="checkBox"type = "checkbox" checked={cursorConfig.cursorX.visible} onChange={toggleActive}></input>

        </div>
        <div className='content'>




        <div className='data'>
            <div className='name'>Channel</div>
            </div>

        <div className='buttons'>

<button className='buttonLeft' onClick={() => console.log("1")}>1</button>
<button className='buttonMiddle' onClick={() => console.log("2")}>2</button>
</div>



        </div>
    </div>
    )
}
