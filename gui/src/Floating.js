import './Floating.css';
import getNumActiveChannels from './Utils';

export default function Floating({captureConfig, captureData, cursorConfig}) {
  let t1 = (cursorConfig.start - captureConfig.captureDepth * captureConfig.preTrigger) / captureConfig.sampleRate * 1000 * getNumActiveChannels(captureConfig);
  let t2 = (cursorConfig.end - captureConfig.captureDepth * captureConfig.preTrigger) / captureConfig.sampleRate * 1000 * getNumActiveChannels(captureConfig);

  t1 = Math.round(t1 * 100) / 100;
  t2 = Math.round(t2 * 100) / 100;

  let deltaT = Math.round((t2 - t1) * 100) / 100;

  let f = 1000/deltaT; 
  f = Math.round(f * 100) / 100;


  let v1, v2, deltaV;

  if (captureData[cursorConfig.channel].length) {
  v1 = captureData[cursorConfig.channel][cursorConfig.start] * 3.3 / 255;
  v2 = captureData[cursorConfig.channel][cursorConfig.end] * 3.3 / 255;

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
    <tbody>
  <tr>
    <td><i><b>t<sub>1</sub></b></i></td>
    <td>{t1} ms</td>
  </tr>
  <tr>
  <td><i><b>t<sub>2</sub></b></i></td>
    <td>{t2} ms</td>
  </tr>
  <tr>
  <td><i><b>Δ<sub>t</sub></b></i></td>
    <td>{deltaT} ms</td>
  </tr>
  <tr>
    <td><i><b>V<sub>1</sub></b></i></td>
    <td>{v1} V</td>
  </tr>
  <tr>
  <td><i><b>V<sub>2</sub></b></i></td>
    <td>{v2} V</td>
  </tr>

  <tr>
  <td><i><b>Δ<sub>V</sub></b></i></td>
    <td>{deltaV} V</td>
  </tr>

  <tr>
  <td><b><i>f</i></b></td>
    <td>{f} Hz</td>
  </tr>
  </tbody>

</table>
      </div>
    );
}