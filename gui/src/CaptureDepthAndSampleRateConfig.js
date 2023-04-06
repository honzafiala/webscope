import { getNumActiveChannels } from './Utils';
import PopUpWindow from './PopUpWindow';
import React, {useState, useEffect} from 'react';
import { sample } from 'lodash';




export default function CaptureDepthAndSampleRateConfig({captureConfig, setCaptureConfig, viewConfig, setViewConfig, setCaptureData, defaultCaptureData}) {
    const sampleRateValues = [500, 250, 100, 50, 20, 10];
    const captureDepthValues = [100, 50, 20, 10, 5, 2, 1];

    const [sampleRatePopUpOpen, setSampleRatePopUpOpen] = useState(false);
    const [sampleRatePopUpInputValue, setSampleRatePopUpInputValue] = useState(captureConfig.sampleRate);


    function changeSampleRate(dir) {
        let index = sampleRateValues.indexOf(captureConfig.sampleRate / 1000);
        if (dir == '+' && index > 0) index--;
        else if (dir == '-' && index < sampleRateValues.length - 1) index++;

        let newSampleRate = sampleRateValues[index] * 1000;
        let newSampleRateDiv = Math.round(48000000 / newSampleRate);
        setCaptureConfig({...captureConfig, sampleRate: newSampleRate, sampleRateDiv: newSampleRateDiv});
    }

    function setSampleRate(newSampleRate) {
      setCaptureConfig({...captureConfig, sampleRate: newSampleRate, sampleRateDiv: Math.round(48000000 / newSampleRate)});
    }

    function getRealSampleRate(setSampleRate) {
      let div = Math.round(48000000 / setSampleRate);
      return 48000000 / div;
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

    function isSampleRateValid(sampleRate) {
      return sampleRate <= 500000 && sampleRate >= 735;
    }

    return(
        <div className='flex flex-row'>

        <PopUpWindow active={sampleRatePopUpOpen} setActive={setSampleRatePopUpOpen} title="Sample rate settings">
        <div>
            Set sample rate
            <input 
                autoFocus 
                className={`m-1 text-right appearance-none ${!isSampleRateValid(sampleRatePopUpInputValue) && "bg-red-200"}`}
                type="number" 
                onChange={(e) => setSampleRatePopUpInputValue(e.target.value)}
                value={sampleRatePopUpInputValue}
                size="1">
            </input>
            &nbsp;S/s
        </div>
        <div className='flex'>
            <div className='flex-1'>Real sample rate</div>
            <div className='flex-1 text-right'>
              {isSampleRateValid(sampleRatePopUpInputValue) ? 
              getRealSampleRate(sampleRatePopUpInputValue).toFixed(4) : "-"}
               &nbsp; S/s
            </div>

        </div>
        <div className="flex flex-col items-center">
        <button 
            onClick={(e) => {setSampleRate(sampleRatePopUpInputValue)}}
            disabled={!isSampleRateValid(sampleRatePopUpInputValue)}
            className={`
                flex-1 
                text-center  
                m-1
                px-3
                rounded-md
                shadow
                border-slate-400
                border
                hover:bg-slate-200 
                hover:text-slate-900 
                ${isSampleRateValid(sampleRatePopUpInputValue) ? "text-slate-700 bg-slate-100" : "text-slate-400 bg-slate-100"}
                `}
        >
            Set
        </button>
        </div>

        </PopUpWindow>  


        <div className="mx-1 my-1 pointer-events-auto flex flex-row divide-x divide-slate-400 overflow-hidden  bg-slate-100 rounded-md border text-l leading-5 text-slate-700  border-slate-400 shadow">

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
        <div className="mx-1 my-1 pointer-events-auto flex flex-row divide-x divide-slate-400 overflow-hidden  bg-slate-100 rounded-md text-l leading-5 text-slate-700 border border-slate-400 shadow">
         
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