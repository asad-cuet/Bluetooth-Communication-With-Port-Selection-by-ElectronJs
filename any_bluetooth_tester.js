const { SerialPort, ReadlineParser } = require('serialport');

// Replace 'COM3' or '/dev/tty.YOUR_PORT' with the correct port
const port = new SerialPort({
  path: 'COM15', // Change this to your phone's assigned Bluetooth COM port
  baudRate: 9600, // Use the baud rate set in your phone's serial monitor
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Open the port
port.on('open', () => {
  console.log('Serial port opened');
});

// Listen for data
parser.on('data', (data) => {
  console.log('Received:', data);
});

// Send data to phone
const sendData = (message) => {
  port.write(`${message}\n`, (err) => {
    if (err) {
      console.error('Error sending data:', err.message);
    } else {
      console.log('Sent:', message);
    }
  });
};

// Example: Send data after 5 seconds
setTimeout(() => {
  sendData('Hello from Node.js!');
}, 5000);
