import React, { useRef, useEffect } from 'react'
const CanvasPlot =({data, config}) => {
  
  const canvasRef = useRef(null)
  const draw = (ctx, canvas, frameCount) => {
    if (canvasRef.current) {
    canvas.width = canvasRef.current.clientWidth;
    canvas.height = canvasRef.current.clientHeight;
    }

    // Draw trigger level
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(0, uint8ToYPos(config.clk, 1));
    ctx.lineTo(canvas.width, uint8ToYPos(config.clk, 1));
    ctx.strokeStyle = 'cyan';
    ctx.stroke();
    ctx.setLineDash([]);


    // Draw vertical trigger
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = 'magenta';
    ctx.stroke();
    ctx.beginPath(canvas.width / 2, canvas.height - 14);
    ctx.moveTo(canvas.width / 2, canvas.height);
    ctx.lineTo(canvas.width / 2 + 15, canvas.height - 7);
    ctx.lineTo(canvas.width / 2, canvas.height - 14);
    ctx.fillStyle = 'magenta';
    ctx.fill();



    // Draw grid
    if (config.grid) {
    ctx.lineWidth = 0.3;
    for (let i = 1; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 10 * i, 0);
        ctx.lineTo(canvas.width / 10 * i, canvas.height);
        ctx.strokeStyle = 'white';
        ctx.stroke();

        ctx.font = "15px Arial";
        ctx.fillStyle = "gray";
        ctx.fillText(String((i - 5) * 40) + " ms", canvas.width / 10 * i + 5, 15);
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


    function uint8ToYPos(val, zoom) {
      return (255 - val) * zoom *canvas.height / 255;
    }

    let data1 = [];
    let data2 = [];


    for (let i = 0; i< data.length; i+= 2) {
      data1.push(data[i]);
      data2.push(data[i + 1]);
    }

    // Calculate zoom
    let zoomStart = (1 - 1 / config.zoom) * data1.length / 2;
    let zoomEnd = data1.length - zoomStart;
    zoomStart -= config.offset;
    zoomEnd -= config.offset;
   // console.log(zoomStart, '->', zoomEnd);

   // Draw channel 1
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 1; i < canvas.width; i++) { 
      let bufferPos = Math.round(zoomStart + i * (zoomEnd - zoomStart) / canvas.width);
      ctx.lineTo(i, uint8ToYPos(data1[bufferPos], config.verticalZoom));
    }
    ctx.strokeStyle = '#d4c84e';
    ctx.stroke();

    // Draw channel 2
    ctx.beginPath();
    for (let i = 1; i < canvas.width; i++) { 
      let bufferPos = Math.round(zoomStart + i * (zoomEnd - zoomStart) / canvas.width);
      ctx.lineTo(i, uint8ToYPos(data2[bufferPos], 1) * 0.8);
    }
    ctx.strokeStyle = '#E78787';
    ctx.stroke();
    
    
 

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
  }, [data, config]);

  return <canvas className="plot" ref={canvasRef}/>;
}
export default CanvasPlot;