
export default function DropDown() {


    return (
        <div id="dropdown-wrapper" class="flex">
            <div class="px-10 py-3 bg-amber-500 hover:bg-amber-600 focus:bg-rose-500 text-white">Sampling</div>
            <div>
        <button onClick="toggleMenu()"
            class="px-10 py-3 bg-amber-500 hover:bg-amber-600 focus:bg-rose-500 text-white">
            Toggle Menu</button>
        <div id="menu" class=" flex flex-col bg-white drop-shadow-md">
            <a class="px-5 py-3 hover:bg-amber-300 border-b border-gray-200" href="#">About KindaCode.com</a>
            <a class="px-5 py-3 hover:bg-amber-300 border-b border-gray-200" href="#">Contact Us</a>
            <a class="px-5 py-3 hover:bg-amber-300 border-b border-gray-200" href="#">Privacy Policy</a>
            <a class="px-5 py-3 hover:bg-amber-300" href="#">Hello There</a>
        </div>
        </div>
    </div>
    );


    return (
        <div className=" float-left mx-1 pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-lg leading-5 text-slate-700 border border-slate-300 shadow">
            <div className="flex-1 text-center py-1 px-1 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 text-sm">Sampling</div>
            <div className="flex flex-1 text-center py-1 px-1 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">
                500kS/s
                <svg className="ml-2 w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    );
}