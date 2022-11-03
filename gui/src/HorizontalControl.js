import SettingControl from './SettingControl';
import React, {useState} from 'react';
import './ChannelControl.css';


export default function HorizontalControl({config, setConfig}) {
  let [offset, setOffset] = useState(0);


  function zoomCallback(dir) {


    if (dir == '0') {
      setConfig({...config, zoom: 1});
      return;
    }
    if (config.zoom <= 1 && dir == '-') return;
    let d = String(config.zoom)[0];
    let newVal = config.zoom;
    if (d == 1)
      if (dir == '-' ) newVal /= 2;
      else newVal *= 2;
    else if (d == 2)
      if (dir == '-') newVal /= 2;
      else newVal *= 5/2;
    else if (d == 5)
      if (dir == '-') newVal /= 5/2;
      else newVal *= 2;
      setConfig({...config, zoom: newVal});

  }

  function offsetCallback(dir) {
    let newVal = config.offset;
    let change = 200000 / 10 / config.zoom / 2;
    if (dir == '+') newVal += change;
    else if (dir == '-') newVal -= change;
    else if (dir == '0') newVal = 0;
    console.log(newVal);
    setConfig({...config, offset: newVal});
  }

  return (
    <div className="ChannelControl">
      <div className="topBar" style={{backgroundColor: "#ACACAC"}}>
        <div className='name'>Horizontal</div> 
        </div>
        <div className='content'>
          <SettingControl name="Zoom" unit=" x" data={config.zoom} callback={zoomCallback}/>
          <SettingControl name="Offset" unit=" S" data={config.offset} callback={offsetCallback}/>
        </div>
    </div>
    )
}
