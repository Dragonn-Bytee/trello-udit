import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default User Mode: Automatically fetch and set Udit Kathuria as the default user
  const fetchDefaultUser = async () => {
    try {
      const { data: members } = await axios.get(`${API_BASE_URL}/members`);
      // Use Udit Kathuria as the default user for collaboration
      const targetUser = members.find(m => m.email === 'uditkathuria001@gmail.com') || members[0];
      setUser(targetUser);
    } catch (err) {
      console.error('Failed to fetch default user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultUser();
  }, []);

  const login = async () => ({ success: true });
  const register = async () => ({ success: true });
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
