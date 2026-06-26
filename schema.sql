-- GitHub Profile Analyzer - Database Schema
-- Database: github_analyzer (or defaultdb on Aiven)
-- Engine: MySQL 8.0+

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