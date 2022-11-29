export default function getNumActiveChannels(captureConfig) {
    let ret = 0;
    captureConfig.activeChannels.forEach(element => {if (element) ret++});
    return ret;
}