import './MeasurementBox.css';

export default function MeasurementBox({id, removeMeasurement}) {
    let name = "DC RMS";
    let channel = 2;
    let color = "#4caf50"
    let value = 123;
    let unit = "mV";


    return (
        <div className="MeasurementBox">
            {/* <div className="Name">{name}</div> */}
            <div className='Top'>
                <span className='ChannelNumber'
                style={{color: color}}
                >{channel}</span>
                <span className='Name'>{name}</span>
                <button onClick={() => removeMeasurement(id)}>X</button>
            </div>
            <div className="Value">{value}{unit}</div>
            <div>{id}</div>
        </div>
    );
}