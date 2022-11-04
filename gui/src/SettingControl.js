import './ValueBox.css';


export default function SettingControl({name, unit, data, callback}) {
    return (
        <div className='ValueBox'>
            <div className='data'>
            <div className='name'>{name}</div>
            <div className='value'>{data}{unit}</div>
            </div>
            
            <div className='content'>
            
                <div className='buttons'>

                <button className='buttonLeft' onClick={() => callback('-')}>{"<"}</button>
                <button className='buttonMiddle' onClick={() => callback('0')}>0</button>
                <button className='buttonRight' onClick={() => callback('+')}>{">"}</button>
                </div>

            </div>       
        </div>
    );
}