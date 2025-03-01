// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,      // Allow Node.js integration in the renderer
      contextIsolation: false     // (For simplicity, disable context isolation)
    }
  });

  // Load the index.html of the app.
  win.loadFile('index.html');

  // Optionally, open DevTools for debugging:
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// Quit the app when all windows are closed (except on macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
