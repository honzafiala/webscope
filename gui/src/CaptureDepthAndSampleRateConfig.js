import './CaptureDepthAndSampleRateConfig.css';


export default function CaptureDepthAndSampleRateConfig({captureConfig, setCaptureConfig, viewConfig, setViewConfig, setCaptureData, defaultCaptureData}) {

    const sampleRateValues = [500, 250, 100, 50, 20, 10];
    const captureLengthValues = [100, 50, 20, 10, 5, 2, 1];

    function changeSampleRate(val) {
        setCaptureConfig({...captureConfig, sampleRate: val.target.value * 1000});

    }

    function changeCaptureDepth(val) {
        setCaptureConfig({...captureConfig, captureDepth: val.target.value * 1000});
   
        setCaptureData(defaultCaptureData);

        setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, zoom: 1, viewCenter: val.target.value * 1000 / 2}});
    
    }


    return (
        <div className='CaptureControl'>
            <div>
            Sample rate 
            <select value={captureConfig.sampleRate / 1000} onChange={changeSampleRate}>
                {
                    sampleRateValues.map((sampleRate, index) => (
                        <option value={sampleRate} key={index}>{sampleRate} kS/s</option>
                    ))
                }
            </select>
            </div>
        <div>
        Capture length 
        <select value={captureConfig.captureDepth / 1000} onChange={changeCaptureDepth}>
            {
                captureLengthValues.map((capptureLength, index) => (
                    <option value={capptureLength} key={index}>{capptureLength} kS</option>
                ))
            }
        </select>
        </div>
        </div>
    );
}