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
 
  function toggleTriggerChannel(channel) {
    let newChannels = captureConfig.trigger.channels;
    newChannels[channel] = !newChannels[channel];
    setCaptureConfig({...captureConfig, trigger: {...captureConfig.trigger, channels: newChannels}});
  }

  function setTriggerEdge(edge) {
    setCaptureConfig({...captureConfig, trigger: {...captureConfig.trigger, edge: edge}});
  }

  return (
    <div className="ChannelControl">
      <div className="topBar" style={{backgroundColor: "cyan"}}>
        <div className='name'>Trigger</div> 
        </div>
        <div className='content'>




        <div className='data'>
            <div className='name'>Channels</div>
            </div>

        <div className='buttons'>

        <button onClick={() => toggleTriggerChannel(0)} style={{backgroundColor: captureConfig.trigger.channels[0] ? captureConfig.channelColors[0] : ""}}>1</button>
        <button onClick={() => toggleTriggerChannel(1)} style={{backgroundColor: captureConfig.trigger.channels[1] ? captureConfig.channelColors[1] : ""}}>2</button>
        <button onClick={() => toggleTriggerChannel(2)} style={{backgroundColor: captureConfig.trigger.channels[2] ? captureConfig.channelColors[2] : ""}}>3</button>
</div>


<div className='data'>
            <div className='name'>Edge</div>
            </div>

        <div className='buttons'>

        <button  onClick={() => setTriggerEdge("UP")} style={{backgroundColor: captureConfig.trigger.edge == "UP" ? "#ffffff" : ""}}>Up</button>
        <button  onClick={() => setTriggerEdge("DOWN")} style={{backgroundColor: captureConfig.trigger.edge == "DOWN" ? "#ffffff" : ""}}>Down</button>
        <button  onClick={() => setTriggerEdge("BOTH")} style={{backgroundColor: captureConfig.trigger.edge == "BOTH" ? "#ffffff" : ""}}>Both</button>


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