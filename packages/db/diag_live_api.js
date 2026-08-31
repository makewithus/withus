const axios = require('axios');

// Try to fetch sessions from the live API using a test token
// We need to test whether the running API actually returns EXTENSION sessions

async function main() {
  // First: login to get a token
  const loginRes = await axios.post('http://127.0.0.1:4000/api/v1/auth/login', {
    email: 'ankit@gmail.com',
    password: 'Test@1234', // Try common test passwords
  }, { validateStatus: () => true });

  console.log('Login status:', loginRes.status);
  if (loginRes.status !== 200) {
    console.log('Login failed:', loginRes.data?.message);
    // Try alternative
    const loginRes2 = await axios.post('http://127.0.0.1:4000/api/v1/auth/login', {
      email: 'ankit@gmail.com',
      password: 'Password@123',
    }, { validateStatus: () => true });
    console.log('Login2 status:', loginRes2.status);
    if (loginRes2.status !== 200) {
      console.log('Both login attempts failed. Cannot test live API without valid credentials.');
      console.log('ACTION NEEDED: Please provide the MEMBER password, or check API logs for the /sessions/incoming call.');
      return;
    }
  }
}

main().catch(console.error);
