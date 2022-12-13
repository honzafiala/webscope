import React, {useState} from 'react';
import './ChannelControl.css';

import ChannelPicker from './ChannelPicker.css';


export default function CursorControl({cursorConfig, captureConfig, setCursorConfig}) {

  function toggleActive(axis) {
    console.log(axis);
    if (axis == 'x')
        setCursorConfig({...cursorConfig, x: {...cursorConfig.x, visible: !cursorConfig.x.visible}});
    else if (axis == 'y')
        setCursorConfig({...cursorConfig, y: {...cursorConfig.y, visible: !cursorConfig.y.visible}});
  }

  function setCursorChannel(channel) {
    setCursorConfig({...cursorConfig, channel: channel});
  }

  return(
    <div className="my-1 mx-1 bg-white rounded-md  shadow text-slate-700 text-l">
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
                <div className="flex-1 px-3 py-[2px] bg-fuchsia-400">Cursors</div>
            </div>


            <div className="px-1 border-x border-slate-300">Channel</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-white bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 bg-slate-300">{"1"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"2"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"3"}</div>
            </div>

            <div className="px-1 border-x border-slate-300">Axis</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-white bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
                <div className={`flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 ${cursorConfig.x.visible ? "bg-slate-300" : ''}`}
                onClick={() => toggleActive('x')}>X</div>
                <div className={`flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 ${cursorConfig.y.visible ? "bg-slate-300" : ''}`}
                onClick={() => toggleActive('y')}>Y</div>
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                    <i>t<sub>1</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    0.875ms
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                    <i>t<sub>2</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    1.875ms
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                <i>V<sub>1</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    1.754V
                </div>
            </div>
            <div className="flex">
                <div className="flex-1 px-3">
                    <i>V<sub>2</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    1.998V
                </div>
            </div>
            <div className="flex">
                <div className="flex-1 px-3">
                    <i>Δ<sub>V</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    5.2mV
                </div>
            </div>
            <div className="flex">
                <div className="flex-1 px-3">
                    <i>f</i>
                </div>
                <div className="flex-1 text-right px-3">
                    5.446kHz
                </div>
            </div>


        </div>

  );

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
