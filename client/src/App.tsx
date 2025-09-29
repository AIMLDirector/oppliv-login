// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import React, { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';



// Import your pages and components
import HomePage from './pages/Home';
import ProfilePage from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

// Define the shape of your user and authentication context
interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  login: (newToken: string, newUserInfo: UserInfo) => void;
  logout: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | null>(null);

// Create a custom hook for convenience
export const useAuth = () => useContext(AuthContext);

// The Authentication Provider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const login = (newToken: string, newUserInfo: UserInfo) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUserInfo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await axios.get<UserInfo>('http://localhost:3000/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch (error) {
          console.error('Failed to fetch profile', error);
          logout(); // Logout if token is invalid
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token,loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// The main App component
const App: React.FC = () => {
  // Get Google Client ID from environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is not defined');
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
