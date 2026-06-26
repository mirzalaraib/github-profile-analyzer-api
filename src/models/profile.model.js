const db = require('../config/db');

/**
 * Migrate and setup table schema if it does not exist
 */
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(100) DEFAULT NULL,
      avatar_url VARCHAR(255) DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      blog VARCHAR(255) DEFAULT NULL,
      company VARCHAR(100) DEFAULT NULL,
      location VARCHAR(100) DEFAULT NULL,
      public_repos INT DEFAULT 0,
      public_gists INT DEFAULT 0,
      followers INT DEFAULT 0,
      following INT DEFAULT 0,
      github_created_at TIMESTAMP NULL DEFAULT NULL,
      github_updated_at TIMESTAMP NULL DEFAULT NULL,
      total_stars INT DEFAULT 0,
      total_forks INT DEFAULT 0,
      languages JSON DEFAULT NULL,
      most_starred_repo_name VARCHAR(255) DEFAULT NULL,
      most_starred_repo_stars INT DEFAULT 0,
      most_forked_repo_name VARCHAR(255) DEFAULT NULL,
      most_forked_repo_forks INT DEFAULT 0,
      average_stars_per_repo FLOAT DEFAULT 0.0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await db.query(query);
  console.log('Database profiles table setup complete.');
};

/**
 * Insert new profile or update existing profile (upsert)
 */
const upsertProfile = async (profileData) => {
  const query = `
    INSERT INTO profiles (
      username, name, avatar_url, bio, blog, company, location,
      public_repos, public_gists, followers, following, github_created_at, github_updated_at,
      total_stars, total_forks, languages, most_starred_repo_name, most_starred_repo_stars,
      most_forked_repo_name, most_forked_repo_forks, average_stars_per_repo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      avatar_url = VALUES(avatar_url),
      bio = VALUES(bio),
      blog = VALUES(blog),
      company = VALUES(company),
      location = VALUES(location),
      public_repos = VALUES(public_repos),
      public_gists = VALUES(public_gists),
      followers = VALUES(followers),
      following = VALUES(following),
      github_created_at = VALUES(github_created_at),
      github_updated_at = VALUES(github_updated_at),
      total_stars = VALUES(total_stars),
      total_forks = VALUES(total_forks),
      languages = VALUES(languages),
      most_starred_repo_name = VALUES(most_starred_repo_name),
      most_starred_repo_stars = VALUES(most_starred_repo_stars),
      most_forked_repo_name = VALUES(most_forked_repo_name),
      most_forked_repo_forks = VALUES(most_forked_repo_forks),
      average_stars_per_repo = VALUES(average_stars_per_repo);
  `;

  // Stringify languages JSON
  const languagesStr = profileData.languages ? JSON.stringify(profileData.languages) : null;

  const values = [
    profileData.username.toLowerCase(),
    profileData.name || null,
    profileData.avatar_url || null,
    profileData.bio || null,
    profileData.blog || null,
    profileData.company || null,
    profileData.location || null,
    profileData.public_repos || 0,
    profileData.public_gists || 0,
    profileData.followers || 0,
    profileData.following || 0,
    profileData.github_created_at ? new Date(profileData.github_created_at) : null,
    profileData.github_updated_at ? new Date(profileData.github_updated_at) : null,
    profileData.total_stars || 0,
    profileData.total_forks || 0,
    languagesStr,
    profileData.most_starred_repo_name || null,
    profileData.most_starred_repo_stars || 0,
    profileData.most_forked_repo_name || null,
    profileData.most_forked_repo_forks || 0,
    profileData.average_stars_per_repo || 0.0
  ];

  await db.query(query, values);
  return await getByUsername(profileData.username);
};

/**
 * Get all analyzed profiles in the system
 */
const getAllProfiles = async (options = {}) => {
  const { sortBy = 'created_at', order = 'DESC', search = '' } = options;
  
  // Whitelist sort fields to prevent SQL injection
  const allowedSortFields = ['created_at', 'updated_at', 'followers', 'public_repos', 'total_stars', 'username'];
  const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
  const actualOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  let query = 'SELECT id, username, name, avatar_url, public_repos, followers, total_stars, created_at, updated_at FROM profiles';
  const queryParams = [];

  if (search) {
    query += ' WHERE username LIKE ? OR name LIKE ?';
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern);
  }

  query += ` ORDER BY ${actualSortBy} ${actualOrder}`;

  const [rows] = await db.query(query, queryParams);
  return rows;
};

/**
 * Get a single profile's details by username (case-insensitive)
 */
const getByUsername = async (username) => {
  const query = 'SELECT * FROM profiles WHERE LOWER(username) = LOWER(?)';
  const [rows] = await db.query(query, [username]);
  return rows[0] || null;
};

/**
 * Delete a profile by username (case-insensitive)
 */
const deleteByUsername = async (username) => {
  const query = 'DELETE FROM profiles WHERE LOWER(username) = LOWER(?)';
  const [result] = await db.query(query, [username]);
  return result.affectedRows > 0;
};

module.exports = {
  createTable,
  upsertProfile,
  getAllProfiles,
  getByUsername,
  deleteByUsername
};
