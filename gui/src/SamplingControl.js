import './SamplingControl.css';


export default function SamplingControl({captureConfig, setCaptureConfig}) {

    const sampleRateValues = [500, 250, 100, 50, 20, 10];
    const captureLengthValues = [100000, 50000, 20000, 10000, 5000, 2000, 1000];

    function changeSampleRate(val) {
        setCaptureConfig({...captureConfig, sampleRate: val.target.value});
    }

    function changeCaptureDepth(val) {
        setCaptureConfig({...captureConfig, captureDepth: val.target.value});
    }


    return (
        <div className='CaptureControl'>
            <div>
            Sample rate 
            <select value={captureConfig.sampleRate} onChange={changeSampleRate}>
                {
                    sampleRateValues.map((sampleRate, index) => (
                        <option value={sampleRate} key={index}>{sampleRate} kS/s</option>
                    ))
                }
            </select>
            </div>
        <div>
        Capture length 
        <select value={captureConfig.captureDepth} onChange={changeCaptureDepth}>
            {
                captureLengthValues.map((capptureLength, index) => (
                    <option value={capptureLength} key={index}>{capptureLength} S</option>
                ))
            }
        </select>
        </div>
        </div>
    );
}