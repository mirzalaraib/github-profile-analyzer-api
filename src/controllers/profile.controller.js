const profileService = require('../services/profile.service');
const profileModel = require('../models/profile.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Trigger analysis for a given username and store the insights
 * POST /api/profiles
 */
const analyzeProfile = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
      return errorResponse(res, 'A non-empty string username is required in the request body', 400);
    }

    console.log(`Analyzing GitHub profile for username: ${username}`);
    const profile = await profileService.analyzeProfile(username.trim());
    return successResponse(res, 'Profile analyzed and saved successfully', profile, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve list of all analyzed profiles
 * GET /api/profiles
 */
const getAllProfiles = async (req, res, next) => {
  try {
    const { sortBy, order, search } = req.query;
    const profiles = await profileModel.getAllProfiles({ sortBy, order, search });
    return successResponse(res, 'Retrieved stored analyzed profile list successfully', profiles);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve detailed analysis for a single profile by username
 * GET /api/profiles/:username
 */
const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) {
      return errorResponse(res, 'Username parameter is required', 400);
    }

    const profile = await profileModel.getByUsername(username);
    if (!profile) {
      return errorResponse(res, `Profile for username '${username}' not found in database. Try running POST /api/profiles first.`, 404);
    }

    return successResponse(res, 'Retrieved profile analysis details successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a profile analysis record
 * DELETE /api/profiles/:username
 */
const deleteProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) {
      return errorResponse(res, 'Username parameter is required', 400);
    }

    const deleted = await profileModel.deleteByUsername(username);
    if (!deleted) {
      return errorResponse(res, `Profile for username '${username}' does not exist in database`, 404);
    }

    return successResponse(res, `Profile for username '${username}' deleted successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeProfile,
  getAllProfiles,
  getProfile,
  deleteProfile
};
