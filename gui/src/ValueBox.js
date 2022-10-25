import './ValueBox.css';

function formatData(data) {
    let negative = data < 0 ? true : false;
   let digitsBefore = data.toString().split('.')[0].length;
    if (negative) digitsBefore--;



    let n = ['m', 'μ', 'n'];

}

export default function ValueBox({name, unit, data, setData}) {
    formatData(data);

    return (
        <div className='ValueBox'>
            <div className='name'>{name}</div>
            <div className='content'>
            <div className='data'>{data}{unit}</div>
                <div className='buttons'>

                <button className='buttonLeft' onClick={() => {setData(data - 1)}}>{"<"}</button>
                <button className='buttonMiddle' onClick={() => {setData(0)}}>0</button>
                <button className='buttonRight' onClick={() => {setData(data + 1)}}>{">"}</button>
                </div>

            </div>       
        </div>
    );
}