# GitHub Profile Analyzer API

A backend service that analyzes GitHub user profiles using the GitHub public API and stores useful insights in a MySQL database.

## Tech Stack

- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **MySQL** — Database (Aiven Cloud MySQL)
- **GitHub API** — Third-party REST API for profile & repo data

## Features

- ✅ Fetch public GitHub profile data by username
- ✅ Analyze and calculate insights:
  - Total stars and forks across all repositories
  - Language distribution breakdown
  - Most starred and most forked repositories
  - Average stars per repository
  - Follower/following metrics
- ✅ Store analysis results in MySQL (upsert — create or update)
- ✅ List all analyzed profiles with sorting and search
- ✅ Retrieve full details of a single profile
- ✅ Delete profile records
- ✅ Input validation and error handling
- ✅ Rate limit detection for GitHub API

## API Endpoints

### `POST /api/profiles` — Analyze & Store a Profile

**Request:**
```json
{
  "username": "octocat"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Profile analyzed and saved successfully",
  "data": {
    "username": "octocat",
    "name": "The Octocat",
    "followers": 23081,
    "public_repos": 8,
    "total_stars": 21605,
    "total_forks": 165088,
    "languages": { "CSS": 1, "HTML": 1, "Ruby": 1 },
    "most_starred_repo_name": "Spoon-Knife",
    "most_starred_repo_stars": 13859,
    "average_stars_per_repo": 2700.63
  }
}
```

### `GET /api/profiles` — List All Profiles

**Query parameters (optional):**
- `sortBy` — `created_at`, `updated_at`, `followers`, `public_repos`, `total_stars`, `username`
- `order` — `ASC` or `DESC` (default: `DESC`)
- `search` — search by username or name

**Response (200):**
```json
{
  "success": true,
  "message": "Retrieved stored analyzed profile list successfully",
  "data": [
    {
      "id": 1,
      "username": "octocat",
      "name": "The Octocat",
      "avatar_url": "https://avatars.githubusercontent.com/u/583231?v=4",
      "public_repos": 8,
      "followers": 23081,
      "total_stars": 21605,
      "created_at": "2026-06-27T00:52:46.000Z"
    }
  ]
}
```

### `GET /api/profiles/:username` — Get Single Profile

**Response (200):** Full profile record including all insight fields.

### `DELETE /api/profiles/:username` — Delete a Profile

**Response (200):** `{ "success": true, "message": "Profile for username 'octocat' deleted successfully" }`

## Database Schema

```sql
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
```
  
## Setup Instructions

### Prerequisites

- Node.js v16+
- MySQL database (local or cloud)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/github-profile-analyzer-api.git
cd github-analyzer

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Edit .env with your MySQL credentials
cp .env.example .env
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `127.0.0.1` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | (empty) |
| `DB_NAME` | Database name | `github_analyzer` |
| `DB_SSL` | Enable SSL (for cloud DB) | `false` |
| `GITHUB_TOKEN` | GitHub personal token (optional) | (empty) |

### Run Locally

```bash
# Start the server
npm start

# Run verification tests (in another terminal)
node test_api.js
```

### Deployed API

Live URL: `https://github-profile-analyzer-api.onrender.com`

## Test Results

```
✅ POST /api/profiles — Analyzed & stored profile
✅ GET /api/profiles — Listed all profiles from DB
✅ GET /api/profiles/:username — Retrieved single profile details
✅ POST non-existent user — Returns 404
✅ GET non-existent profile — Returns 404
✅ DELETE /api/profiles/:username — Deleted successfully
✅ Verify deletion persisted — Confirmed 404 after delete