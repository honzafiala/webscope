import {useEffect, useState, useRef} from 'react';
import Draggable from 'react-draggable';

export default function HorizontalSlider({viewConfig}) {
    let sliderRef = useRef(null);
    const [width, setWidth] = useState(0);
    console.log(viewConfig);

 



    return(
        <div className='absolute left-[140px] right-[140px]' ref={sliderRef}>
            <Draggable axis="x" bounds="parent">
            <div className={"h-6  bg-slate-50 z-10 opacity-30"} style={{"width": String(width) + "px"}}>kokos</div>
            </Draggable>
        </div>
    );
}