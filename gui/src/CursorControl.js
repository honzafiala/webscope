import React, {useState} from 'react';
import { getNumActiveChannels } from './Utils';

export default function CursorControl({cursorConfig, captureConfig, setCursorConfig, captureData, viewConfig}) {

  function toggleActive(axis) {
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
    return (zoomStart + pos * zoomLen / 100) / captureConfig.sampleRate * getNumActiveChannels(captureConfig)
    - captureConfig.preTrigger * captureConfig.captureDepth / captureConfig.sampleRate * getNumActiveChannels(captureConfig);
  }

  function xCursorPosToVoltage(pos) {
    return captureData[cursorConfig.channel - 1][Math.round((zoomStart + pos * zoomLen / 100))] * 3.3 / 4096;
  }

  function formatValue(val) {
    if (isNaN(val)) return '-'
    if (val == 0) return "0";
    let isNegative = val < 0;
    val = Math.abs(val);
    let prefixes = ['G','M' ,'k', '', 'm', 'µ', 'n'];
    let prefixIndex = 3;
    while (val >= 1000) {
        prefixIndex--;
        val /= 1000;
    }
    while (val < 1) {
        prefixIndex++;
        val *= 1000;
    }
    let beforeDecimal = String(Math.floor(val));
    let afterDecimal = String(Math.round((val % 1) * 1000));
    while (afterDecimal.length < 3) afterDecimal = '0' + afterDecimal;
    let str = (isNegative ? '-' : '') + beforeDecimal + '.' + afterDecimal;
    console.log(str.slice(0, 5) + prefixes[prefixIndex]);
    return str.slice(0, 5) + prefixes[prefixIndex];
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
        val: xCursorPosToTime(cursorConfig.x.end) - xCursorPosToTime(cursorConfig.x.start),
        unit: "s",
        name: "Δt",
        index: ''
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
        val: 1 / (xCursorPosToTime(cursorConfig.x.end) - xCursorPosToTime(cursorConfig.x.start)),
        unit: "Hz",
        name: "f",
        index: ''
    },
  ];

  function yCursorPosToVoltage(pos) {
    return (pos * 3.5 / 100 - 0.5 * viewConfig.vertical[cursorConfig.channel - 1].offset) 
    / viewConfig.vertical[cursorConfig.channel - 1].zoom;
  }

  let yMeasurements = [
  { 
    val: yCursorPosToVoltage(cursorConfig.y.start),
    unit: 'V',
    name: 'V',
    index: 1
  },
  { 
    val: yCursorPosToVoltage(cursorConfig.y.end),
    unit: 'V',
    name: 'V',
    index: 2
  },
  { 
    val: yCursorPosToVoltage(cursorConfig.y.end) - yCursorPosToVoltage(cursorConfig.y.start),
    unit: 'V',
    name: 'ΔV',
    index: 2
  }
  ];

  return(
    <div className="my-1 mx-1 bg-white rounded-md  shadow text-slate-700 text-l">
        <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
            <div className="flex-1 px-3 py-[2px] bg-fuchsia-400">Cursors</div>
        </div>

        <div className="px-1 border-x border-slate-300">Channel</div>
        <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden bg-slate-100 leading-5 text-slate-700 border border-slate-300 shadow">
            {
                Array(1, 2, 3).map((channel, index) => 
                    <div className={`flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300
                    ${cursorConfig.channel == channel ? 'bg-slate-300' : ''}`}
                    onClick={() => setCursorChannel(channel)}
                    key={index}>
                        {channel}
                    </div>
                )
            }
        </div>

        <div className="px-1 border-x border-slate-300">Axis</div>
        <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
            <div className={`flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 ${cursorConfig.x.visible ? "bg-slate-300" : ''}`}
            onClick={() => toggleActive('x')}>X</div>
            <div className={`flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 ${cursorConfig.y.visible ? "bg-slate-300" : ''}`}
            onClick={() => toggleActive('y')}>Y</div>
        </div>

        {cursorConfig.x.visible && <div>
            <div className='px-1 py-0 my-0'>
                X
            </div>
            {xMeasurements.map((measurement, index) => 
                <div className="flex" key={measurement.index}>
                <div className="flex-1 px-2">
                    <i>{measurement.name}<sub>{index}</sub></i>
                </div>
                <div className="flex-1 text-right px-2">
                    {formatValue(measurement.val)}{measurement.unit}
                </div>
            </div>
            )}
        </div>}

        {cursorConfig.y.visible && <div>
            <div className='px-1 py-0 my-0'>
                Y
            </div>
            {yMeasurements.map((measurement, index) => 
                <div className="flex" key={measurement.index}>
                <div className="flex-1 px-2">
                    <i>{measurement.name}<sub>{index}</sub></i>
                </div>
                <div className="flex-1 text-right px-2">
                    {formatValue(measurement.val)}{measurement.unit}
                </div>
            </div>
            )}
        </div>}
    </div>
  );
}
