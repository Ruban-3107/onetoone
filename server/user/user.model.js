const APIError = require("../helpers/APIError");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const idvalidator = require('mongoose-id-validator');

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  account_id: {
    type: Schema.Types.ObjectId,
    ref: "_account",
    unique:true
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  relationship_status: {
    type: String
  },
  birthdate: {
    type: String
  },
  location: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updateAt: {
    type: Date,
    default: Date.now
  },
  session: {
    type: Object
  },
  current_distress: {
    type: Number
  },
  key_areas: {
    type: Array
  },
  profile_img: {
    type: String
  },
  notification: [
    {
      name: { type: String },
      value: { type: Boolean },
      image: { type: String }
    }
  ],
  language: [
    {
      type: String
    }
  ],
  cmsMemberId: {
    type: String
  },
  cmsData: {
    type: Boolean,
    required: true
  },
  distress_status:{
    type: String
  },
  distress_monthskip:{
    type: Number,
    default: 0
  },
  distress_updated:{
    type: Date
  },
  distress: [
    {
      distress_name: {type: String},
      distress_level: {type: String},
      suicide_risk: {type: String},
      score: {type: Number},
      flag: {type: String},
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  app_version: {
    type: String
  },
  area_of_interest: {
    type: String
  },
  appId: {
    type: Array
  },
  first_name: {
    type: String
  },
  last_name : {
    type: String
  },
  updatedChannel :{
    type: String
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
UserSchema.method({});

/**
 * Statics
 */
UserSchema.statics = {

  getUserId(id) {
    return this.findOne({"account_id" : id})
      .exec()
      .then((user) => {
        if (user) {
          return user._id;
        }
        const err = new APIError("No user details found ", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getNotificationsPref(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user.notification;
        }
        const err = new APIError("failed", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  
   getUserDataById(id){
    return this.findById(id).exec()
    .then((user)=>{
      if(user){
        return user;
      }else{
        const err = new APIError("failed", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      }
    })

  },

  getUser(id) {
    return this.findById(id)
      .populate('account_id')
      .populate({
        path: "account_id",
        populate: {
          path: "domain"
        }
      })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError("failed", httpStatus.NOT_FOUND);
      return Promise.reject(err);
    });
  }

};

/**
 * @typedef User
 */
module.exports = mongoose.model("_user", UserSchema);
