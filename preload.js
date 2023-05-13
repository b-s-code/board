/*
* Used two set up IPC interfaces between 
* main and renderer processes
*/

const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('versions' /*global variable name*/,
{
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    // backend to frontend
    ping: () => ipcRenderer.invoke('ping'),
});
