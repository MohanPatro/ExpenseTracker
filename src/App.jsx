import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

import Table from './components/table';
import './App.css';

// Utility functions for local storage
const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getFromLocalStorage = (key) => {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
};

// Fetch emails from your backend
const fetchEmails = async (accessToken, setEmails, setErrorMessage) => {
  try {
    const response = await axios.post('http://localhost:5000/get-emails', {
      access_token: accessToken,
    });
    setEmails(response.data);
  } catch (error) {
    console.error('Error fetching emails:', error);
    setErrorMessage('Error fetching emails: ' + error.message);
  }
};

// Refresh the access token
const refreshAccessToken = async (refreshToken, setErrorMessage) => {
  try {
    const response = await axios.post('http://localhost:5000/refresh-token', {
      refresh_token: refreshToken,
    });

    const { access_token, expires_in } = response.data;
    saveToLocalStorage('accessToken', access_token);

    const expirationTime = new Date().getTime() + expires_in * 1000 - 60000; // Refresh 1 minute before expiry
    saveToLocalStorage('tokenExpirationTime', expirationTime);

    return access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    setErrorMessage('Failed to refresh access token. Please log in again.');
    return null;
  }
};

// Handle Google login logic
const useGoogleLoginHandler = (setEmails, setErrorMessage) => {
  return useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log(response);
        const tokenResponse = await axios.post('http://localhost:5000/exchange-code', {
          code: response.code,
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        saveToLocalStorage('accessToken', access_token);
        saveToLocalStorage('refreshToken', refresh_token);
        const expirationTime = new Date().getTime() + expires_in * 1000 - 60000;
        saveToLocalStorage('tokenExpirationTime', expirationTime);

        await fetchEmails(access_token, setEmails, setErrorMessage);
      } catch (error) {
        console.error('Token exchange failed:', error);
        setErrorMessage('Login failed. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setErrorMessage('Login Failed. Please try again.');
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    flow: 'auth-code', // Request an auth code
    access_type: 'offline',
  });
};

const App = () => {
  const [emails, setEmails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setLoggedIn] = useState(false);

  const login = useGoogleLoginHandler(setEmails, setErrorMessage);

  // Logout function to remove tokens and reset the app state
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpirationTime');
    setEmails([]);
    setLoggedIn(false); // Update the login state
    setErrorMessage(''); // Reset any error message on logout
  };

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const accessToken = getFromLocalStorage('accessToken');
      const refreshToken = getFromLocalStorage('refreshToken');
      const tokenExpirationTime = getFromLocalStorage('tokenExpirationTime');

      if (accessToken && refreshToken) {
        setLoggedIn(true);
        const currentTime = new Date().getTime();
        if (currentTime >= tokenExpirationTime) {
          const newAccessToken = await refreshAccessToken(refreshToken, setErrorMessage);
          if (newAccessToken) {
            await fetchEmails(newAccessToken, setEmails, setErrorMessage);
          }
        } else {
          await fetchEmails(accessToken, setEmails, setErrorMessage);
        }
      }
    };

    checkAndRefreshToken();

    // Cleanup function to reset state if the component unmounts
    return () => {
      setErrorMessage('');
    };
  }, []);

  return (
    <div className="app-container">
      <div className="login-section">
        {!isLoggedIn ? (
          <button className="login-button" onClick={login}>
            Login with Google
          </button>
        ) : (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}

        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>

      {/* Display email list if logged in */}
      {isLoggedIn && emails && <Table emails={emails} />}
    </div>
  );
};

export default App;
