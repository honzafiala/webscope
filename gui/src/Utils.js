function getNumActiveChannels(captureConfig) {
    let ret = 0;
    captureConfig.activeChannels.forEach(element => {if (element) ret++});
    return ret;
}

function formatValue(time) {
    if (time < 1 / 1000000000) return "0";
    let prefixes = ['G','M' ,'k', '', 'm', 'µ', 'n'];
    let prefixIndex = 3;
    while (time >= 1000) {
        prefixIndex--;
        time /= 1000;
    }
    while (time < 1) {
        prefixIndex++;
        time *= 1000;
    }
    let beforeDecimal = String(Math.floor(time));
    let afterDecimal = String(Math.round((time % 1) * 1000));
    while (afterDecimal.length < 3) afterDecimal = '0' + afterDecimal;
    let ret = beforeDecimal;
    if (time % 1) ret += '.' + afterDecimal;
    ret += prefixes[prefixIndex];
    return ret;
}

export {getNumActiveChannels, formatValue};