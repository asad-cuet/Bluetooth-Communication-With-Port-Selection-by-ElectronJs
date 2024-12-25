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
  // mainWindow.webContents.openDevTools();


  // Send available ports to renderer
  ipcMain.handle('get-available-ports', async () => {
    const ports = await SerialPort.list();  // Get all available serial ports
    return ports.map(port => port.path);    // Only return the port paths
  });


  // SerialPort.list().then((ports) => {
  //   console.log('Found ports',ports);
  //   ports.forEach((port) => {
  //     if (port.manufacturer && port.manufacturer.includes('Bluetooth')) {
  //       console.log(`Found Bluetooth device on port: ${port.comName}`);
  //       // Now you can connect to this port
  //       const bluetoothPort = new SerialPort({ path: port.comName, baudRate: 9600 });
  //       bluetoothPort.on('open', () => {
  //         console.log('Serial port opened');
  //       });
  //     }
  //   });
  // });
  

  // Handle connection to selected port
  ipcMain.on('connect-to-port', (event, portPath) => {
    const port = new SerialPort({ path: portPath, baudRate: 9600 });

    port.on('open', () => {
      mainWindow.webContents.send('bluetooth-status', { connected: true, deviceName: portPath });
    });
    port.on('error', (err) => {
      console.error('Serial port error:', err.message);
      mainWindow.webContents.send('bluetooth-status', { connected: false, message: err.message });
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
    parser.on('data', data => {
      mainWindow.webContents.send('bluetooth-data', data);
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




  // // Initialize SerialPort
  // const port = new SerialPort({
  //   path: 'COM15', // Replace with your port
  //   baudRate: 9600,
  // });

  // const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  // // Serial port events
  // port.on('open', () => {
  //   console.log('Serial port opened');
  //   mainWindow.webContents.send('bluetooth-status', { connected: true, deviceName: port.path });
  //   console.log('Serial port end');
  // });

  // parser.on('data', (data) => {
  //   console.log('Received:', data);
  //   mainWindow.webContents.send('bluetooth-data', data);
  //   mainWindow.webContents.send('bluetooth-status', { connected: true, deviceName: port.path });

  // });

  

  
});
