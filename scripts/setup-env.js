const fs = require('fs');
const path = require('path');

const envExample = `# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/express-ts-api

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:3000
`;

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

// Create .env file if it doesn't exist
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envExample);
  console.log('Created .env file with default values');
}

// Create .env.example file
fs.writeFileSync(envExamplePath, envExample);
console.log('Created .env.example file');

console.log(
  '\nPlease update the values in your .env file with your actual configuration.'
);
console.log(
  'Make sure to keep your JWT_SECRET secure and never commit it to version control.'
);
