import React, { useRef, useEffect } from 'react'
import {getNumActiveChannels, formatValue} from './Utils';


function Plot({ data, viewConfig, captureConfig, savedCaptureConfig, cursorConfig }) {

  const canvasRef = useRef(null);

  const draw = (ctx, canvas) => {
    if (canvasRef.current) {
      // canvas.width = canvas.offsetWidth;
      // canvas.height = canvas.offsetHeight;
    }

    // Draw trigger level
    ctx.setLineDash([]);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1;
    ctx.beginPath();
    let triggerChannel = captureConfig.trigger.channels.indexOf(true);
    ctx.moveTo(0, uint12BitToYPos(captureConfig.trigger.threshold * 4096 / 3.3, viewConfig.vertical[triggerChannel].zoom, viewConfig.vertical[triggerChannel].offset));
    ctx.lineTo(canvas.width, uint12BitToYPos(captureConfig.trigger.threshold * 4096 / 3.3, viewConfig.vertical[triggerChannel].zoom, viewConfig.vertical[triggerChannel].offset));

    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(getCursorPos(captureConfig.preTrigger * savedCaptureConfig.captureDepth), 0);
    ctx.lineTo(getCursorPos(captureConfig.preTrigger * savedCaptureConfig.captureDepth), canvas.height);
    ctx.stroke();


    function getCursorPos(pos) {
      let zoomStart = viewConfig.horizontal.viewCenter - savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
      let zoomEnd = viewConfig.horizontal.viewCenter + savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
      return canvas.width * (pos - zoomStart) / (zoomEnd - zoomStart);
    }

    console.log("plot capture cfg", savedCaptureConfig);
    console.log("plot view cfg", viewConfig);

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

      for (let i = 0; i < 7; i += 1) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 7 * (7 - i));
        ctx.lineTo(canvas.width, canvas.height / 7 * (7 - i));
        ctx.stroke();


        let str = Math.round(i * 5) / 10;
        ctx.fillText(String(str + " V"), 3, canvas.height / 7 * (7 - i) - 3);
      }

      ctx.setLineDash([]);
      // Draw line on top of plot
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.stroke();



    }


    function uint12BitToYPos(val, zoom, offset) {
      return ((4096 - val * zoom * 3.3 / 3.5) * (canvas.height) / 4096) - offset * canvas.height / 7;
    }

    // Calculate zoom
    let zoomStart = viewConfig.horizontal.viewCenter - savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;
    let zoomEnd = viewConfig.horizontal.viewCenter + savedCaptureConfig.captureDepth / viewConfig.horizontal.zoom / 2;


    // Draw channels
    ctx.lineWidth = 2.5;
    for (let channelIndex = 0; channelIndex < savedCaptureConfig.activeChannels.length; channelIndex++) {
      if (!savedCaptureConfig.activeChannels[channelIndex])
        continue;

      ctx.beginPath();
      // Zoomed out
      if (zoomEnd - zoomStart >= canvas.width) {
        for (let i = 1; i < canvas.width; i++) {
          let bufferPos = Math.round(zoomStart + i * (zoomEnd - zoomStart) / canvas.width);
          ctx.lineTo(i, uint12BitToYPos(data[channelIndex][bufferPos], viewConfig.vertical[channelIndex].zoom, viewConfig.vertical[channelIndex].offset));
        }
      } else {
        // Zoomed in - draw individual lines between sample points
        zoomStart -= zoomStart % 1;
        zoomEnd -= zoomEnd % 1;
        for (let i = 0; i <= zoomEnd - zoomStart; i++) {
          let xPos = i * canvas.width / (zoomEnd - zoomStart);
          let captureIndex = i + zoomStart;
          let captureVal = data[channelIndex][captureIndex];

          ctx.lineTo(xPos, uint12BitToYPos(captureVal, viewConfig.vertical[channelIndex].zoom, viewConfig.vertical[channelIndex].offset));
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
          ctx.arc(xPos, uint12BitToYPos(captureVal, viewConfig.vertical[channelIndex].zoom, viewConfig.vertical[channelIndex].offset),
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
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    const context = canvas.getContext('2d');
    draw(context, canvas);

    window.addEventListener('resize', () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      draw(context, canvas);
    });

  }, [data, viewConfig, captureConfig, savedCaptureConfig, cursorConfig]);



  return (
    <canvas className="bg-slate-900" ref={canvasRef} />
  );
}
export default Plot;