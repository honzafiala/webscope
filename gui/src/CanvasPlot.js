import React, { useRef, useEffect } from 'react'
import {getNumActiveChannels, formatValue} from './Utils';


const CanvasPlot =({data, viewConfig, captureConfig, savedCaptureConfig, cursorConfig}) => {
  
  const canvasRef = useRef(null)
  const draw = (ctx, canvas, frameCount) => {
    if (canvasRef.current) {
    canvas.width = canvasRef.current.clientWidth;
    canvas.height = canvasRef.current.clientHeight;
    }

    // Fill whole canvas with background color


    // Draw trigger level
    ctx.setLineDash([]);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, uint8ToYPos(captureConfig.trigger.threshold, viewConfig.vertical[0].zoom, viewConfig.vertical[0].offset));
    ctx.lineTo(canvas.width, uint8ToYPos(captureConfig.trigger.threshold, viewConfig.vertical[0].zoom, viewConfig.vertical[0].offset));

    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(getCursorPos(captureConfig.preTrigger * savedCaptureConfig.captureDepth), 0);
    ctx.lineTo(getCursorPos(captureConfig.preTrigger * savedCaptureConfig.captureDepth), canvas.height);
    ctx.stroke();

    // Draw vertical cursor 1
    function getCursorPos(pos) {
      let zoomStart = viewConfig.horizontal.viewCenter - savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
      let zoomEnd = viewConfig.horizontal.viewCenter + savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
      return canvas.width * (pos - zoomStart) / (zoomEnd - zoomStart);
    }

    if (cursorConfig.visible) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(getCursorPos(cursorConfig.start), 0);
    ctx.lineTo(getCursorPos(cursorConfig.start), canvas.height);
    ctx.strokeStyle = 'magenta';
    ctx.stroke();
    

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(getCursorPos(cursorConfig.end), 0);
    ctx.lineTo(getCursorPos(cursorConfig.end), canvas.height);
    ctx.strokeStyle = 'magenta';
    ctx.stroke();


    }
    ctx.setLineDash([]);



    // Draw grid
    if (viewConfig.grid) {
    ctx.setLineDash([3, 6]);
    ctx.lineWidth = 0.3;
    for (let i = 1; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 10 * i, 0);
        ctx.lineTo(canvas.width / 10 * i, canvas.height);
        ctx.strokeStyle = 'white';
        ctx.stroke();

        ctx.font = "15px Arial";
        ctx.fillStyle = "white";

        let zoomStart = viewConfig.horizontal.viewCenter - savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
        

        let divMs = 100 * savedCaptureConfig.captureDepth / savedCaptureConfig.sampleRate * getNumActiveChannels(savedCaptureConfig) / viewConfig.horizontal.zoom;
        let zoomStartMs = 1000 * (zoomStart - savedCaptureConfig.captureDepth * savedCaptureConfig.preTrigger) / savedCaptureConfig.sampleRate * getNumActiveChannels(savedCaptureConfig);
        
        let time = zoomStartMs + i * divMs;
        time = Math.round(time * 100) / 100;
        
        ctx.fillText(String(time) + " ms", canvas.width / 10 * i + 5, 15);
      }

    for (let i = 0; i < 3.3; i += 0.5) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 3.3 * (3.3 - i));
        ctx.lineTo(canvas.width, canvas.height / 3.3 * (3.3 - i));
        ctx.stroke();


        let str = Math.round(i * 10) / 10;
        ctx.fillText(String(str + " V"), 5, canvas.height / 3.3 * (3.3 - i) - 5);
    }
    ctx.setLineDash([]);

  }


    function uint8ToYPos(val, zoom, offset) {
      return ((255 - val * zoom) * canvas.height / 255) - 0  * (0.5 / 3.3 * 255) - offset * 3.5 / 3.3 * canvas.height / 7 ;
    }

    // Calculate zoom
    let zoomStart = viewConfig.horizontal.viewCenter - savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
    let zoomEnd = viewConfig.horizontal.viewCenter + savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;


   // Draw channels
    ctx.lineWidth = 2.5;
    for (let channelIndex = 0; channelIndex < savedCaptureConfig.activeChannels.length; channelIndex++) {
      if (!savedCaptureConfig.activeChannels[channelIndex]) continue;

      ctx.beginPath();
      // Zoomed out
      if (zoomEnd - zoomStart >= canvas.width) {
      for (let i = 1; i < canvas.width; i++) { 
        let bufferPos = Math.round(zoomStart + i * (zoomEnd - zoomStart) / canvas.width);
        ctx.lineTo(i, uint8ToYPos(data[channelIndex][bufferPos], viewConfig.vertical[channelIndex].zoom, viewConfig.vertical[channelIndex].offset));
      }
      } else {
      // Zoomed in - draw individual lines between sample points
        zoomStart -= zoomStart % 1;
        zoomEnd -= zoomEnd % 1;
        for (let i = 0; i <= zoomEnd - zoomStart; i++) {
          let xPos = i * canvas.width / (zoomEnd - zoomStart);
          let captureIndex = i + zoomStart;
          let captureVal = data[channelIndex][captureIndex];          

          ctx.lineTo(xPos, uint8ToYPos(captureVal, viewConfig.vertical[channelIndex].zoom, viewConfig.vertical[channelIndex].offset));
        }
      }
      ctx.strokeStyle = savedCaptureConfig.channelColors[channelIndex];
      ctx.stroke();

      // Draw circles at sample points when zoomed in 
      if (zoomEnd - zoomStart < 50) {
      zoomStart -= zoomStart % 1;
      zoomEnd -= zoomEnd % 1;
      for (let i = 0; i < zoomEnd - zoomStart; i++) {
        let xPos = i * canvas.width / (zoomEnd - zoomStart);
        let captureIndex = i + zoomStart;
        let captureVal = data[channelIndex][captureIndex];     
        
        ctx.beginPath();
        ctx.arc(xPos, uint8ToYPos(captureVal, viewConfig.vertical[channelIndex].zoom, viewConfig.vertical[channelIndex].offset),
         3, 0, 2 * Math.PI);
        ctx.stroke(); 
        ctx.fillStyle = savedCaptureConfig.channelColors[channelIndex];
        ctx.fill();

      }
    }
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


  return <canvas className="plot bg-slate-800 " ref={canvasRef}/>;
}
export default CanvasPlot;