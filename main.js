const {app /* controls app's event lifecycle*/, BrowserWindow /* manages app windows*/ } = require('electron');
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

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {createWindow()});
