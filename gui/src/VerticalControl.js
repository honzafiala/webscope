import ValueBox from './ValueBox';
import React, {useState} from 'react';
import './ChannelControl.css';


export default function VerticalControl() {
  let [test1, setTest1] = useState(1);
  let [test2, setTest2] = useState(0);
  return (
    <div className="ChannelControl">
      <div className="topBar">
        <div className='name'>Horizontal</div> 
          <input className="checkBox"type = "checkbox">
          </input>
        </div>
        <div className='content'>
          <ValueBox name="Scale" unit=" x" data={test1} setData={setTest1}/>
          <ValueBox name="Offset" unit=" div" data={test2} setData={setTest2}/>
        </div>
    </div>
    )
}
