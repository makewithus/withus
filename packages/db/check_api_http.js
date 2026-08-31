const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'ankit@gmail.com';
  
  // Login to get token
  const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
    email,
    password: 'Password123!', // Standard test password
  }).catch(e => e.response);

  if (loginRes.status !== 200) {
    console.log('Login failed:', loginRes.data);
    return;
  }

  const token = loginRes.data.accessToken;
  const user = loginRes.data.user;
  const orgId = user.organizationMemberships[0].organizationId;

  // Call getIncomingSessions
  const sessionsRes = await axios.get(`http://localhost:3001/api/v1/organizations/${orgId}/sessions/incoming`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('API Sessions:', JSON.stringify(sessionsRes.data, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
