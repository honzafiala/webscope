import React, { useEffect, useRef } from "react";

import { WebglPlot, WebglLine, ColorRGBA } from "webgl-plot";

let webglp;
let line, horizontal;



export default function WebglAppSin({data, test}) {
  const canvasMain = useRef(null);


  useEffect(() => {
    if (canvasMain.current) {
      
      canvasMain.current.width = canvasMain.current.clientWidth * window.devicePixelRatio;
      canvasMain.current.height = canvasMain.current.parentElement.offsetHeight * window.devicePixelRatio;

      console.log(canvasMain.current.clientHeight);
      console.log('parent', canvasMain.current.clientHeight);


      webglp = new WebglPlot(canvasMain.current);
      const numX = 1000;

      line = new WebglLine(new ColorRGBA(1, 0, 0, 1), numX);
      webglp.addLine(line);

      line.arrangeX();


      horizontal = new WebglLine(new ColorRGBA(0, 0, 0, 1), numX);
      webglp.addLine(horizontal);

      horizontal.arrangeX();
    }
  }, []);

  useEffect(() => {
    let id = 0;
    let renderPlot = () => {

      for (let i = 0; i < line.numPoints; i++) {


        let y = data[Math.round((data.length - 1) * i / line.numPoints)];

        line.setY(i, y / 300);
      }
      id = requestAnimationFrame(renderPlot);
      webglp.update();
    };
    id = requestAnimationFrame(renderPlot);

    return () => {
      renderPlot = () => {};
      cancelAnimationFrame(id);
    };
  }, [data]);

  const canvasStyle = {
    width: "100%",
    height: "100%",
    padding: 0,
    margin:  0
    };

  return (
       <canvas style={canvasStyle} ref={canvasMain} />
  );
}
