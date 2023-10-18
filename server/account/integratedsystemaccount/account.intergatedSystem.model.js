const Promise = require("bluebird");
const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../../helpers/APIError");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const integratedSystemAccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  domain: {
    type: Schema.Types.ObjectId,
    ref: "_domain",
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
integratedSystemAccountSchema.method({});

/**
 * Statics
 */
integratedSystemAccountSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.find({ _id: id })
      .populate({
        path: "domain",
        populate: {
          path: "services",
        },
      })
      .exec()
      .then((account) => {
        if (account) {
          return account;
        }
        const err = new APIError(
          "No such integrated system account exists!",
          httpStatus.NOT_FOUND
        );
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
  },
};

/**
 * @typedef User
 */
module.exports = mongoose.model("_integratedSystemAccount", integratedSystemAccountSchema);
