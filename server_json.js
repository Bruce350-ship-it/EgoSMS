const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { encode } = require('html-entities');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // For JSON bodies

// Main SMS API route
app.post('/send-sms', async (req, res) => {
  console.log('📩 Incoming request:', req.body);

  const { sender, number, message } = req.body;
  const username = process.env.EGOSMS_USERNAME;
  const password = process.env.EGOSMS_PASSWORD;

  if (!sender || !number || !message) {
    return res.status(400).json({
      Status: 'Failed',
      Message: 'Missing required fields'
    });
  }

  const url = 'https://www.egosms.co/api/v1/plain/';
  const params = {
    username: encode(username),
    password: encode(password),
    number: encode(number),
    message: encode(message),
    sender: encode(sender)
  };

  try {
    const response = await axios.get(url, { params, timeout: 5000 });
  
    console.log('✅ EgoSMS raw response:', response.data);
  
    if (typeof response.data === 'string') {
      res.status(200).json({ Status: 'Success', Message: response.data });
    } else {
      res.status(200).json(response.data);
    }
  } catch (error) {
    console.error('❌ Error from EgoSMS:', error.message);
  
    const errorMessage = error.response?.data?.Message || error.message;
  
    res.status(500).json({
      Status: 'Failed',
      Message: errorMessage
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
