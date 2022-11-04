import SettingControl from './SettingControl';
import React, {useState} from 'react';
import './ChannelControl.css';


export default function HorizontalControl({captureConfig, viewConfig, setViewConfig}) {

  function zoomCallback(dir) {


    if (dir == '0') {
      setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, zoom: 1}});
      return;
    }
    if (viewConfig.horizontal.zoom <= 1 && dir == '-') return;
    let d = String(viewConfig.horizontal.zoom)[0];
    let newVal = viewConfig.horizontal.zoom;
    if (d == 1)
      if (dir == '-' ) newVal /= 2;
      else newVal *= 2;
    else if (d == 2)
      if (dir == '-') newVal /= 2;
      else newVal *= 5/2;
    else if (d == 5)
      if (dir == '-') newVal /= 5/2;
      else newVal *= 2;
      setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, zoom: newVal}});


  }

  function offsetCallback(dir) {
    let newVal = viewConfig.horizontal.offset;
    let change = 200000 / 10 / viewConfig.horizontal.zoom / 2;
    if (dir == '+') newVal += change;
    else if (dir == '-') newVal -= change;
    else if (dir == '0') newVal = 0;
    console.log(newVal);
    setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, offset: newVal}});
    
  }

  return (
    <div className="ChannelControl">
      <div className="topBar" style={{backgroundColor: "#ACACAC"}}>
        <div className='name'>Horizontal</div> 
        </div>
        <div className='content'>
          <SettingControl name="Zoom" unit=" x" data={viewConfig.horizontal.zoom} callback={zoomCallback}/>
          <SettingControl name="Offset" unit=" m" data={viewConfig.horizontal.offset} callback={offsetCallback}/>
        </div>
    </div>
    )
}
