

export default function PopUpWindow(props) {

     function CloseButton({enabled, onClick, text}) {
        return (
            <button 
                onClick={onClick}
                disabled={!enabled}
                className={`
                    text-center  
                    px-3 
                    hover:bg-slate-200 
                    hover:text-slate-900 
                    ${enabled ? "text-slate-700 bg-slate-100" : "text-slate-400 bg-slate-100"}
                    `}
            >
                {text}
            </button>
        );
    }




    return(
        <div>
{props.active &&
    <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2  z-50'>
    <div className='my-1 mx-1 bg-white rounded-md  border border-slate-400 shadow text-slate-700 text-l'>
         <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
        <div className=" px-1 py-[2px] flex-1  text-slate-700 bg-slate-200">{props.title}</div>
    
        <CloseButton onClick={() => props.setActive(false)} enabled="true" text="X"/>
        


   
    </div>

<div className="mx-1">{props.children}</div>

    </div>
    </div>
}



        </div>
    );
}