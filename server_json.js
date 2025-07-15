const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { encode } = require('html-entities');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'send.html'));
});

// Handle form submission
app.post('/send-sms', async (req, res) => {
  const { sender, number, message } = req.body;

  const username = process.env.EGOSMS_USERNAME;
  const password = process.env.EGOSMS_PASSWORD;

  const url = 'https://www.egosms.co/api/v1/plain/';
  const params = {
    username: encode(username),
    password: encode(password),
    number: encode(number),
    message: encode(message),
    sender: encode(sender)
  };

  try {
    const response = await axios.get(url, {
      params,
      timeout: 5000
    });

    // Respond with JSON instead of HTML
    res.json({ success: true, message: response.data });
  } catch (error) {
    const msg = error.code === 'ECONNABORTED' || error.message.includes('Network Error')
      ? 'Check your internet connection.'
      : `Error: ${error.message}`;

    res.json({ success: false, message: msg });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});