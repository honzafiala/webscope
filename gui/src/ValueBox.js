import './ValueBox.css';


export default function ValueBox({name, unit, data, setData}) {

    return (
        <div className='ValueBox'>
            <div className='data'>
            <div className='name'>{name}</div>
            <div className='value'>{data}{unit}</div>
            </div>
            
            <div className='content'>
            
                <div className='buttons'>

                <button className='buttonLeft' onClick={() => {setData('-')}}>{"<"}</button>
                <button className='buttonMiddle' onClick={() => {setData('0')}}>0</button>
                <button className='buttonRight' onClick={() => {setData('+')}}>{">"}</button>
                </div>

            </div>       
        </div>
    );
}