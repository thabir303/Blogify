// jest.config.js
export default {
    transform: {
      '^.+\\.jsx?$': 'babel-jest', 
    },
    extensionsToTreatAsEsm: [ '.jsx', '.ts', '.tsx'], 
    globals: {
      'babel-jest': {
        diagnostics: false, 
      },
    },
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
  };