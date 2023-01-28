export default function ConnectDevice({USBDevice, setUSBDevice, setCaptureState}) {
    async function connect() {
        let device = await navigator.usb.requestDevice({
          filters: [{ vendorId: 0xcafe }] 
        });
        await device.open();
        await device.selectConfiguration(1);
        await device.claimInterface(2);
        setUSBDevice(device);
    
        navigator.usb.addEventListener('disconnect', event => {
          setUSBDevice(null);
          setCaptureState("Stopped");
        });
    
        // "Dummy" IN transfer
        let result = await device.transferIn(3, 4);
        
    
        // Out transfer - abort capture
        let abortMessage = new Uint8Array([0]);
        device.transferOut(3, abortMessage);
    
      }

      return (
        <div className="float-right mx-1 my-1 pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100 rounded-md text-l leading-5 text-slate-700 border border-slate-300 shadow">
            <div onClick={connect} 
            className={`flex-1 text-center py-[2px] px-1 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300
            ${USBDevice ? "bg-blue-600 text-slate-100" : "text-slate-700"}`}>{USBDevice ? "Connected" : "Connect device"}</div>
        </div>
      );
}