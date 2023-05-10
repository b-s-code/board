const {contextBridge} = require('electron');

contextBridge.exposeInMainWorld('versions' /*global variable name*/,
{
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
});
