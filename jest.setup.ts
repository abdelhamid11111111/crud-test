// jest.setup.ts
import '@testing-library/jest-dom'

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock