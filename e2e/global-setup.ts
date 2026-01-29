import { config } from 'dotenv';
import { setupTestDB, cleanupTestDB } from './helpers/db';

// Load environment variables from .env.test
config({ path: '.env.test' });

async function globalSetup() {
  console.log('Setting up test database...');
  await setupTestDB();
  console.log('Cleaning up any previous test data...');
  await cleanupTestDB();
  console.log('Test database ready!');
}

export default globalSetup;