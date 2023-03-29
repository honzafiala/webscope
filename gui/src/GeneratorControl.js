import React, {useState, useEffect} from 'react';
import SideBarButton from './SideBarButton';

let defaultGeneratorConfig = {
    active: false,
    frequency: 1000,
    duty: 50,
    wrap: 12500,
    div: 10,
    sysClk: 125000000
}



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

export default function GeneratorControl({USBDevice, captureState}) {
    const [generatorConfig, setGeneratorConfig] = useState(defaultGeneratorConfig);
    const [frequencyInput, setFrequencyInput] = useState(generatorConfig.frequency.toString());

    function onFrequencyInputChange(e) {
        console.log(e.target.value);
        setFrequencyInput(e.target.value);

        generatorConfig.frequency = e.target.value;

        const maxWrap = Math.pow(2, 16);
        let div = Math.ceil(generatorConfig.sysClk / generatorConfig.frequency / maxWrap);
        let wrap = Math.round(generatorConfig.sysClk / generatorConfig.frequency / div);
        console.log('div', div);
        console.log('wrap', wrap);
        let f = generatorConfig.sysClk / div / wrap;
        console.log('fPWM:', f);

        generatorConfig.div = div;
        generatorConfig.wrap = wrap;
        setGeneratorConfig({...generatorConfig, frequency: e.target.value, div: div, wrap: wrap});
        sendGeneratorConfig(generatorConfig, USBDevice);

    }

    function changeFrequency(dir) {
        let newVal = generatorConfig.frequency;
        if (dir == '-' && newVal > 0) {
            newVal -= 100;
        } else if (dir == '+') {
            newVal += 100;
        }
        generatorConfig.frequency = newVal;

        const maxWrap = Math.pow(2, 16);
        let div = Math.ceil(generatorConfig.sysClk / generatorConfig.frequency / maxWrap);
        let wrap = Math.round(generatorConfig.sysClk / generatorConfig.frequency / div);
        console.log('div', div);
        console.log('wrap', wrap);
        let f = generatorConfig.sysClk / div / wrap;
        console.log('fPWM:', f);

        generatorConfig.div = div;
        generatorConfig.wrap = wrap;
        setGeneratorConfig({...generatorConfig, frequency: newVal, div: div, wrap: wrap});
        sendGeneratorConfig(generatorConfig, USBDevice);
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
        sendGeneratorConfig(generatorConfig, USBDevice);
    }

    function toggleActive() {
        setGeneratorConfig({...generatorConfig, active: !generatorConfig.active});
        sendGeneratorConfig({...generatorConfig, active: !generatorConfig.active}, USBDevice);
    }


  console.log('capture state:', captureState);

  

  return (

    <div className="my-1 mx-1 bg-white rounded-md  shadow text-slate-700 text-l">
{false &&
    <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2  z-50'>
    <div className='my-1 mx-1 bg-white rounded-md  shadow text-slate-700 text-l'>
         <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
        <div className=" px-3 py-[2px]  text-slate-700 bg-slate-200">Generator frequency settings</div>
    
        <SideBarButton onClick={toggleActive} enabled="true" text="X"/>
        


   
    </div>

    <div className="flex px-1 border-x border-slate-300">
      <div className="flex-1 ">Set frequency</div>
      <div>{Math.round(generatorConfig.duty)}&nbsp;%</div>
    </div>

    <div className="flex px-1 border-x border-b border-slate-300 rounded-b-md">
      <div className="flex-1 ">Real frequency</div>
      <div>{Math.round(generatorConfig.duty)}&nbsp;%</div>
    </div>

    </div>
    </div>
}

    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
        <div className={`flex-1 px-3 py-[2px]  ${generatorConfig.active ? "text-slate-700 bg-slate-200" : "text-slate-400 bg-slate-100"}`}>Gen.&nbsp;</div>
        
        <SideBarButton onClick={toggleActive} enabled={USBDevice && captureState == "Stopped"} text={generatorConfig.active ? 'ON' : 'OFF'}/>
        
   
    </div>


    <div className="flex px-1 border-x border-slate-300">
      <div className="flex-1 "><i>f</i></div>
      <div>
        <input 
            type="text"     
            value={generatorConfig.frequency} 
            onChange={e => onFrequencyInputChange(e)} 
            size="1"
            className="bg-transparent"
        />
        &nbsp;Hz
    </div>
    </div>

    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
        <SideBarButton enabled={captureState == "Stopped" && generatorConfig.active} text="-" onClick={() => changeFrequency('-')}/>
        <SideBarButton enabled={captureState == "Stopped" && generatorConfig.active} text="+" onClick={() => changeFrequency('+')}/>
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
