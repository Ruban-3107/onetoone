const _user = require("../user/user.model");
const onesignal = require("../oneSignal/oneSignal.model");
const Promise = require("bluebird");
const mongoose = require("mongoose");
const Account = require("../account/account.model");
const crypto=require("crypto")

const eventEnum = Object.freeze({
  otp: "Otp",
  register: "New_registration"
});

class MessageSchema {
  constructor( event, details) {
    this.event = event;
    this.accountId = details._id;
    this.accountDetails= details;
    this.messageObj = {};
    this.messageObj.messageExchange = 'Register';
   
  }

  getSchema() {
    return new Promise(async(resolve,reject)=>{
      try {
        this.messageEvent();
        await this.getUserDetails();
        resolve(this.messageObj);
        } catch (error) {
            reject(error)
        }
    })
  }

  getUserDetails() {
    return new Promise(async(resolve,reject) =>{
      console.log(".....this:",this.accountDetails.contactType)
      try {
        // this.messageObj.emailID = this.accountDetails.email ? this.accountDetails.email : null;
        // this.messageObj.phoneNumber = this.accountDetails.phone;

        if(this.event  === 'otp'){
          this.messageObj.otp = this.accountDetails.otp;
          if(this.accountDetails.contactType=='primaryMobileNumber') this.messageObj.phoneNumber= await this.decrypt(this.accountDetails.contact)
          if(this.accountDetails.contactType=='primaryEmailId') this.messageObj.emailID=await this.decrypt(this.accountDetails.contact)
          if(this.accountDetails.contactType === 'primaryMobileNumber') this.messageObj.pref = ['OTPSMS'];
          else
            this.messageObj.pref = ['Email'];
        }
        if(this.event  === 'register'){
          let userID = await this.getUserID();
          // let onesignal = await this.getonesignal(this.accountDetails._id);
          // let notification = await this.getuserNotificationPref(userID);


          // for ( var i=0 ;i< notification.length ; i++){
          //   if(notification[i].value){
          //     pref.push(notification[i].name)
          //   }
          // }
          let pref =[];
          if(this.messageObj.emailID) pref = ['Email','SMS'];
          else
            pref = ['SMS'];

          this.messageObj.pref = pref;
          this.messageObj.userName = this.userName ? this.userName : "User";
          // this.messageObj.onesignal = onesignal;

        }
        resolve();
      } catch (error) {
        reject(error);
      }
    })
  }
   decrypt(data) {
    try {
      const algorithm = "aes-192-cbc";
      const key = crypto.scryptSync('onetoone', 'salt', 24);
      const iv = Buffer.alloc(16, 0);
  
      // const cipher = crypto.createCipheriv(algorithm, key, iv);
      // const encrypt = cipher.update('passwordhere', 'utf8', 'hex') + cipher.final('hex');
      // console.log('encrypted', encrypt)
  
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      const decrypted = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
      console.log("function:decrypt:", decrypted)
      return decrypted;
    }
    catch (e) {
      return data;
    }
  }

  messageEvent() {
    switch (this.event) {
      case "otp":
        this.messageObj.event = eventEnum.otp;
        break;
      case "register":
       this.messageObj.event = eventEnum.register;
       break;
    }
  }

  getUserID() {
    return new Promise((resolve, reject) => {
      _user.getUserId(this.accountId)
        .then((user) => {
          // console.log("MessageSchema -> getaccountID -> user", user);
          if (user && user.length !== 0) resolve(user);
          else reject("No user found");
        })
        .catch((e) => reject(e));
    });
  }

  getAccountOtp() {
    return new Promise((resolve, reject) => {
      Account.getAccountOtp(this.accountId)
        .then((account) => {
          // console.log("MessageSchema -> getaccount -> otp", account);
          if (account) resolve(account);
          else reject("No otp found");
        })
        .catch((e) => reject(e));
    });
  }

  getuserNotificationPref(id) {
    return new Promise((resolve, reject) => {
      _user
        .getNotificationsPref(id)
        .then((user) => {
          // console.log("MessageSchema -> getnotificationPref -> user", user);
          if (user && user.length !== 0) resolve(user);
          else reject("No user notification found");
        })
        .catch((e) => reject(e));
    });
  }

  getonesignal(accountid) {
    return new Promise((resolve, reject) => {
      onesignal.getOneSiganlDetails(accountid)
        .then((data) => {
          if (data) resolve(data);
          else resolve("No details found");
        })
        .catch((e) => reject(e));
    });
  }
}

module.exports = MessageSchema;
