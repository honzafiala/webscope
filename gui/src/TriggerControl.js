import SettingControl from './SettingControl';
import React, {useState} from 'react';
import './ChannelControl.css';


export default function TriggerControl({captureConfig, setCaptureConfig}) {

  function triggerChange(e) {
    setCaptureConfig({...captureConfig, trigger: {...captureConfig.trigger, threshold: e.target.value}});
  }
 

  function preTriggerChange(e) {
    setCaptureConfig({...captureConfig, trigger: {...captureConfig.trigger, pretrigger: e.target.value}});
  }
 

  return (
    <div className="ChannelControl">
      <div className="topBar" style={{backgroundColor: "#ACACAC"}}>
        <div className='name'>Trigger</div> 
        </div>
        <div className='content'>




        <div className='data'>
            <div className='name'>Channel</div>
            </div>

        <div className='buttons'>

<button className='buttonLeft' style={{backgroundColor: captureConfig.channelColors[0]}} onClick={() => console.log("1")}>1</button>
<button className='buttonMiddle' onClick={() => console.log("2")}>2</button>
</div>


<div className='data'>
            <div className='name'>Edge</div>
            </div>

        <div className='buttons'>

<button className='buttonLeft' onClick={() => console.log("1")}>Up</button>
<button className='buttonMiddle' onClick={() => console.log("2")}>Down</button>
<button className='buttonMiddle' onClick={() => console.log("2")}>Both</button>
</div>

<div className='data'>
            <div className='name'>Level</div>
            </div>

<input type="range" min="1" max="254" value={captureConfig.trigger.threshold} onChange={triggerChange} style={{width: "100%", margin: "0px", padding: "0px"}}/>


<div className='data'>
            <div className='name'>Pretrigger</div>
            </div>

<input type="range" min="-1" max="1" step="0.01" value={captureConfig.trigger.pretrigger} onChange={preTriggerChange} style={{width: "100%", margin: "0px", padding: "0px"}}/>



        </div>
    </div>
    )
}
