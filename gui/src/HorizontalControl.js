import ValueBox from './ValueBox';
import React, {useState} from 'react';
import './ChannelControl.css';


export default function HorizontalControl() {
  let [test, setTest] = useState(0);
  return (
    <div className="ChannelControl">
      <div className="name" style={{backgroundColor: "gray"}}>Horizontal</div>
          <ValueBox name="Scale" unit="div/s" data={test} setData={setTest}/>
          <ValueBox name="Offset" unit="s" data={test} setData={setTest}/>
    </div>
    )
}
