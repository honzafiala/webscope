import React from 'react';
import {getNumActiveChannels} from './Utils'
import SideBarButton from './SideBarButton';
import SideBarButtonBar from './SideBarButtonBar';


export default function ChannelControl({color, number, captureConfig, setCaptureConfig, viewConfig, setViewConfig}) {

  const channelNumber = parseInt(number);

  function changeZoom(dir) {
      let newVertical = viewConfig.vertical;
      let oldVal = newVertical[channelNumber - 1].zoom;
      let newVal = oldVal;
      if (dir == '0') {
        newVal = 1;
      }
      else if (dir == '+' && oldVal == 0.5) {
        newVal = 1;
      } else {
        let d = String(oldVal)[0];
        if (d == 1)
          if (dir == '-' ) newVal /= 2;
          else newVal *= 2;
        else if (d == 2)
          if (dir == '-') newVal /= 2;
          else newVal *= 5/2;
        else if (d == 5)
          if (dir == '-') newVal /= 5/2;
          else newVal *= 2;
      }
      newVertical[channelNumber - 1].zoom = newVal;
      setViewConfig({...viewConfig, vertical: newVertical});

  }

  function changeOffset(dir) {
    let newVertical = viewConfig.vertical;
    let oldVal = newVertical[channelNumber - 1].offset;

    if (dir == '0') {
      newVertical[channelNumber - 1].offset = 0;
      setViewConfig({...viewConfig, vertical: newVertical});
      return;
    }
    let newVal = oldVal;
    if (dir == '-') newVal--;
    else if (dir == '+') newVal++;

      newVertical[channelNumber - 1].offset = newVal;
    setViewConfig({...viewConfig, vertical: newVertical});
  }

  function toggleActive() {
    if (captureConfig.activeChannels[channelNumber - 1] && getNumActiveChannels(captureConfig) == 1) return;

    let newActiveChannels = captureConfig.activeChannels;
    newActiveChannels[channelNumber - 1] = !newActiveChannels[channelNumber - 1];
    let newCaptureDepth = Math.floor(captureConfig.totalCaptureDepth / getNumActiveChannels(captureConfig));
    setCaptureConfig({...captureConfig, activeChannels: newActiveChannels, captureDepth: newCaptureDepth});
    setViewConfig({...viewConfig, horizontal: {...viewConfig.horizontal, zoom: 1, viewCenter: newCaptureDepth / 2}});
    console.log("active channels: ", getNumActiveChannels(captureConfig));
  }

  let channelColors = ['yellow', 'red', 'green'];

  return (
    <div className="my-1 mx-1 bg-white rounded-md  shadow text-slate-700 text-l">
    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
        <div className={`flex-1 px-1 py-[2px] whitespace-nowrap  ${captureConfig.activeChannels[channelNumber - 1] ? "bg-" + channelColors[channelNumber - 1] + "-300": "bg-slate-100 text-slate-400"}`} >Channel {channelNumber}</div>
        <SideBarButton text={captureConfig.activeChannels[channelNumber - 1] ? '-' : '+'} enabled={true} onClick={toggleActive}/>
    </div>
    <div className='flex px-1 border-x border-slate-30'>
    <div className="flex-1">Scale</div>
    <div>{viewConfig.vertical[channelNumber - 1].zoom}&nbsp;x</div>
    </div>
    <SideBarButtonBar>
        <SideBarButton text='-' enabled={captureConfig.activeChannels[channelNumber - 1]} onClick={() => changeZoom('-')}/>
        <SideBarButton text='0' enabled={captureConfig.activeChannels[channelNumber - 1]} onClick={() => changeZoom('0')}/>
        <SideBarButton text='+' enabled={captureConfig.activeChannels[channelNumber - 1]} onClick={() => changeZoom('+')}/>
    </SideBarButtonBar>

    <div className='flex px-1 border-x border-slate-30'>
    <div className="flex-1">Offset</div>
    <div>{viewConfig.vertical[channelNumber - 1].offset}&nbsp;div</div>
    </div>
    <SideBarButtonBar>
      <SideBarButton text='-' enabled={captureConfig.activeChannels[channelNumber - 1]} onClick={() => changeOffset('-')}/>
      <SideBarButton text='0' enabled={captureConfig.activeChannels[channelNumber - 1]} onClick={() => changeOffset('0')}/>
      <SideBarButton text='+' enabled={captureConfig.activeChannels[channelNumber - 1]} onClick={() => changeOffset('+')}/>
    </SideBarButtonBar>

</div>
  );
}
