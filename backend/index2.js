require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const port = 5000;

const corsOptions = {
  origin: "*", 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const { OAuth2Client } = require('google-auth-library');
const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);


app.post('/get-emails', async (req, res) => {
  const { access_token } = req.body; // Access token and sender email address from frontend

  try {
    oauth2Client.setCredentials({ access_token });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch messages from the specified sender
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `from:santhikimidi123@gmail.com`, // Gmail search query
      maxResults: 3, // Limit results to 3
    });

    const messages = response.data.messages || [];
    if (messages.length === 0) {
      return res.json({ emails: [] });
    }

    const emailDetails = [];
    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
      });

      // Extract subject and sender
      const headers = email.data.payload.headers;
      const subjectHeader = headers.find(header => header.name === 'Subject');
      const fromHeader = headers.find(header => header.name === 'From');

      // Extract email body
      const parts = email.data.payload.parts;
      let body = '';

      // Check if the email contains parts (plain text, HTML, etc.)
      if (parts) {
        for (const part of parts) {
          if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
            body = part.body.data;
            body = Buffer.from(body, 'base64').toString('utf-8'); // Decode from base64
            break;
          }
        }
      } else {
        // If there's no parts, the body might be directly in the "body" property
        body = email.data.payload.body.data;
        body = Buffer.from(body, 'base64').toString('utf-8'); // Decode from base64
      }

      emailDetails.push({
        subject: subjectHeader ? subjectHeader.value : 'No Subject',
        from: fromHeader ? fromHeader.value : 'No Sender',
        body: body,
      });
    }

    res.json({ emails: emailDetails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).send('Error fetching emails');
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
