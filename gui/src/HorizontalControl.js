import SettingControl from './SettingControl';
import React, {useState} from 'react';
import './ChannelControl.css';


export default function HorizontalControl({captureConfig, viewConfig, setViewConfig}) {


  function changeZoom(dir) {
    if (dir == '0') {
      setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, zoom: 1}});
      return;
    }
    if (viewConfig.horizontal.zoom <= 1 && dir == '-') return;
    let newZoom = viewConfig.horizontal.zoom;
    let newViewCenter = viewConfig.horizontal.viewCenter;
    if (dir == '-' ) {
      newZoom /= 2;
    } else {
      newZoom *= 2;
      newViewCenter -= newViewCenter % (captureConfig.captureDepth / 10);
    }
      setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, zoom: newZoom, viewCenter: newViewCenter}});
  }

  function changeViewCenter(dir) {
    let newVal = viewConfig.horizontal.viewCenter;
    let increment = captureConfig.captureDepth / viewConfig.horizontal.zoom / 10;
    if (dir == '+') newVal += increment;
    else if (dir == '-') newVal -= increment;
    else if (dir == '0') newVal = captureConfig.captureDepth / 2;
    console.log(newVal);
    setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, viewCenter: newVal}});
    
    
  }

  return (
    <div className="ChannelControl">
      <div className="topBar" style={{backgroundColor: "#ACACAC"}}>
        <div className='name'>Horizontal</div> 
        </div>
        <div className='content'>
          <SettingControl name="Zoom" unit=" x" data={viewConfig.horizontal.zoom} callback={changeZoom}/>
          <SettingControl name="Offset" unit=" div" data={viewConfig.horizontal.offset} callback={changeViewCenter}/>
        </div>
    </div>
    )
}
