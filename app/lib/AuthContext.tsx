import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username: string;
  email?: string;
  userType: 'buyer' | 'seller';
  // ... other user properties
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: async () => {}, // Provide a default no-op implementation
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user'); // Changed to 'user'
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
      }
    };

    loadUserFromStorage();
  }, []);

  useEffect(() => {
    const saveUserToStorage = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem('user', JSON.stringify(user)); // Changed to 'user'
        } else {
          await AsyncStorage.removeItem('user'); // Clear storage if user is null
        }
      } catch (error) {
        console.error("Error saving user to storage:", error);
      }
    };

    saveUserToStorage();
  }, [user]);


  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user'); // Clear user from storage
      await AsyncStorage.removeItem('token'); // Clear token from storage
      setUser(null);
      // Optionally, you can redirect the user to the login screen here if needed.
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};