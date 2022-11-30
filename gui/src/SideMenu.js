import CaptureSave from './CaptureSave';
import './SideMenu.css';
import preval from 'preval.macro';



export default function SideMenu({captureData, captureConfig}) {
  let date = preval`module.exports = new Date().toLocaleString();`; 
  date = date.split(',')[0];
  date = date.replace('/', '-');
  let firmwareName = 'firmware_' + date + '.uf2';


    return(
        <div className="SideMenu" style={{backgroundColor: "#D9D9D9",  margin: "5px", padding: "5px", borderRadius: "10px"}}>
        <div><CaptureSave captureData={captureData} captureConfig={captureConfig}/></div>
        <div><a href="./manual.html" target="_blank">User manual</a></div>
        <div><a href="./firmware.uf2" download={firmwareName}>Firmware</a></div>
        <div>WebScope</div>
        <div>Version:</div>
        <div>{preval`module.exports = new Date().toLocaleString();`}</div>
      </div>
    );
}