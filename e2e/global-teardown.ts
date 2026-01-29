import { closeTestDB } from './helpers/db';

async function globalTeardown() {
  console.log('Closing test database connection...');
  await closeTestDB();
  console.log('Test database connection closed!');
}

export default globalTeardown;