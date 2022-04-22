import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const Login = () => {
  // eslint-disable-next-line
  const [email, setEmail] = useState('');
  // eslint-disable-next-line
  const [password, setPassword] = useState('');
  let navigate = useNavigate();

  const handleEmail = (e: any) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e: any) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    navigate('/');
  };

  return (
    <div>
      <span>Sign in with your email and password</span>
      <form onSubmit={handleSubmit}>
        <input name='email' type='email' required placeholder='Email' onChange={handleEmail} />
        <input name='password' type='password' required placeholder='Password' onChange={handlePassword} />
        <input type='submit' value='login' />
      </form>
    </div>
  );
};

export default Login;
