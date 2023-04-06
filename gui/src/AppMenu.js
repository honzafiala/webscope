import React, {useState, useEffect} from 'react';
import PopUpWindow from './PopUpWindow';

export default function AppMenu(props) {
    const [appMenuActive, setAppMenuActive] = useState(false);

    return(
        <div className="flex-grow flex-1">
            <button className='p-1' onClick={() => setAppMenuActive(true)}>Menu</button>

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

