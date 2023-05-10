/*
* Can: access node.js APIs here.
* Cannot: access DOM here.
*/

const {app /* controls app's event lifecycle*/, BrowserWindow /* manages app windows*/, ipcMain } = require('electron');
const path = require('path');

const createWindow = () =>
{
    const mainWindow = new BrowserWindow
    ({
        width: 800,
        height: 600,
        webPreferences:
        {
            // path.join creates a cross-platform path string
            // __dirname points to executing script's location
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // ensure handler is ready by the time the webpage is loaded
    ipcMain.handle('ping', () => 'pong');

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {createWindow()});
