/* eslint-disable react/jsx-no-constructed-context-values */
import React, {
  createContext, useCallback, useState, useContext, ReactNode,
} from 'react';

import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string;
  user: User;
}

interface SignInCreadentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  // eslint-disable-next-line no-unused-vars
  signIn(credentials: SignInCreadentials): Promise<void>;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface Props {
  children: ReactNode
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@LoginForm:token');
    const user = localStorage.getItem('@LoginForm:user');

    if (token && user) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      return { token, user: JSON.parse(user) };
    }

    return {} as AuthState;
  });

  interface SigninProps {
    email: string;
    password: string;
  }
  const signIn = useCallback(async ({ email, password }: SigninProps) => {
    const response = await api.post<{token:string, user:User}>('login', { email, password });

    const { token, user } = response.data;
    console.log({ token, email });
    localStorage.setItem('@LoginForm:token', token);
    localStorage.setItem('@LoginForm:user', JSON.stringify(user));

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@LoginForm:token');
    localStorage.removeItem('@LoginForm:user');

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: data.user, signIn, signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
