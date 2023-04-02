export default function SideBarButton({enabled, onClick, text}) {

    return (
        <button 
            onClick={onClick}
            disabled={!enabled}
            className={`
                flex-1 
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