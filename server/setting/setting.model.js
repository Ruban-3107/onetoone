const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const { date } = require('joi');
const Schema = mongoose.Schema;

/**
 * Setting Schema
 */

const SettingUpcomingSchema = new mongoose.Schema({
  screen: {
    type: String,
    required: true
  },
  display_maps: {
    type: Boolean
  },
  reschedule_limits: {
    type: Number
  },
  reschedule_threshold: {
    type: Number
  },
  cancellation_threshold: {
    type: Number
  },
  distress_threshold: {
    type: Number
  },
  total_sessions:{
    type: Number
  },
  appId:{
    type: Array
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
SettingUpcomingSchema.method({
});

const SettingAccountSchema=new mongoose.Schema({
  
  memberId_name:{
    type:String
  },
  accountId_name:{
    type:String
  },
   memberId_sequence:{
    type: Number,
    required: true
  },
  accountId_sequence:{
    type: Number,
    required: true
  },
  Id:{
    type:String
  }

});

const SettingSponsorSchema = new mongoose.Schema({

  screen:{

    type:String

  },

  sponsorName: {

    type: Array,

    default: "_ACC"

  },

  sponsorAccountId_sequence: {

    type: Number,

    required: true

  },

})


/**
 * Statics
 */


SettingUpcomingSchema.statics = {
//   /**
//    * Get user
//    * @param {ObjectId} id - The objectId of user.
//    * @returns {Promise<User, APIError>}
//    */
  getCarousel() {
    return this.find({screen:"rochelogin_carousel"})
    .exec()
      .then((setting) => {
        if (setting.length) {
          return setting;
        }
        const err = new APIError('No such setting line exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
    });
  },

  getLeapLoginVideo(){
    return this.findOne({$and : [{screen:"leap_login_page"},{appId: {$in: ["LEAP"]}}]})
        .exec()
        .then((setting) => {
        if (setting) {
      return setting;
    }
    const err = new APIError('No such setting line exists!', httpStatus.NOT_FOUND);
    return Promise.reject(err);
  });
  }
};


// /**
//  * @typedef Setting
//  */

const Setting = mongoose.model('Setting', SettingUpcomingSchema,'_settings');
const memberUniqueId = mongoose.model('memberUniqueId',SettingAccountSchema,'_settings');
const sponsorAccount = mongoose.model('sponsorAccount',SettingSponsorSchema,'_settings');

module.exports={
  Setting,
  memberUniqueId,
  sponsorAccount
}