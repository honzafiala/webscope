import React, { useEffect, useRef } from "react";

import { WebglPlot, WebglLine, ColorRGBA } from "webgl-plot";

let webglp;
let line;



export default function WebglAppSin({data, test}) {
  const canvasMain = useRef(null);
  let freq = 1;
  let amp = 1;
  let noise = 0.5;


  useEffect(() => {
    if (canvasMain.current) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvasMain.current.width =
        canvasMain.current.clientWidth * devicePixelRatio;
      canvasMain.current.height =
        canvasMain.current.clientHeight * devicePixelRatio;

      webglp = new WebglPlot(canvasMain.current);
      const numX = 1000;

      line = new WebglLine(new ColorRGBA(1, 0, 0, 1), numX);
      webglp.addLine(line);

      line.arrangeX();
    }
  }, []);

  useEffect(() => {
    let id = 0;
    let renderPlot = () => {
      //const freq = 0.001;
      //const noise = 0.1;
      //const amp = 0.5;
      const noise1 = noise || 0.1;

      for (let i = 0; i < line.numPoints; i++) {


        let y = data[Math.round((data.length - 1) * i / line.numPoints)];

        line.setY(i, y / 300);
      }
      id = requestAnimationFrame(renderPlot);
      webglp.update();
      console.log("update", test, data.length);
    };
    id = requestAnimationFrame(renderPlot);

    return () => {
      renderPlot = () => {};
      cancelAnimationFrame(id);
    };
  }, [data]);

  const canvasStyle = {
    width: "100%",
    height: "70vh"
  };

  return (
    <div>
      <canvas style={canvasStyle} ref={canvasMain} />
    </div>
  );
}
