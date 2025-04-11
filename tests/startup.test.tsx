import { AppRegistry } from 'react-native';
import { performance } from 'perf_hooks';
import App from '../app/_layout';

// Create a simple mock for AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

describe('App Startup Tests', () => {
  test('measures app startup time', async () => {
    const start = performance.now();
    
    // Simulate app startup with your app's name from app.json
    await AppRegistry.registerComponent('learn-expo', () => App);
    
    const end = performance.now();
    const startupTime = end - start;
    console.log("The app startup time is:", startupTime);
    expect(startupTime).toBeLessThan(1000); // 1 second threshold
  });
});