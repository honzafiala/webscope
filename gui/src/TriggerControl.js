import SettingControl from './SettingControl';
import React, {useState} from 'react';
import './ChannelControl.css';


export default function TriggerControl({captureConfig, setCaptureConfig}) {

  function triggerChange(e) {
    setCaptureConfig({...captureConfig, trigger: {...captureConfig.trigger, threshold: e.target.value}});
  }
 

  function preTriggerChange(dir) {
    let newVal = captureConfig.preTrigger;
    if (dir == '+') newVal += 0.1;
    else if (dir == '-') newVal -= 0.1;
    else if (dir == '0') newVal = 0;
    console.log(newVal);
    setCaptureConfig({...captureConfig, preTrigger: Math.round(newVal * 10) / 10});
    
  }
 

  return (
    <div className="ChannelControl">
      <div className="topBar" style={{backgroundColor: "cyan"}}>
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
            </div>

<div className='content'>
          <SettingControl name="Pretrigger" unit="" data={Math.round(captureConfig.preTrigger * 10) / 10} callback={preTriggerChange}/>
        </div>

        </div>
    </div>
    )
}
