import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = async (response: any) => {
    try {
      const res = await axios.post('http://localhost:3000/auth/google', {
        id_token: response.credential,
       
      },
      { headers: { "Content-Type": "application/json" } , withCredentials: true,}
     
      );    
      console.log("Sending token to backend:", response.credential);
      console.log("Login success:", res.data);
      localStorage.setItem('token', res.data.token);
      navigate('/profile');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleError = () => {
    console.error('Login failed');
  };

  return (
    <div>
      <h1>Google Authentication with TypeScript</h1>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};
export default Home;
