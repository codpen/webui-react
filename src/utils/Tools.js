export function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

export function bytesToMB(bytes) {
    if (bytes === 0) return 0;
    const mb = bytes / 1024 / 1024;

    return mb;
}

export function bpsToMbps(bps) {
    if (bps === 0) return 0;
    const mbps = bytesToMB(bps);
    return mbps;
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function secondsToMinutesHourString(seconds) {
    if (seconds === 0) {
        return `00:00:00 S`;
    }
    let minutes = seconds / 60;
    seconds = seconds % 60;
    let hours = minutes / 60;
    minutes = minutes % 60;

    return `${Math.round(hours)}:${Math.round(minutes)}:${Math.round(seconds)} hrs`;
}

export function secondsToStr(seconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding(number) {
        return (number > 1) ? 's' : '';
    }

    let years = Math.floor(seconds / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks?
    let days = Math.floor((seconds %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    let hours = Math.floor((seconds %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    let minutes = Math.floor((seconds %= 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    seconds = seconds % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
}

function baseValidator(regex, str) {
    let m;

    if ((m = regex.exec(str)) !== null) {
        // The result can be accessed through the `m`-variable.
        return m.length === 0;
    } else {
        console.log(`Error compiling regex: ${regex} - default return false`);
    }
    return false;
}


export function validateSizeSuffix(str) {
    const regex = /^off|([0-9]+([KMGTP]))$/;

    return baseValidator(regex, str);
}

export function validateInt(str) {
    const regex = /^([0-9]+)$/;
    return baseValidator(regex, str);
}

export function validateDuration(str) {
    const regex = /^(\d+[hH])?(\d+[Mm])?(\d+[Ss])?$/;
    return baseValidator(regex, str);
}

export function openInNewTab(url) {
    let win = window.open(url, '_blank');
    win.focus();
}
export default isEmpty;