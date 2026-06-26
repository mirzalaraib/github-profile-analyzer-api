const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/profiles';

const runTests = async () => {
  console.log('--- Starting API Verification Tests ---');

  try {
    // 1. Clean up first (if octocat already exists)
    console.log('\n[1] Preparing database: Deleting octocat if it already exists...');
    try {
      await axios.delete(`${BASE_URL}/octocat`);
      console.log('Cleanup completed: octocat deleted.');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('Cleanup: octocat did not exist in DB.');
      } else {
        throw err;
      }
    }

    // 2. Test profile analysis triggers (POST)
    console.log('\n[2] Testing POST /api/profiles (Analyzing user: octocat)...');
    const analyzeRes = await axios.post(BASE_URL, { username: 'octocat' });
    console.log('Analysis result received:');
    console.log(`- Username: ${analyzeRes.data.data.username}`);
    console.log(`- Name: ${analyzeRes.data.data.name}`);
    console.log(`- Followers: ${analyzeRes.data.data.followers}`);
    console.log(`- Public Repos: ${analyzeRes.data.data.public_repos}`);
    console.log(`- Calculated Total Stars: ${analyzeRes.data.data.total_stars}`);
    console.log(`- Calculated Total Forks: ${analyzeRes.data.data.total_forks}`);
    console.log(`- Top Starred Repo: ${analyzeRes.data.data.most_starred_repo_name} (${analyzeRes.data.data.most_starred_repo_stars} stars)`);
    console.log(`- Languages:`, JSON.stringify(analyzeRes.data.data.languages));

    if (analyzeRes.status === 201 && analyzeRes.data.success) {
      console.log('✅ POST /api/profiles passed!');
    } else {
      throw new Error('POST /api/profiles failed status validation');
    }

    // 3. Test listing all analyzed profiles (GET)
    console.log('\n[3] Testing GET /api/profiles (Listing all profiles)...');
    const listRes = await axios.get(BASE_URL);
    console.log(`Number of stored profiles: ${listRes.data.data.length}`);
    console.log(`First profile: ${listRes.data.data[0].username}`);
    
    if (listRes.status === 200 && listRes.data.data.length > 0) {
      console.log('✅ GET /api/profiles passed!');
    } else {
      throw new Error('GET /api/profiles listing check failed');
    }

    // 4. Test retrieving single profile details (GET /:username)
    console.log('\n[4] Testing GET /api/profiles/octocat (Retrieving details)...');
    const detailRes = await axios.get(`${BASE_URL}/octocat`);
    console.log(`Details received for: ${detailRes.data.data.username}`);
    console.log(`Bio: ${detailRes.data.data.bio}`);
    console.log(`Location: ${detailRes.data.data.location}`);

    if (detailRes.status === 200 && detailRes.data.data.username === 'octocat') {
      console.log('✅ GET /api/profiles/:username passed!');
    } else {
      throw new Error('GET /api/profiles/:username detailed check failed');
    }

    // 5. Test error case: fetching non-existent user profile from GitHub
    console.log('\n[5] Testing error handling: POST /api/profiles with non-existent user...');
    try {
      await axios.post(BASE_URL, { username: 'this-user-does-not-exist-1234567890' });
      throw new Error('Should have failed but succeeded');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('✅ Correctly returned 404 for non-existent GitHub user!');
      } else {
        throw new Error(`Unexpected response on non-existent user test: ${err.message}`);
      }
    }

    // 6. Test error case: fetching non-existent user profile from local DB
    console.log('\n[6] Testing error handling: GET /api/profiles/non-existent-user...');
    try {
      await axios.get(`${BASE_URL}/non-existent-user`);
      throw new Error('Should have failed but succeeded');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('✅ Correctly returned 404 for user not present in database!');
      } else {
        throw new Error(`Unexpected response on non-existent database user check: ${err.message}`);
      }
    }

    // 7. Test delete analysis results (DELETE)
    console.log('\n[7] Testing DELETE /api/profiles/octocat...');
    const deleteRes = await axios.delete(`${BASE_URL}/octocat`);
    console.log(`Message: ${deleteRes.data.message}`);

    if (deleteRes.status === 200 && deleteRes.data.success) {
      console.log('✅ DELETE /api/profiles/:username passed!');
    } else {
      throw new Error('DELETE /api/profiles/:username failed');
    }

    // Double check it's gone
    try {
      await axios.get(`${BASE_URL}/octocat`);
      throw new Error('Profile should have been deleted, but was still retrievable.');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log('Verified: Profile is indeed deleted from database.');
      } else {
        throw err;
      }
    }

    console.log('\n🎉 ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Verification tests failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
};

runTests();
