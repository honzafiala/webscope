import DropDown from "./DropDown";

export default function SplashScreen({close}) {
    return (
<div className="absolute flex h-screen top-20">

{/* <div classNameName="py-8 px-8 mx-auto bg-white rounded-xl shadow-lg space-y-2 sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6">
  <div classNameName="text-center space-y-2 sm:text-left">
    <div classNameName="space-y-0.5">
      <p classNameName="text-lg text-black font-semibold">
        Welcome to Webscope
      </p>

    </div>
    <button classNameName="px-4 py-1 text-sm text-blue-500 font-semibold rounded-full border border-blue-200 hover:text-white hover:bg-blue-600 hover:border-transparent mx-1">Connect device</button>
    <button classNameName="px-4 py-1 text-sm text-blue-500 font-semibold rounded-full border border-blue-200 hover:text-white hover:bg-blue-600 hover:border-transparent mx-1">Download firmware</button>
    <button classNameName="px-4 py-1 text-sm text-blue-500 font-semibold rounded-full border border-blue-200 hover:text-white hover:bg-blue-600 hover:border-transparent mx-1">Help/About</button>
    <button classNameName="px-4 py-1 text-sm text-blue-500 font-semibold rounded-full border border-blue-200 hover:text-white hover:bg-blue-600 hover:border-transparent mx-1" onClick={close}>Close</button>
  </div>
</div> */}


    <div className="bg-slate-100 px-3 ">

        <div className="my-2 bg-white rounded-md  shadow text-slate-700 text-xl">
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
                <div className="flex-1 px-3 py-1 bg-yellow-300" >Channel 1</div>
                <div className="       px-3 py-1 hover:bg-slate-300 hover:text-slate-900 active:bg-slate-400  bg-slate-100" active="true" onClick={() => console.log('klik')}>-</div>
            </div>
            <div className="px-1 border-x border-slate-300">Scale</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-0 bg-slate-100  leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"-"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"0"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"+"}</div>
            </div>

            <div className="px-1 border-x border-slate-300">Offset</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-md bg-slate-100  leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"-"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"0"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"+"}</div>
            </div>
        </div>

        <div className="my-2 bg-white rounded-md  shadow text-slate-700 text-xl">
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
                <div className="flex-1 px-3 py-1 bg-red-300">Channel 2</div>
                <div className="       px-3 py-1  hover:bg-slate-300 hover:text-slate-900 active:bg-slate-400  bg-slate-100">+</div>
            </div>
            <div className="px-1 border-x border-slate-300">Scale</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-0 bg-slate-100 leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"-"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"0"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"+"}</div>
            </div>

            <div className="px-1 border-x border-slate-300">Offset</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-md bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"-"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"0"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"+"}</div>
            </div>
        </div>

        <div className="my-2 bg-white rounded-md  shadow text-slate-700 text-xl">
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
                <div className="flex-1 px-3 py-1 bg-green-300">Channel 3</div>
                <div className="       px-3 py-1  hover:bg-slate-300 hover:text-slate-900 active:bg-slate-400 bg-slate-100 ">+</div>
            </div>
            <div className="px-1 border-x border-slate-300">Scale</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-0 bg-slate-100  leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"-"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"0"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"+"}</div>
            </div>

            <div className="px-1 border-x border-slate-300">Offset</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-md bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"-"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"0"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"+"}</div>
            </div>
        </div>







        
    </div>


    <div className="bg-slate-100 pr-3 ">

    <div className="my-2 bg-white rounded-md  shadow text-slate-700 text-xl">
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
                <div className="flex-1 px-3 py-1 bg-fuchsia-300">Cursors</div>
                <div className="       px-3 py-1  hover:bg-slate-300 hover:text-slate-900 active:bg-slate-400  bg-slate-100">+</div>
            </div>


            <div className="px-1 border-x border-slate-300">Channel</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-white bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 bg-slate-300">{"1"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"2"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"3"}</div>
            </div>

            <div className="px-1 border-x border-slate-300">Axis</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-white bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 bg-slate-300">X</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">Y</div>
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                    <i>t<sub>1</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    0.875ms
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                    <i>t<sub>2</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    1.875ms
                </div>
            </div>

            <div className="flex">
                <div className="flex-1 px-3">
                <i>V<sub>1</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    1.754V
                </div>
            </div>
            <div className="flex">
                <div className="flex-1 px-3">
                    <i>V<sub>2</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    1.998V
                </div>
            </div>
            <div className="flex">
                <div className="flex-1 px-3">
                    <i>Δ<sub>V</sub></i>
                </div>
                <div className="flex-1 text-right px-3">
                    5.2mV
                </div>
            </div>
            <div className="flex">
                <div className="flex-1 px-3">
                    <i>f</i>
                </div>
                <div className="flex-1 text-right px-3">
                    5.446kHz
                </div>
            </div>


        </div>



        <div className="my-2 bg-white rounded-md  shadow text-slate-700 text-xl">
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
                <div className="flex-1 px-3 py-1 bg-slate-200">PWM</div>
            </div>


            <div className="px-1 border-x border-slate-300">Freq.</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"-"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"+"}</div>
            </div>

            <div className="px-1 border-x border-slate-300">Duty</div>
            <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-md bg-slate-100  leading-5 text-slate-700 border border-slate-300 shadow">
            <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"-"}</div>
                <div className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">{"+"}</div>
            </div>

        </div>

    </div>

    <div className="bg-slate-100 pr-3 py-2">

    <div className="float-left mx pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-lg leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center py-1 px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 bg-blue-600 text-slate-100">Connected</div>

    </div>

    <div className="float-left mx-1 pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-lg leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center py-1 px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 bg-blue-600 text-slate-100">Running</div>
                <div className="flex-1 text-center py-1 px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">Single</div>
                <div className="flex-1 text-center py-1 px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">Stop</div>
    </div>

    <div className=" float-left mx-1 pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-lg leading-5 text-slate-700 border border-slate-300 shadow">
                <div className="flex-1 text-center py-1 px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300 bg-slate-300">Normal</div>
                <div className="flex-1 text-center py-1 px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">Auto</div>
    </div>

    <div className=" float-left mx-1 pointer-events-auto whitespace-nowrap flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-lg leading-5 text-slate-700 border border-slate-300 shadow">
        <div className="flex-1 text-center py-1 px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">-</div>
        <div className="flex-1 text-center py-1 px-1 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">Sampling 500kS/s</div>
        <div className="flex-1 text-center py-1 px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">+</div>

    </div>




    </div>






</div>
    );
}