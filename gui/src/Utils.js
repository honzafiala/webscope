function getNumActiveChannels(captureConfig) {
    let ret = 0;
    captureConfig.activeChannels.forEach(element => {if (element) ret++});
    return ret;
}

function formatValue(val) {
    if (val == 0) return "0";
    let isNegative = val < 0;
    val = Math.abs(val);
    let prefixes = ['G','M' ,'k', '', 'm', 'µ', 'n'];
    let prefixIndex = 3;
    while (val >= 1000) {
        prefixIndex--;
        val /= 1000;
    }
    while (val < 1) {
        prefixIndex++;
        val *= 1000;
    }
    let beforeDecimal = String(Math.floor(val));
    let afterDecimal = String(Math.round((val % 1) * 1000));
    while (afterDecimal.length < 3) afterDecimal = '0' + afterDecimal;
    return (isNegative ? '-' : '') + beforeDecimal + '.' + afterDecimal + prefixes[prefixIndex];
}

export {getNumActiveChannels, formatValue};