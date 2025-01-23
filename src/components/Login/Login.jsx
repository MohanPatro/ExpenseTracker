import React from 'react'
import './Login.css'

const Login = () => {
  return (
    <div className='login-body'>
      <div className='left-bg'>
        <p>
            Register
        </p>
      </div>
      <div className='right-data'>
        <div className='cover'>
            <input type="text" name="name" placeholder='Enter your name.' />
            <input type="password" name="pwd" placeholder='Password' />
        </div>
      </div>
    </div>
  )
}

export default Login
