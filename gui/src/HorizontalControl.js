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
    let newZoom = viewConfig.horizontal.zoom;
    let newOffset = viewConfig.horizontal.offset;
    if (dir == '-' ) {
      newZoom /= 2;
      newOffset = Math.round((newOffset - 5) / 2);
      console.log(Math.round((newOffset - 5) / 2));
    } else {
      newZoom *= 2;
      newOffset = 2 * newOffset + 5;
    }
      setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, zoom: newZoom, offset: Math.round(newOffset)}});
  }

  function offsetCallback(dir) {
    let newVal = viewConfig.horizontal.offset;
    if (dir == '+') newVal++;
    else if (dir == '-') newVal--;
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
          <SettingControl name="Offset" unit=" div" data={viewConfig.horizontal.offset} callback={offsetCallback}/>
        </div>
    </div>
    )
}
