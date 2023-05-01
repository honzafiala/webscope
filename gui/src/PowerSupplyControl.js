import React, {useState} from 'react';


export default function PowerSupplyControl({captureConfig, setCaptureConfig}) {
    function setMode(mode) {
        setCaptureConfig({...captureConfig, powerSupplyMode: mode});
    }



return (
  <div className="my-2 mx-1 bg-white rounded-md border border-slate-400 shadow text-slate-700 text-l">
  <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
      <div className="flex-1 px-1 py-[2px] bg-slate-200">SMPS mode</div>
  </div>


  <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100  leading-5 text-slate-700 border border-slate-300 shadow rounded-b-md">



      <div onClick={() => setMode('PWM')} className={`flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 rounded-bl-md bg-${captureConfig.powerSupplyMode == 'PWM' ? "slate-300" : "slate-100"}`}>PWM</div>
      <div onClick={() => setMode('PFM')} className={`flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 rounded-br-md bg-${captureConfig.powerSupplyMode == 'PFM' ? "slate-300" : "slate-100"}`}>PFM</div>

  </div>


</div>          

);
}