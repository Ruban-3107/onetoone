const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const Schema = mongoose.Schema;
const idvalidator = require('mongoose-id-validator');

/**
 * oneSignal Schema
 */
const oneSignalSchema = new mongoose.Schema({
  appId: {
    type: String,
    required: true
  },
  authKey:{
    type:String,
    required: true
  },
  player_id:{
    type:String,
    required: true
  },
  account_id: {
    type:String,
    required:true
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

oneSignalSchema.plugin(idvalidator);

/**
 * Methods
 */
oneSignalSchema.method({
});

/**
 * Statics
 */
oneSignalSchema.statics = {

  getOneSiganlDetails(accountId){
    console.log("getOnesiganl -> details", accountId)
    return this.find({account_id : accountId})
    .exec()
    .then((oneSignal) => {
      if (oneSignal) {
        return oneSignal;
      }
      const err = new APIError('No such user exists in onesignal!', httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });

  },
};

/**
 * @typedef Onesignal
 */
module.exports = mongoose.model('onesignal', oneSignalSchema);
