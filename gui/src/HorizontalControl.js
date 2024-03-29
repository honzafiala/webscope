import SettingControl from './SettingControl';
import React, {useState, useEffect} from 'react';
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

  function getOffsetSamples(offset) {
    return offset - captureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
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

  function handleKeyPress(event) {
    console.log(event.key);
    if (event.key == 'ArrowLeft') {
      changeViewCenter('-');
    }
    else if (event.key == 'ArrowRight') {
      changeViewCenter('+');
    }
    else if (event.key == 'ArrowUp') {
      changeZoom('+');
    } else if (event.key == 'ArrowDown') {
      changeZoom('-');
    }
}

useEffect(() => {

    document.addEventListener("keydown", handleKeyPress, false);
    
    return () => {
        document.removeEventListener('keydown', handleKeyPress);
      };

},[viewConfig]);


  return (

    <div className="my-2 mx-1 bg-white rounded-md border border-slate-400  shadow text-slate-700 text-l">
    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
        <div className="flex-1 px-1 py-[2px] bg-slate-200">Horizontal</div>
    </div>


    <div className="flex px-1 border-x border-slate-300">
      <div className="flex-1 ">Zoom</div>
      <div>{viewConfig.horizontal.zoom}&nbsp;x</div>
    </div>

    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
        <div onClick={() => changeZoom("-")} className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">-</div>
        <div onClick={() => changeZoom("0")} className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">0</div>
        <div onClick={() => changeZoom("+")} className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">+</div>
    </div>

    <div className="flex px-1 border-x border-slate-300">
      <div className="flex-1 ">Offset</div>
      <div>{Math.round(getOffsetSamples(viewConfig.horizontal.viewCenter))}&nbsp;S</div>
    </div>

    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-md  bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
        <div onClick={() => changeViewCenter("-")} className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">-</div>
        <div onClick={() => changeViewCenter("0")} className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">0</div>
        <div onClick={() => changeViewCenter("+")} className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">+</div>
    </div>

    


</div>

  );

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
