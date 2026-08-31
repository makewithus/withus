const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const { SessionsService } = require('./apps/api/dist/sessions/sessions.service.js');
  // I can just query the endpoint via a fake token? No, easier to just instantiate the service
  // But wait, the API is running locally. I can query it if I have a token.
}
