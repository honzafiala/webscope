import React, { useRef, useEffect } from 'react'
import {getNumActiveChannels, formatValue} from './Utils';


const CaptureMap =({data, viewConfig, captureConfig, savedCaptureConfig, cursorConfig}) => {

  
  const canvasRef = useRef(null)
  const draw = (ctx, canvas, frameCount) => {
    if (canvasRef.current) {
    canvas.width = canvasRef.current.clientWidth;
    canvas.height = canvasRef.current.clientHeight;
    }

    console.log(data);


    function uint8ToYPos(val, zoom, offset) {
      return ((255 - val) * (canvas.height - 14) / 255) + 8;
    }

    // Calculate zoom
    let zoomStart = viewConfig.horizontal.viewCenter - savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
    let zoomEnd = viewConfig.horizontal.viewCenter + savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;


   // Draw channels
    ctx.lineWidth = 1.5;
    for (let channelIndex = 0; channelIndex < savedCaptureConfig.activeChannels.length; channelIndex++) {
        if (!savedCaptureConfig.activeChannels[channelIndex]) continue;
        ctx.beginPath();
        // Zoomed out
        for (let i = 1; i < canvas.width; i++) { 
            let bufferPos = Math.round(i * data[channelIndex].length / canvas.width);
          //  console.log(i, data[channelIndex][bufferPos]);
            ctx.lineTo(i, uint8ToYPos(data[channelIndex][bufferPos], 1, 0) / getNumActiveChannels(captureConfig) + channelIndex * 30 / getNumActiveChannels(captureConfig));
        }
        ctx.strokeStyle = savedCaptureConfig.channelColors[channelIndex];
        ctx.stroke();  
    }


  };

  useEffect(() => {
    let canvas = canvasRef.current;
    //canvas.width = canvas.clientWidth;
    //canvas.height = canvas.clientHeight;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;
    const render = () => {
      frameCount++;
      draw(context, canvas, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [data, viewConfig, captureConfig, savedCaptureConfig, cursorConfig]);


  return (
        <canvas className="bg-slate-900 h-8 flex-1" ref={canvasRef}/>
    );
}
export default CaptureMap;