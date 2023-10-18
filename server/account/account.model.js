const Promise = require("bluebird");
const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");
const PasswordHash = require("../helpers/PasswordHash");
const Schema = mongoose.Schema;
const idvalidator = require("mongoose-id-validator");
const _user = require('../user/user.model');
const MessageSchema = require("../helpers/mesageschema");
const MessageQueue = require("../../config/messagequeue");
const User = require('../user/user.model');
const userDataToCMS = require('../user/user.utility');
const crypto=require('crypto')
// const _account1 = require('./account.controller');

/**
 * Account Schema
 */
//Check about the password uniquness
const AccountSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  other_phone: {
    type: Number
  },
  first_name: {
    type: String
  },
  domain: {
    type: Schema.Types.ObjectId,
    ref: "_domain"
  },
  otp: {
    type: String
  },
  employee_code: {
    type: String
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  phone_verified: {
    type: Boolean,
    default: false
  },
  activated: {
    type: Boolean,
    default: false
  },
  registration_status: {
    type: String
  },
  otpFor: {
    type: String
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  entitlement: {
    type: String
  },
  appId: {
    type: Array
  },
  cmsData: {
    type: Boolean
  },
  accountType: {
    type: String
  },
  qr_code: {
    type: String
  },
  cmsMemberId :{
    type : String
  },
  source :{
    type: String
  },
  authenticationType :{
    type: String
  },
  userName :{
    type: String
  },
  updatedChannel :{
    type: String
  },
  otpAttemptDone:{
    type:Number
  }
 
},{timestamps:true});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

//AccountSchema.plugin(idvalidator);


//Use Pre hook to check the modified document and send the message in post hook if it is modified
AccountSchema.pre("save", async function (next) {
  this.isOtpUpdated = false;
  this.isRegistered = false;
  if (this.isModified('otp')) {
      this.isOtpUpdated = true;
  }
  if (this.isModified("registration_status") && (this.registration_status === 'Registered')){
      this.isRegistered = true;
  }
  next();
});

AccountSchema.post("save", async function (next){
  if (this.isOtpUpdated || (this.isRegistered && ! this.isOtpUpdated)) {
    try {
      console.log('connecting message queue---->');
      let flag = true;
      let messagebroker = new MessageQueue();
      await messagebroker.connect();
      let event;
      if (this.isOtpUpdated) event = 'otp';
      if (this.isRegistered) event = 'register';
      if(event === 'register' && this.appId[0] === 'REACH' ) flag = false ;
      if(flag){
        message = new MessageSchema(event, this);
        message = await message.getSchema();
        const Account = this.constructor;
        const accountDetails = await Account.findById(this._id).exec();
        message.otp = accountDetails.otp;
        messagebroker.send(JSON.stringify(message));
      }
      } catch (error) {
        console.log("get -> error", error);
        next(error);
    }
  }
});

AccountSchema.post("save", async function (next){
  if ((!this.cmsData && this.isRegistered && ! this.isOtpUpdated)) {  // this logic to be changed on updatedChannel. you can refer booking integration
    try {
      let notification;
      let accountType;
      let authType;
        if(this.appId[0] === 'REACH'){
          notification = [
              {name: 'PushNotifications', value: true, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/Notifications_eq00ed.svg'},
              {name: 'SMS', value: true, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/SMS_pwtw11.svg'},
              {name: 'WhatsApp', value: false, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/Whatsapp_kg2mev.svg'}
            ];
          accountType = "registered_user";
          authType = "qr_code"
        }
        else{
          notification = [
              {name: 'Email', value: true, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/Mail_qmlef1.svg'},
              {name: 'PushNotifications', value: true, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/Notifications_eq00ed.svg'},
              {name: 'SMS', value: true, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/SMS_pwtw11.svg'},
              {name: 'WhatsApp', value: false, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/Whatsapp_kg2mev.svg'}
            ];
          accountType = this.accountType;
          if(this.email)authType = "email";
          if(this.employee_code)authType = "employee_code";
          if(this.qr_code)authType = "qr_code";
        }
      // const notificationPref = await _account1.getNotificationPrefForUser(this.appId[0]);
        const user = new _user({
          account_id: this._id,
          notification : notification,
          cmsData: false,
          appId : this.appId
        });

          await user.save().then(async (userdoc) => {
            if(accountType === 'registered_user'){
              this._doc.userID = userdoc._id;
              let populatedDocument = await User.getUser(userdoc._id)
              populatedDocument.userAccountType = accountType;
              populatedDocument.userAuthType = authType;

              let data = await new userDataToCMS(populatedDocument).send();
              const Account = this.constructor;
              if (data.status == 200 && data.entity.memberId) {
                /**Saving to mongoDB currently not working.I have posted a question .Should try different approach later */
                Account
                  .findOneAndUpdate(
                    { _id: populatedDocument.account_id._id },
                    { cmsMemberId: data.entity.memberId },
                    { upsert: true }
                  )
                  .then((users) =>
                console.log(
                  `User successfully posted to CMS and memberID  stored in DB against`
                )
              )
              .catch((err) => console.error(err));
              }
            }
          });

    } catch (error) {
      console.log("get -> error", error);
      next(error);
    }
  }
});

/**
 * Methods
 */
AccountSchema.method({});

/**
 * Statics
 */
AccountSchema.statics = {
  //   /**
  //    * Get user
  //    * @param {ObjectId} id - The objectId of user.
  //    * @returns {Promise<User, APIError>}
  //    */
  get(id) {
    return this.findById(id)
      .exec()
      .then((account) => {
        if (account) {
          return account;
        }
        const err = new APIError(
          "No such account exists!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  updateAccount(account,condition) {
    return this.findByIdAndUpdate(account, condition, { new: true })
      .exec()
      .then((account) => {

        if (account) {
          return account;
        }
        const err = new APIError("Updation failed", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  verifyOtpforAccount(data,otp,condition) {
   console.log("verifyOtpforAccount::data:",data)
    return this.findOne({ $and : [data,{'otp': otp} ]})
      .exec()
      .then((account) => {
      if (account) {
        return this.updateAccount(account._id,condition)
      }
      const err = new APIError('Otp verification failed', httpStatus.UNAUTHORIZED);
      return Promise.reject(err);
    })
  },

  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  async getEmailId(id) {
    return this.findById(id)
      .exec()
      .then(async(account) => {
        if (account) {
          
         let decryptedEmail=await decrypt(account.email)
          return decryptedEmail;
        }
        const err = new APIError("failed", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getPhoneNumber(id) {
    return this.findById(id)
      .exec()
      .then(async(account) => {
        if (account) {
          let decryptedPhone=await decrypt(account.phone)
          return decryptedPhone;
        }
        const err = new APIError("failed", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  getAccountOtp(id) {
    return Account.findById(id)
      .exec()
      .then((account) => {
        if (account) {
          return account.otp;
        }
        const err = new APIError("failed", httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};
function decrypt(data) {
  console.log("decrypt called:")
  try {
    const algorithm = "aes-192-cbc";
    const key = crypto.scryptSync('onetoone','salt', 24);
    const iv = Buffer.alloc(16, 0);

    // const cipher = crypto.createCipheriv(algorithm, key, iv);
    // const encrypt = cipher.update('passwordhere', 'utf8', 'hex') + cipher.final('hex');
    // console.log('encrypted', encrypt)

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    console.log("decipher:",decipher)
    const decrypted = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
    
    console.log("decrypted:",decrypted)
    return decrypted;
  }
  catch(e) {
    return data;
  }
}
l
// /**
//  * @typedef Account
//  */
module.exports = mongoose.model("_account", AccountSchema);
