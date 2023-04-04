import React, {useState, useEffect} from 'react';
import SideBarButton from './SideBarButton';
import PopUpWindow from './PopUpWindow';


function generatorConfigToByteArray(generatorConfig) {
    let wrapBytes = [(generatorConfig.wrap - 1) >> 8, (generatorConfig.wrap - 1) & 0xFF];
    let divBytes = [generatorConfig.div >> 8, generatorConfig.div & 0xFF];
    return new Uint8Array([
        2, // Id of generator config message
        wrapBytes[0],
        wrapBytes[1],
        divBytes[0],
        divBytes[1],
        generatorConfig.duty,
        generatorConfig.active
    ]);
}

async function sendGeneratorConfig(generatorConfig, USBDevice) {
    const generatorConfigMessage = generatorConfigToByteArray(generatorConfig);
    await USBDevice.transferOut(3, generatorConfigMessage);
    console.log(generatorConfig);
    console.log("Generator config message sent");
}

export default function GeneratorControl({USBDevice, captureState, generatorConfig, setGeneratorConfig}) {
    //const [generatorConfig, setGeneratorConfig] = useState(defaultGeneratorConfig);
    const [frequencyPopUpActive, setFrequencyPopUpActive] = useState(false);
    const [frequencyPopUpInputValue, setFrequencyPopUpInputValue] = useState(generatorConfig.setFrequency);

    function increaseFrequency() {
        updateFrequency(generatorConfig.setFrequency + 100);
        //sendGeneratorConfig(generatorConfig, USBDevice);
    }

    function decreaseFrequency() {
        updateFrequency(generatorConfig.setFrequency - 100);
        //sendGeneratorConfig(generatorConfig, USBDevice);
    }

    function updateFrequency(setFrequency) {
        const maxWrap = Math.pow(2, 16);
        let div = Math.ceil(generatorConfig.sysClk / setFrequency / maxWrap);
        let wrap = Math.round(generatorConfig.sysClk / setFrequency / div);
        let realFrequency = generatorConfig.sysClk / div / wrap;

        setGeneratorConfig({...generatorConfig, realFrequency: realFrequency, setFrequency: setFrequency, div: div, wrap: wrap});
        //sendGeneratorConfig({...generatorConfig, realFrequency: realFrequency, setFrequency: setFrequency, div: div, wrap: wrap}, USBDevice);
    }

    function isFrequencyValid(frequency) {
        return frequency >= 100 && frequency <= 100000000;
    }

    function getRealFrequency(setFrequency) {
        const maxWrap = Math.pow(2, 16);
        let div = Math.ceil(generatorConfig.sysClk / setFrequency / maxWrap);
        let wrap = Math.round(generatorConfig.sysClk / setFrequency / div);
        return generatorConfig.sysClk / div / wrap;
    }

    function formatFrequency(frequency) {
        if (frequency >= 1000000) {
            frequency /= 1000000;
            return String(frequency.toFixed(3)) + " MHz";
        } else if (frequency >= 1000) {
            frequency /= 1000;
            return String(frequency.toFixed(3)) + " kHz";
        } else {
            return String(frequency.toFixed(3)) + " Hz";
        }
    }

    function changeDuty(dir) {
        let newVal = generatorConfig.duty;
        if (dir == '-' && newVal > 10) {
            newVal -= 10;
        } else if (dir == '+' && newVal < 100){
            newVal += 10;
        }
        setGeneratorConfig({...generatorConfig, duty: newVal});
        generatorConfig.duty = newVal;
        //sendGeneratorConfig(generatorConfig, USBDevice);
    }

    function toggleActive() {
        setGeneratorConfig({...generatorConfig, active: !generatorConfig.active});
        //sendGeneratorConfig({...generatorConfig, active: !generatorConfig.active}, USBDevice);
    }


  console.log('capture state:', captureState);

  

  return (


    <div className="my-1 mx-1 bg-white rounded-md border border-slate-400  shadow text-slate-700 text-l">

    <PopUpWindow active={frequencyPopUpActive} setActive={setFrequencyPopUpActive} title="Generator frequency settings">
        <div>
            Set frequency
            <input 
                autoFocus 
                className={`m-1 text-right appearance-none ${!isFrequencyValid(frequencyPopUpInputValue) && "bg-red-200"}`}
                style={{"caretShape" : "block", "WebkitAppearance" : "none"}} 
                type="number" 
                onChange={(e) => setFrequencyPopUpInputValue(e.target.value)}
                value={frequencyPopUpInputValue}
                size="1">
            </input>
            &nbsp;Hz
        </div>
        <div className='flex'>
            <div className='flex-1'>Real frequency</div>
            <div className='flex-1 text-right'>{isFrequencyValid(frequencyPopUpInputValue) ? getRealFrequency(frequencyPopUpInputValue).toFixed(4) : "-"} &nbsp; Hz</div>
        </div>

        <div className="flex flex-col items-center">
        <button 
            onClick={() => {updateFrequency(frequencyPopUpInputValue);}}
            disabled={!isFrequencyValid(frequencyPopUpInputValue)}
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
                ${isFrequencyValid(frequencyPopUpInputValue) ? "text-slate-700 bg-slate-100" : "text-slate-400 bg-slate-100"}
                `}
        >
            Set
        </button>
        </div>
    </PopUpWindow>


    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
        <div className={`flex-1 px-3 py-[2px]  ${generatorConfig.active ? "text-slate-700 bg-slate-200" : "text-slate-400 bg-slate-100"}`}>Gen.&nbsp;</div>
        
        <SideBarButton onClick={toggleActive} enabled={USBDevice && captureState == "Stopped"} text={generatorConfig.active ? 'ON' : 'OFF'}/>
        
   
    </div>


    <div className="flex px-1 border-x border-slate-300">
      <div className="flex-1 "><i>f</i></div>
      <div>
     {formatFrequency(generatorConfig.realFrequency)}
      
    </div>
    </div>

    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
        <SideBarButton enabled={captureState == "Stopped" && generatorConfig.active} text="-" onClick={decreaseFrequency}/>
        <SideBarButton enabled={captureState == "Stopped" && generatorConfig.active} text="Edit" onClick={() => setFrequencyPopUpActive(true)}/>
        <SideBarButton enabled={captureState == "Stopped" && generatorConfig.active} text="+" onClick={increaseFrequency}/>
    </div>

    <div className="flex px-1 border-x border-slate-300">
      <div className="flex-1 ">Duty</div>
      <div>{Math.round(generatorConfig.duty)}&nbsp;%</div>
    </div>

    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-md  bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
        <SideBarButton enabled={captureState == "Stopped" && generatorConfig.active} text="-" onClick={() => changeDuty('-')}/>
        <SideBarButton enabled={captureState == "Stopped" && generatorConfig.active} text="+" onClick={() => changeDuty('+')}/>
    
    </div>

    


</div>

  );

}
