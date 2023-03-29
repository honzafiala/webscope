import React, { useCallback, useEffect, useLayoutEffect, useState, useRef } from "react";
import classnames from "classnames";

const CursorSliderOverlay = ({cursorConfig, setCursorConfig, captureConfig, viewConfig }) => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [sliderState, setSliderState] = useState('none');

  function cursorPosToXOffset(pos) {
    return parseInt(width * pos / 100);
  }

  function cursorPosToYOffset(pos) {
    return parseInt(height * pos / 100);
  }

  function xOffsetToCursorPos(offset) {
    return 100 * offset / width;
  }

  function yOffsetToCursorPos(offset) {
    return 100 * offset / height;
  }

  function handleMouseDown(event) {
    if (sliderState) return;
    let mousePosX = event.nativeEvent.offsetX;
    let mousePosY = height - event.nativeEvent.offsetY;
    console.log(mousePosX, mousePosY, cursorPosToYOffset(cursorConfig.y.start));
    if (mousePosX > cursorPosToXOffset(cursorConfig.x.start) - 20 && mousePosX < cursorPosToXOffset(cursorConfig.x.start) + 20) {
      setSliderState('x_start');
      console.log('left...');
    } else if (mousePosX > cursorPosToXOffset(cursorConfig.x.end) - 20 && mousePosX < cursorPosToXOffset(cursorConfig.x.end) + 20) {
      setSliderState('x_end');
      console.log('right...');
    } else if (mousePosY > cursorPosToYOffset(cursorConfig.y.start) - 20 && mousePosY < cursorPosToYOffset(cursorConfig.y.start) + 20) {
      setSliderState('y_start');
      console.log('bottom...');
    } else if (mousePosY > cursorPosToYOffset(cursorConfig.y.end) - 20 && mousePosY < cursorPosToYOffset(cursorConfig.y.end) + 20) {
      setSliderState('y_end');
      console.log('top...');
    }
  }

  function handleDrag(event) {
    let newOffsetX = event.nativeEvent.offsetX;
    let newOffsetY = height - event.nativeEvent.offsetY;
    if (sliderState == 'x_start') {
      if (newOffsetX >= cursorPosToXOffset(cursorConfig.x.end)) return;
      setCursorConfig({...cursorConfig, x: {...cursorConfig.x, start: xOffsetToCursorPos(newOffsetX)}});
    }
    else if (sliderState == 'x_end') {
      if (newOffsetX <= cursorPosToXOffset(cursorConfig.x.start)) return;
      setCursorConfig({...cursorConfig, x: {...cursorConfig.x, end: xOffsetToCursorPos(newOffsetX)}});
    } else if (sliderState == 'y_start') {
      if (newOffsetY >= cursorPosToYOffset(cursorConfig.y.end)) return;
      setCursorConfig({...cursorConfig, y: {...cursorConfig.y, start: yOffsetToCursorPos(newOffsetY)}});
    } else if (sliderState == 'y_end') {
      if (newOffsetY <= cursorPosToYOffset(cursorConfig.y.start)) return;
      setCursorConfig({...cursorConfig, y: {...cursorConfig.y, end: yOffsetToCursorPos(newOffsetY)}});
    }
  }


  useEffect(() => {
    setWidth(ref.current.offsetWidth);
    setHeight(ref.current.offsetHeight);

    function handleResize() {
      setWidth(ref.current.offsetWidth);
      setHeight(ref.current.offsetHeight);
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);

  }, []);

  return (
    <div
      ref={ref}
      onMouseDown={(event) => handleMouseDown(event)} 
      onMouseUp={() => {setSliderState(0)}} 
      onMouseLeave={() => setSliderState(0)}
      onMouseMove={(event) => handleDrag(event)} 
      className="absolute z-40 h-full w-full"
    >
      {
        cursorConfig.x.visible &&
        <div className={`absolute border-l border-fuchsia-500  h-full w-[20px] pointer-events-none`}
        style={{"left": cursorPosToXOffset(cursorConfig.x.start), "pointerEvents": "none"}}></div>
      } 
      {
        cursorConfig.x.visible &&
        <div className={`absolute border-r border-fuchsia-500  h-full w-[20px] pointer-events-none`}
        style={{"left": cursorPosToXOffset(cursorConfig.x.end) - 20}}></div> 
      } 
      {
        cursorConfig.y.visible &&
        <div className={`absolute border-b border-fuchsia-500  w-full h-[20px] pointer-events-none`}
        style={{"bottom": cursorPosToYOffset(cursorConfig.y.start), "pointerEvents": "none"}}></div>
      } 
      {
        cursorConfig.y.visible &&
        <div className={`absolute border-t border-fuchsia-500  w-full h-[20px] pointer-events-none`}
        style={{"bottom": cursorPosToYOffset(cursorConfig.y.end) - 20, "pointerEvents": "none"}}></div>
      } 
    </div>
  );
};



export default CursorSliderOverlay;
