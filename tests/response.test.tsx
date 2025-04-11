// response.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { performance } from 'perf_hooks';
import LoginSignupScreen from '../app/login';
import { AuthContext } from '../app/lib/AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'fake-token', user: { userType: 'buyer' } }),
  })
) as jest.Mock;

describe('Response Time Tests', () => {
  test('measures button press response time', async () => {
    const mockSetUser = jest.fn();
    const mockLogout = jest.fn(); // Add the logout mock function
    
    const { getByTestId, getByPlaceholderText } = render(
      <AuthContext.Provider value={{ user: null, setUser: mockSetUser, logout: mockLogout }}>
        <LoginSignupScreen />
      </AuthContext.Provider>
    );
    
    // Fill in form fields to enable the button
    fireEvent.changeText(getByPlaceholderText('Username'), 'tarungatla');
    fireEvent.changeText(getByPlaceholderText('Password'), '11111111');
    
    const button = getByTestId('login-button');
    
    const start = performance.now();
    
    fireEvent.press(button); // Remove await since we're mocking fetch
    
    const end = performance.now();
    const responseTime = end - start;
    
    console.log(`Button press response time: ${responseTime.toFixed(2)} ms`);
    
    expect(responseTime).toBeLessThan(70); 
  });
});