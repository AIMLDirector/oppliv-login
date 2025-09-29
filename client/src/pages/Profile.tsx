import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

const Profile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            withCredentials: true,
          },
        });
        setUserInfo(res.data);
        console.log('Profile data:', res.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        localStorage.removeItem('token');
        navigate('/');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {userInfo.name}!</h1>
      <p>Email: {userInfo.email}</p>
      <img src={userInfo.picture} alt="Profile" />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};
export default Profile;
