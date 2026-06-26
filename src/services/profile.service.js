const axios = require('axios');
const profileModel = require('../models/profile.model');

/**
 * Configure standard GitHub API headers with optional token for authenticated requests
 */
const getGithubHeaders = () => {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'GitHub-Profile-Analyzer-API'
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

/**
 * Call GitHub REST API, perform statistical aggregation and store analysis insights
 */
const analyzeProfile = async (username) => {
  if (!username) {
    const error = new Error('Username parameter is required');
    error.statusCode = 400;
    throw error;
  }

  const headers = getGithubHeaders();

  let profileResponse;
  try {
    profileResponse = await axios.get(`https://api.github.com/users/${username}`, { headers });
  } catch (err) {
    if (err.response) {
      if (err.response.status === 404) {
        const error = new Error(`GitHub user '${username}' not found`);
        error.statusCode = 404;
        throw error;
      }
      if (err.response.status === 403 && err.response.headers['x-ratelimit-remaining'] === '0') {
        const error = new Error('GitHub API rate limit exceeded. Please add a valid GITHUB_TOKEN in .env config.');
        error.statusCode = 429;
        throw error;
      }
      const error = new Error(err.response.data.message || 'GitHub API fetch error');
      error.statusCode = err.response.status;
      throw error;
    }
    throw err;
  }

  const userData = profileResponse.data;

  // Fetch repositories (limit to first 100 public repos for analysis)
  let repos = [];
  try {
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
    repos = reposResponse.data;
  } catch (err) {
    console.warn(`Warning: Failed to fetch repositories for '${username}':`, err.message);
  }

  // Calculate insights
  let totalStars = 0;
  let totalForks = 0;
  const languages = {};
  let mostStarredRepo = null;
  let mostForkedRepo = null;

  repos.forEach((repo) => {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;

    // Aggregate repository programming language distribution
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }

    // Determine top starred repository
    if (!mostStarredRepo || repo.stargazers_count > mostStarredRepo.stargazers_count) {
      mostStarredRepo = repo;
    }

    // Determine top forked repository
    if (!mostForkedRepo || repo.forks_count > mostForkedRepo.forks_count) {
      mostForkedRepo = repo;
    }
  });

  const averageStars = repos.length > 0 ? parseFloat((totalStars / repos.length).toFixed(2)) : 0.0;

  // Build the rich analysis insight payload
  const profileData = {
    username: userData.login,
    name: userData.name,
    avatar_url: userData.avatar_url,
    bio: userData.bio,
    blog: userData.blog,
    company: userData.company,
    location: userData.location,
    public_repos: userData.public_repos,
    public_gists: userData.public_gists,
    followers: userData.followers,
    following: userData.following,
    github_created_at: userData.created_at,
    github_updated_at: userData.updated_at,
    total_stars: totalStars,
    total_forks: totalForks,
    languages: languages,
    most_starred_repo_name: mostStarredRepo ? mostStarredRepo.name : null,
    most_starred_repo_stars: mostStarredRepo ? mostStarredRepo.stargazers_count : 0,
    most_forked_repo_name: mostForkedRepo ? mostForkedRepo.name : null,
    most_forked_repo_forks: mostForkedRepo ? mostForkedRepo.forks_count : 0,
    average_stars_per_repo: averageStars
  };

  // Save or update standard/advanced insights to database
  return await profileModel.upsertProfile(profileData);
};

module.exports = {
  analyzeProfile
};
