import React, { useRef, useEffect } from 'react'
const CanvasPlot =({data, viewConfig, captureConfig, cursorConfig}) => {
  
  const canvasRef = useRef(null)
  const draw = (ctx, canvas, frameCount) => {
    if (canvasRef.current) {
    canvas.width = canvasRef.current.clientWidth;
    canvas.height = canvasRef.current.clientHeight;
    }

    // Fill whole canvas with background color
    ctx.fillStyle = "#272727";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    // Draw trigger level
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(0, uint8ToYPos(captureConfig.trigger.threshold, viewConfig.vertical[0].zoom, viewConfig.vertical[0].offset));
    ctx.lineTo(canvas.width, uint8ToYPos(captureConfig.trigger.threshold, viewConfig.vertical[0].zoom, viewConfig.vertical[0].offset));
    ctx.strokeStyle = 'cyan';
    ctx.stroke();

    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(getCursorPos(captureConfig.preTrigger * captureConfig.captureDepth), 0);
    ctx.lineTo(getCursorPos(captureConfig.preTrigger * captureConfig.captureDepth), canvas.height);
    ctx.strokeStyle = 'cyan';
    ctx.stroke();

    // Draw vertical cursor 1
    function getCursorPos(pos) {
      let zoomStart = viewConfig.horizontal.viewCenter - captureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
      let zoomEnd = viewConfig.horizontal.viewCenter + captureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
      return canvas.width * (pos - zoomStart) / (zoomEnd - zoomStart);
    }

    if (cursorConfig.cursorX.visible) {
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(getCursorPos(cursorConfig.cursorX.start), 0);
    ctx.lineTo(getCursorPos(cursorConfig.cursorX.start), canvas.height);
    ctx.strokeStyle = 'magenta';
    ctx.stroke();
    

    ctx.lineWidth = 2;
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(getCursorPos(cursorConfig.cursorX.end), 0);
    ctx.lineTo(getCursorPos(cursorConfig.cursorX.end), canvas.height);
    ctx.strokeStyle = 'magenta';
    ctx.stroke();


    }
    ctx.setLineDash([]);



    // Draw grid
    if (viewConfig.grid) {
    ctx.lineWidth = 0.3;
    for (let i = 1; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 10 * i, 0);
        ctx.lineTo(canvas.width / 10 * i, canvas.height);
        ctx.strokeStyle = 'white';
        ctx.stroke();

        ctx.font = "15px Arial";
        ctx.fillStyle = "gray";

        let zoomStart = viewConfig.horizontal.viewCenter - captureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
        

        let divMs = 100 * captureConfig.captureDepth / captureConfig.sampleRate / viewConfig.horizontal.zoom;
        let zoomStartMs = 1000 * (zoomStart - captureConfig.captureDepth * captureConfig.preTrigger) / captureConfig.sampleRate;
        ctx.fillText(String(zoomStartMs + i * divMs) + " ms", canvas.width / 10 * i + 5, 15);
      }

    for (let i = 0.5; i < 3.3; i += 0.5) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 3.3 * (3.3 - i));
        ctx.lineTo(canvas.width, canvas.height / 3.3 * (3.3 - i));
        ctx.strokeStyle = 'white';
        ctx.stroke();

        ctx.font = "15px Arial";
        ctx.fillStyle = "gray";
        let str = Math.round(i * 10) / 10;
        ctx.fillText(String(str + " V"), 5, canvas.height / 3.3 * (3.3 - i) - 5);
    }
  }


    function uint8ToYPos(val, zoom, offset) {
      return ((255 - val * zoom) * canvas.height / 255) - 0  * (0.5 / 3.3 * 255) - offset * 3.5 / 3.3 * canvas.height / 7 ;
    }

    // Calculate zoom
    let zoomStart = viewConfig.horizontal.viewCenter - captureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
    let zoomEnd = viewConfig.horizontal.viewCenter + captureConfig.captureDepth / viewConfig.horizontal.zoom / 2;


   // Draw channels
    ctx.lineWidth = 3;
    for (let channelIndex = 0; channelIndex < captureConfig.activeChannels.length; channelIndex++) {
      if (!captureConfig.activeChannels[channelIndex]) continue;
      ctx.beginPath();
      for (let i = 1; i < canvas.width; i++) { 
        let bufferPos = Math.round(zoomStart + i * (zoomEnd - zoomStart) / canvas.width);
        ctx.lineTo(i, uint8ToYPos(data[channelIndex][bufferPos], viewConfig.vertical[channelIndex].zoom, viewConfig.vertical[channelIndex].offset));
      }
      ctx.strokeStyle = captureConfig.channelColors[channelIndex];
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
  }, [data, viewConfig, captureConfig, cursorConfig]);


  return <canvas className="plot" ref={canvasRef}/>;
}
export default CanvasPlot;