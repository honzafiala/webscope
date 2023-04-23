import React, {useState, useEffect} from 'react';
import PopUpWindow from './PopUpWindow';

export default function AppMenu(props) {
    const [appMenuActive, setAppMenuActive] = useState(false);

    return(
        <div className="flex-grow flex-1">
            <div className='flex-1 text-center my-[1px]   hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300'></div>
            <button className="mx-1 my-1 py-[1px] pointer-events-auto w-[124px]  bg-slate-100 rounded-md text-l leading-5 text-slate-700 border border-slate-400 shadow" onClick={() => setAppMenuActive(true)}>Menu</button>

            <PopUpWindow active={appMenuActive} setActive={setAppMenuActive} >
                <ul className='list-disc px-5'>
                    <li>About</li>
                    <li>User manual</li>
                    <li>Download firmware</li>
                    <li>Get offline version</li>
                    <li>Reset view</li>
                    <li>Reset all settings</li>
                    <li>Download capture (csv)</li>
                </ul>
            </PopUpWindow>
        </div>
    );
}

