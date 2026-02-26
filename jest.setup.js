// Load test env before any module that reads DB config
require('dotenv').config({ path: '.env.test' });
