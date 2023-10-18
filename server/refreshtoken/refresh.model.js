const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require("../helpers/APIError");


/**
 * User Schema
 */
const RefreshTokenSchema = new mongoose.Schema({
  refresh_token: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
 RefreshTokenSchema.method({
});

/**
 * Statics
 */
 RefreshTokenSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(refresh_token) {
    console.log("get function RefreshTokenSchema -->>>>",refresh_token)
    let condition={refresh_token:refresh_token}
    console.log("condition::",condition);
    return this.findOne(condition)
      .exec()
      .then((token) => {
        console.log("token::",token)
        if (token) {
          console.log("tuuuuu:",token)
          return token;
        }
        const err = new APIError('No such token exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
