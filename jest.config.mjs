import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Changed to .ts
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/__tests__/api/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

// Override testEnvironment for API tests
const jestConfig = createJestConfig(customJestConfig)

// Export custom logic to use different test environments
const config = async (...args) => {
  const cfg = await jestConfig(...args)
  
  return {
    ...cfg,
    projects: [
      {
        displayName: "components",
        testEnvironment: "jest-environment-jsdom",
        testMatch: [
          "**/__tests__/components/**/*.test.{ts,tsx}",
        ],
        setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // Changed to .ts
        moduleNameMapper: cfg.moduleNameMapper,
        transform: cfg.transform,
        moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      },
      {
        displayName: "integration",
        testEnvironment: "node",
        testMatch: [
          "**/__tests__/integration/**/*.test.{ts,tsx}",
        ],
        setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
        moduleNameMapper: cfg.moduleNameMapper,
        transform: cfg.transform,
        moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      },
      {
        displayName: "api",
        testEnvironment: "node",
        testMatch: ["**/__tests__/api/**/*.test.{ts,tsx}"],
        setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // Changed to .ts
        moduleNameMapper: cfg.moduleNameMapper,
        transform: cfg.transform,
        moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      },
    ],
  };
}

export default config