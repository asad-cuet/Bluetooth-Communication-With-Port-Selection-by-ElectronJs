const { app, BrowserWindow, ipcMain } = require('electron');
const { SerialPort, ReadlineParser } = require('serialport');
const path = require('path');

let mainWindow;

// Create the main window
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools (optional)
  mainWindow.webContents.openDevTools();

  // Initialize SerialPort
  const port = new SerialPort({
    path: 'COM15', // Replace with your port
    baudRate: 9600,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  // Serial port events
  port.on('open', () => {
    console.log('Serial port opened');
    mainWindow.webContents.send('bluetooth-status', { connected: true, deviceName: port.path });
    console.log('Serial port end');

  });

  parser.on('data', (data) => {
    console.log('Received:', data);
    mainWindow.webContents.send('bluetooth-data', data);
  });

  port.on('error', (err) => {
    console.error('Serial port error:', err.message);
    mainWindow.webContents.send('bluetooth-status', { connected: false });
  });

  ipcMain.on('send-data', (event, message) => {
    port.write(`${message}\n`, (err) => {
      if (err) {
        console.error('Error sending data:', err.message);
      } else {
        console.log('Sent:', message);
      }
    });
  });
});
