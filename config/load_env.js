const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnv() {
  console.log(process.cwd());
  const localEnvPath = path.resolve(process.cwd(), '.env.local');
  const defaultEnvPath = path.resolve(process.cwd(), '.env');

  if (fs.existsSync(localEnvPath)) {
    console.log('Loading .env.local');
    dotenv.config({ path: localEnvPath });
  } else if (fs.existsSync(defaultEnvPath)) {
    console.log('Loading .env');
    dotenv.config({ path: defaultEnvPath });
  } else {
    console.log('No .env or .env.local file found');
  }
}

module.exports = loadEnv;
