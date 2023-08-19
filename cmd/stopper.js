var exec = require('child_process').exec;
const Config = require('../config.json');

exec(`taskkill /FI "windowtitle eq ${Config.kontrolpanel_title}"`)
exec(`taskkill /F /IM ${Config.kontrolpanel_fxserver}`)
console.log('Process Killed: ' + Config.kontrolpanel_title + ' - ' + Config.kontrolpanel_fxserver)

process.title = Config.kontrolpanel_killingtitle
console.log('Setting Process Title: ' + process.title)

setTimeout(() => {
    exec(`taskkill /FI "windowtitle eq ${Config.kontrolpanel_killingtitle}"`)
}, 1000)
