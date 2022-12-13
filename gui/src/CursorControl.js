import React, {useState} from 'react';
import './ChannelControl.css';

import ChannelPicker from './ChannelPicker.css';


export default function CursorControl({cursorConfig, captureConfig, setCursorConfig, captureData, viewConfig}) {

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

  const zoomLen = captureConfig.captureDepth / viewConfig.horizontal.zoom;
  const zoomStart = viewConfig.horizontal.viewCenter - zoomLen / 2;

  function xCursorPosToTime(pos) {
    return (zoomStart + pos * zoomLen / 100) / captureConfig.sampleRate * 1000 
    - captureConfig.preTrigger * captureConfig.captureDepth / captureConfig.sampleRate * 1000;
  }

  function xCursorPosToVoltage(pos) {
    return captureData[0][Math.round((zoomStart + pos * zoomLen / 100))] * 3.3 / (255);
  }

  let xMeasurements = [
    {
        val: xCursorPosToTime(cursorConfig.x.start),
        unit: "s",
        name: "t",
        index: 1
    },
    {
        val: xCursorPosToTime(cursorConfig.x.end),
        unit: "s",
        name: "t",
        index: 2
    },
    {
        val: xCursorPosToVoltage(cursorConfig.x.start),
        unit: "V",
        name: "V",
        index: 1
    },
    {
        val: xCursorPosToVoltage(cursorConfig.x.end),
        unit: "V",
        name: "V",
        index: 2
    },
    {
        val: xCursorPosToVoltage(cursorConfig.x.end) - xCursorPosToVoltage(cursorConfig.x.start),
        unit: "V",
        name: "ΔV",
        index: ''
    },
    {
        val: 1000 / (xCursorPosToTime(cursorConfig.x.end) - xCursorPosToTime(cursorConfig.x.start)),
        unit: "Hz",
        name: "f",
        index: ''
    },
  ];

  console.log(xMeasurements);


//   xMeasurements.t2 = (zoomStart + cursorConfig.x.end * zoomLen / 100) / captureConfig.sampleRate * 1000 - captureConfig.preTrigger * captureConfig.captureDepth / captureConfig.sampleRate * 1000;
//   xMeasurements.v1 = captureData[0][Math.round((zoomStart + cursorConfig.x.start * zoomLen / 100))] * 3.3 / (255);
//   xMeasurements.v2 = captureData[0][Math.round((zoomStart + cursorConfig.x.end * zoomLen / 100))] * 3.3 / (255);
//   xMeasurements.deltaV = xMeasurements.v2 - xMeasurements.v1;
//   xMeasurements.frequency = 1000 / (xMeasurements.t2 - xMeasurements.t1);

  let yMeasurements = {};
  yMeasurements.v1 = (cursorConfig.y.start * 3.5 / 100 - 0.5 * viewConfig.vertical[0].offset) / viewConfig.vertical[0].zoom;
  yMeasurements.v2 = (cursorConfig.y.end * 3.5 / 100 - 0.5 * viewConfig.vertical[0].offset) / viewConfig.vertical[0].zoom;
  yMeasurements.deltaV = yMeasurements.v2 - yMeasurements.v1;


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

            {xMeasurements.map(measurement => 
                <div className="flex">
                <div className="flex-1 px-3">
                    <i>{measurement.name}<sub>{measurement.index}</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    {measurement.val}{measurement.unit}
                </div>
            </div>
            )}


{/* 
            <div className='px-1 py-0 my-0'>
                X
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                    <i>t<sub>1</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    {xMeasurements.t1}ms
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                    <i>t<sub>2</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    {xMeasurements.t2}ms
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                <i>V<sub>1</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    {xMeasurements.v1}V
                </div>
            </div>
            <div className="flex">
                <div className="flex-1 px-3">
                    <i>V<sub>2</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    {xMeasurements.v2}V
                </div>
            </div>
            <div className="flex">
                <div className="flex-1 px-3">
                    <i>Δ<sub>V</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    {xMeasurements.deltaV}V
                </div>
            </div>
            <div className="flex">
                <div className="flex-1 px-3">
                    <i>f</i>
                </div>
                <div className="flex-1 text-right px-3">
                    {xMeasurements.frequency}Hz
                </div>
            </div>


            <div className='px-1 py-0 my-0'>
                Y
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                    <i>V<sub>1</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    {yMeasurements.v1}V
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                    <i>V<sub>2</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    {yMeasurements.v2}V
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                    <i>Δ<sub>V</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    {yMeasurements.v2}V
                </div>
            </div> */}

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
