import React, { useState } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

import EmailList from './components/Login/displayEmailComponent';




// A function to fetch emails from the server
const fetchEmails = async (accessToken, setEmails, setErrorMessage) => {
  try {
    const response = await axios.post('http://localhost:5000/get-emails', {
      access_token: accessToken,
    });
    setEmails(response.data.emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    setErrorMessage('Error fetching emails: ' + error.message);
  }
};



// A function to handle the login logic
const useGoogleLoginHandler = (setEmails, setErrorMessage) => {
  return useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Token Response:', tokenResponse);
      await fetchEmails(tokenResponse.access_token, setEmails, setErrorMessage);
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setErrorMessage('Login Failed. Please try again.');
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly'
  });
};



const App = () => {
  const [emails, setEmails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const login = useGoogleLoginHandler(setEmails, setErrorMessage);

  return (
    <div>
      <button onClick={login}>Login with Google</button>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      <EmailList emails={emails} />
    </div>
  );
};a

export default App;
