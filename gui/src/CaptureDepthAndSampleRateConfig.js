import './CaptureDepthAndSampleRateConfig.css';


export default function CaptureDepthAndSampleRateConfig({captureConfig, setCaptureConfig, viewConfig, setViewConfig, setCaptureData, defaultCaptureData}) {

    const sampleRateValues = [500, 250, 100, 50, 20, 10];
    const captureDepthValues = [100, 50, 20, 10, 5, 2, 1];

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

        let newVal = captureDepthValues[index] * 1000;
        console.log(index);
        setCaptureConfig({...captureConfig, captureDepth: newVal});
        setCaptureData(defaultCaptureData);
        setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, zoom: 1, viewCenter: newVal* 1000 / 2}});
    }

    return(
        <div className='flex flex-row'>
        <div className="mx-1 my-1 pointer-events-auto flex flex-row divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-l leading-5 text-slate-700 border border-slate-300 shadow">
          <div onClick={() => changeSampleRate('-')}
            className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            -
          </div>
          <div 
            className={`text-center py-[2px] px-1 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            Sampling&nbsp;{captureConfig.sampleRate/1000}&nbsp;kS/s
          </div>
          <div onClick={() => changeSampleRate('+')}
            className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            +
          </div>
        </div>  
        <div className="mx-1 my-1 pointer-events-auto flex flex-row divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-l leading-5 text-slate-700 border border-slate-300 shadow">
          <div onClick={() => changeCaptureDepth('-')}
            className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            -
          </div>
          <div 
            className={`text-center py-[2px] px-1 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            Depth&nbsp;{captureConfig.captureDepth/1000}&nbsp;kS
          </div>
          <div onClick={() => changeCaptureDepth('+')}
            className={`text-center py-[2px] px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300`}>
            +
          </div>
        </div>  
       
  </div>  
    );

   
}