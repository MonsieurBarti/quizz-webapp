// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest/presets/default-esm', // Changed to ESM preset
	testEnvironment: 'node',
	roots: ['<rootDir>/src'], // Look for tests in the src directory
	testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'], // Common patterns for test files
	transform: {
		'^.+\\.tsx?$': [
			// Adjusted regex for .tsx?
			'ts-jest',
			{
				useESM: true, // Added for ESM support
				tsconfig: 'tsconfig.json', // Use your existing tsconfig
			},
		],
	},
	// By default, node_modules are not transformed. We need to make an exception for @auth/core
	// and any other ESM modules that Jest might complain about.
	// The pattern means: transform files in node_modules if they are in @auth/core OR @auth/drizzle-adapter OR drizzle-orm OR postgres.
	// You might need to add other packages here if you encounter similar errors.
	transformIgnorePatterns: ['/node_modules/(?!(@auth/core|@auth/drizzle-adapter|drizzle-orm|postgres)/)'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1', // Handle the @/* path alias
		'^@quizz-creator/(.*)$': '<rootDir>/src/server/modules/quizz-creator/$1', // Handle the @quizz-creator/* path alias
	},
	extensionsToTreatAsEsm: ['.ts', '.tsx'], // Added to treat .ts/.tsx as ESM
};
