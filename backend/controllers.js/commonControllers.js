const { google } = require('googleapis');


const { OAuth2Client } = require('google-auth-library');
const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);



exports.exchangeCode= async (req, res) => {
    const { code } = req.body;
    
    const oauth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
  
    try {
      const { tokens } = await oauth2Client.getToken(code);
  
      res.json(tokens);
    } catch (error) {
      console.error('Error exchanging code:', error);
      res.status(500).send('Failed to exchange authorization code.');
    }
  
  }



exports.refresToken=async (req, res) => {
    const { refresh_token } = req.body;
  
  
    oauth2Client.setCredentials({ refresh_token });
  
    try {
      const tokens = await oauth2Client.refreshAccessToken();
  
      res.json(tokens.credentials);
  
    } catch (error) {
      
      console.error('Error refreshing token:', error);
      res.status(500).send('Failed to refresh token.');
    }
  
  }
