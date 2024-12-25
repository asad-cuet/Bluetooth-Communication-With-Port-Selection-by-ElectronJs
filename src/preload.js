const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onBluetoothStatus: (callback) => {
    ipcRenderer.on('bluetooth-status', (event, data) => callback(data));
  },
  onBluetoothData: (callback) => {
    ipcRenderer.on('bluetooth-data', (event, data) => callback(data));
  },
  sendData: (message) => ipcRenderer.send('send-data', message),
  getAvailablePorts: () => ipcRenderer.invoke('get-available-ports'),
  connectToPort: (portPath) => ipcRenderer.send('connect-to-port', portPath),
});
