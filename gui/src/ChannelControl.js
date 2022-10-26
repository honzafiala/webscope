import ValueBox from './ValueBox';
import React, {useState} from 'react';
import './ChannelControl.css';


export default function ChannelControl({number, color}) {
  let [test1, setTest1] = useState(0);
  let [test2, setTest2] = useState(0);
  return (
    <div className="ChannelControl"  style={{backgroundColor: color}}>
      <div className="name" style={{backgroundColor: color}}>Channel {number}</div>
          <ValueBox name="Scale" unit="V" data={test1} setData={setTest1}/>
          <ValueBox name="Vertical" unit="V" data={test2} setData={setTest2}/>
    </div>
    )
}