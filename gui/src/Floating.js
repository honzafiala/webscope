import './Floating.css';
import {getNumActiveChannels, formatValue} from './Utils'


export default function Floating({captureConfig, captureData, cursorConfig}) {
  let t1 = (cursorConfig.start - captureConfig.captureDepth * captureConfig.preTrigger) / captureConfig.sampleRate *  getNumActiveChannels(captureConfig);
  let t2 = (cursorConfig.end - captureConfig.captureDepth * captureConfig.preTrigger) / captureConfig.sampleRate * getNumActiveChannels(captureConfig);


  let deltaT = t2 - t1;

  let f = 1/deltaT; 

  let v1, v2, deltaV;

  if (captureData[cursorConfig.channel].length) {


  v1 = captureData[cursorConfig.channel][Math.round(cursorConfig.start)] * 3.3 / 255;
  v2 = captureData[cursorConfig.channel][Math.round(cursorConfig.end)] * 3.3 / 255;

  deltaV = v2 - v1

  } else {
    v1 = 0;
    v2 = 0;
    deltaV = 0;
  }

    return(
        <div className='floating'> 
  <table>
    <tbody>
  <tr>
    <td><i><b>t<sub>1</sub></b></i></td>
    <td>{formatValue(t1)}s</td>
  </tr>
  <tr>
  <td><i><b>t<sub>2</sub></b></i></td>
    <td>{formatValue(t2)}s</td>
  </tr>
  <tr>
  <td><i><b>Δ<sub>t</sub></b></i></td>
    <td>{formatValue(deltaT)}s</td>
  </tr>
  <tr>
    <td><i><b>V<sub>1</sub></b></i></td>
    <td>{formatValue(v1)}V</td>
  </tr>
  <tr>
  <td><i><b>V<sub>2</sub></b></i></td>
    <td>{formatValue(v2)}V</td>
  </tr>

  <tr>
  <td><i><b>Δ<sub>V</sub></b></i></td>
    <td>{formatValue(deltaV)}V</td>
  </tr>

  <tr>
  <td><b><i>f</i></b></td>
    <td>{formatValue(f)}Hz</td>
  </tr>
  </tbody>

</table>
      </div>
    );
}