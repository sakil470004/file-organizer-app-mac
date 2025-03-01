// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  organizeFiles: (directoryPath) => ipcRenderer.invoke('organize-files', directoryPath)
});