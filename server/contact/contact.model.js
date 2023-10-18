const mongoose = require("mongoose");
const memberAccount = require("../memberAccount/memberAccount.module");
const accountUtils = require("../helpers/accountUtils");
const MessageSchema = require("../helpers/mesageschema");
const MessageQueue = require("../../config/messagequeue");
const memberModel=require("../member/member.model")
const memberIdUtils = require("../helpers/memberUtils");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");
const crypto=require("crypto")
const contactSchema = new mongoose.Schema(
  {
    
    contact: { type: String },

    contactType: {
      type: String,
    },
    channel:{type:String},
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAuthorized: { type: Boolean, default: false },
    otpDetails: {},
  },
  { timestamps: true }
);

// Use Pre hook to check the modified document and send the message in post hook if it is modified
contactSchema.pre("save", async function (next) {
  this.isOtpUpdated = false;
  
  if ((this.isModified("otpDetails.otp"))) {
    this.isOtpUpdated = true;
  }
   console.log("this.isOtpUpdated:", this.isOtpUpdated);

 
  next();
});

contactSchema.post("save", async function (next) {
  
  
  if (this.isOtpUpdated) {
    try {
      console.log("this:",this._id)
      console.log("******")
      console.log("this:",this.otpDetails.otp)
      
      console.log('connecting message queue---->');
      let messagebroker = new MessageQueue();
      await messagebroker.connect();
      let event;
      if (this.isOtpUpdated) event = 'otp';
      
        message =  new MessageSchema(event, this);
        message= await message.getSchema();
        const Contact = this.constructor;
        const contactDetails = await Contact.findById(this._id).exec();
        console.log("contact::",contactDetails)
        message.otp = contactDetails.otpDetails.otp;
        message.appId="LEAP"
        console.log("message:::",message)
        messagebroker.send(JSON.stringify(message));
      
    
  
  }catch(error){
    console.log("error::::",error)
    next(error);
  }
}

});

// contactSchema.pre("findOneAndUpdate",async function(next){
//   this.isOtpUpdated = false;
//   // if ((this.isModified("otpDetails.otp"))) {
//   //   this.isOtpUpdated = true;
//   // }
//    console.log("this.isOtpUpdated:", this.isOtpUpdated);

 
//   next();
// })

// contactSchema.post("findOneAndUpdate",async function(next){
//   if (this.isOtpUpdated) {
//     try {
//       console.log("this:",this._id)
//       console.log("******")
//       console.log("this:",this.otpDetails.otp)
      
//       console.log('connecting message queue---->');
//       let messagebroker = new MessageQueue();
//       await messagebroker.connect();
//       let event;
//       if (this.isOtpUpdated) event = 'otp';
      
//         message =  new MessageSchema(event, this);
//         message= await message.getSchema();
//         const Contact = this.constructor;
//         const contactDetails = await Contact.findById(this._id).exec();
//         console.log("contact::",contactDetails)
//         message.otp = contactDetails.otpDetails.otp;
//         messagebroker.send(JSON.stringify(message));
      
    
  
//   }catch(error){
//     console.log("error::::",error)
//     next(error);
//   }
// }
// })

function identifierObjFunc(mobile,contactVerified,contactAuth){
  let finalObj = []; //this will return list of object stored
  let mobileArr = []; //convert to array
    
    mobileArr.push(mobile);

    for (let i in mobileArr) {
      //loop start
      let obj = {
        identifiers: {
          officialMobile: mobileArr[i],
          isVerified: contactVerified,
          isAuthId: contactVerified
        },
      };
      finalObj.push(obj); //push the obj
    } //loop 
  return finalObj;
}

function notificationPreferencesFunc(mobile){
 
    //function notificationPreferencesFunc start
    
    let notificationArr = [];  //return array
    
      let obj = { sms: { isEnabled: true } };
      let obj1 = { whatsapp: { isEnabled: true } };
      notificationArr.push(obj, obj1);
      return notificationArr;
}

function contactInfoFunc(mobile) {
  //function contactInfoFun start
  
  let contactArr = []; //array of contact
 
    let obj = { primaryMobile: mobile };
    contactArr.push(obj);
    return contactArr;
  }


contactSchema.statics = {
  async updateContactDetails(
    
    verifyContactInDb,
    otp,
    otpAttemptDone
  ) {
    
    
    try {
      let updateData = await this.findOneAndUpdate(
        verifyContactInDb,
        {
          $set: {
            
            "otpDetails.otpAttemptDone": otpAttemptDone,
            "otpDetails.otp": otp,
            "isVerified":false
            
          },
        },
        { new: true }
      );
      console.log('connecting message queue---->');
      let messagebroker = new MessageQueue();
      await messagebroker.connect();
      let event="otp";
      message =  new MessageSchema(event, updateData);
        message= await message.getSchema();
        message.otp = updateData.otpDetails.otp;
        message.appId="LEAP"
        console.log("message:::",message)
        messagebroker.send(JSON.stringify(message));

      return updateData;
    } catch (error) {
      console.log(error);
    }
  },

  async updateContactOtpAttempt(id, updatedAt, otpAttemptDone) {
    try {
      let updateData = await this.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            "otpDetails.otpAttemptDone": otpAttemptDone,
            updatedAt: updatedAt,
          },
        },
        { new: true }
      );

      return updateData;
    } catch (error) {
      console.log(error);
    }
  },

  async updateOtpAttempt(verifyContactInDb, updatedAt) {
    try {
      
      let updateData = await this.findOneAndUpdate(
        { contact: verifyContactInDb.contact },
        {
          $set: {
            "otpDetails.otpAttemptDone": 0,
             updatedAt,
             "isVerified":true
          },
        },
        { new: true }
      );
      console.log("update::",updateData._doc.isContactAuthorized)
      return updateData._doc;
    } catch (error) {
      return new APIError("otpAttemptdone not updated!", httpStatus.NOT_FOUND)
    }
  },

  async updateContactAuth(contact){
    try{
      console.log("contact::",contact)
      let updateData = await this.findOneAndUpdate(
      contact,
      {
        $set: {
           "isAuthorized":true
        },
      },
      { new: true }
    );
    console.log("updateData:::",updateData)
    return updateData
    }catch(error){
      console.log(error)
    }



  }
  



 
};



module.exports = mongoose.model("contacts", contactSchema);
