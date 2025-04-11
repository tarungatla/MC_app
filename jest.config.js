module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', 'D:/learn-expo/jest.setup.js'],  // Add this line],
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
    ],
    collectCoverage: true,
    collectCoverageFrom: [
      '**/*.{js,jsx,ts,tsx}',
      '!**/coverage/**',
      '!**/node_modules/**',
      '!**/babel.config.js',
      '!**/jest.setup.js'
    ]
  };