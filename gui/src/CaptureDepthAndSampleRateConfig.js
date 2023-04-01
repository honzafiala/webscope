import './CaptureDepthAndSampleRateConfig.css';
import { getNumActiveChannels } from './Utils';
import PopUpWindow from './PopUpWindow';
import React, {useState, useEffect} from 'react';




export default function CaptureDepthAndSampleRateConfig({captureConfig, setCaptureConfig, viewConfig, setViewConfig, setCaptureData, defaultCaptureData}) {
    const sampleRateValues = [500, 250, 100, 50, 20, 10];
    const captureDepthValues = [100, 50, 20, 10, 5, 2, 1];

    const [sampleRatePopUpOpen, setSampleRatePopUpOpen] = useState(false);


    function changeSampleRate(dir) {
        let index = sampleRateValues.indexOf(captureConfig.sampleRate / 1000);
        if (dir == '+' && index > 0) index--;
        else if (dir == '-' && index < sampleRateValues.length - 1) index++;

        let newVal = sampleRateValues[index] * 1000;
        setCaptureConfig({...captureConfig, sampleRate: newVal});
    }

    function changeCaptureDepth(dir) {
        let index = captureDepthValues.indexOf(captureConfig.captureDepth / 1000);
        if (dir == '+' && index > 0) index--;
        else if (dir == '-' && index < captureDepthValues.length - 1) index++;

        let newTotalCaptureDepth = captureDepthValues[index] * 1000;
        let newCaptureDepth = Math.floor(newTotalCaptureDepth / getNumActiveChannels(captureConfig));
        console.log(index);
        setCaptureConfig({...captureConfig, captureDepth: newCaptureDepth, totalCaptureDepth: newTotalCaptureDepth});

        setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, viewCenter: newCaptureDepth / 2}});

        setCaptureData(defaultCaptureData);
    }

    return(
        <div className='flex flex-row'>

        <PopUpWindow active={sampleRatePopUpOpen} setActive={setSampleRatePopUpOpen} title="Sample rate settings">
          kokos
        </PopUpWindow>  


        <div className="mx-1 my-1 pointer-events-auto flex flex-row divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-l leading-5 text-slate-700 border border-slate-300 shadow">

          <div 
            className={`text-center py-[2px] px-1 bg-slate-200`}>
            Sample rate&nbsp;{captureConfig.sampleRate/1000}&nbsp;kS/s
          </div>
          <div onClick={() => changeSampleRate('-')}
            className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            -
          </div>
          <div onClick={() => setSampleRatePopUpOpen(true)}
            className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            Edit
          </div>
          <div onClick={() => changeSampleRate('+')}
            className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            +
          </div>
        </div>  
        <div className="mx-1 my-1 pointer-events-auto flex flex-row divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-l leading-5 text-slate-700 border border-slate-300 shadow">
         
          <div 
            className={`text-center py-[2px] px-1 bg-slate-200`}>
            Capture depth&nbsp;{captureConfig.totalCaptureDepth/1000}&nbsp;kS
          </div>
          <div onClick={() => changeCaptureDepth('-')}
            className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            -
          </div>

          
          <div onClick={() => changeCaptureDepth('+')}
            className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            +
          </div>
        </div>  
       
  </div>  
    );

   
}