import './Floating.css'

export default function Floating({captureConfig, captureData, cursorConfig}) {
  let t1 = (cursorConfig.cursorX.start - captureConfig.captureDepth * captureConfig.preTrigger) / captureConfig.sampleRate * 1000;
  let t2 = (cursorConfig.cursorX.end - captureConfig.captureDepth * captureConfig.preTrigger) / captureConfig.sampleRate * 1000;

  t1 = Math.round(t1 * 100) / 100;
  t2 = Math.round(t2 * 100) / 100;

  let deltaT = Math.round((t2 - t1) * 100) / 100;

  let f = 1000/deltaT; 
  f = Math.round(f * 100) / 100;


  let v1, v2, deltaV;

  if (captureData[0].length) {
  v1 = captureData[0][cursorConfig.cursorX.start] * 3.3 / 255;
  v2 = captureData[0][cursorConfig.cursorX.end] * 3.3 / 255;

  v1 = Math.round(v1 * 100) / 100;
  v2 = Math.round(v2 * 100) / 100;

  deltaV = Math.round((v2 - v1) * 100) / 100;

  } else {
    v1 = "-";
    v2 = "-";
    deltaV = '-'
  }

    return(
        <div className='floating'> 
  <table>
  <tr>
    <td><b>t1</b></td>
    <td>{t1} ms</td>
  </tr>
  <tr>
  <td><b>t2</b></td>
    <td>{t2} ms</td>
  </tr>
  <tr>
  <td><b>Δt</b></td>
    <td>{deltaT} ms</td>
  </tr>
  <tr>
    <td><b>V1</b></td>
    <td>{v1} V</td>
  </tr>
  <tr>
  <td><b>V2</b></td>
    <td>{v2} V</td>
  </tr>
  
  <tr>
  <td><b>Δv</b></td>
    <td>{deltaV} V</td>
  </tr>

  <tr>
  <td><b>f</b></td>
    <td>{f} Hz</td>
  </tr>


</table>
      </div>
    );
}