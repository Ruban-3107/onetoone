const MemberAccount = require('./memberAccount.module');
const commonResponse = require('../entity/commonresponse');
const accountUtils = require('../helpers/accountUtils');
const crypto = require('crypto');
const mongoose = require("mongoose");
const PasswordHash = require("../helpers/PasswordHash");
const config = require('../../config/config');
const getMongoDBID = require('../helpers/mongoDBUtils');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');
const contactModel = require('../contact/contact.model');
const memberModel = require('../member/member.model');
const JwtToken = require('../helpers/JWTTokenHandler');
const memberIdUtils = require('../helpers/memberUtils');
const Member = require('../member/member.model');
const sponsorAccountModel = require('../sponsorAccount/sponsorAccount.model');
const sponsor = require('../sponsor/sponsor.model');
const sponsorModel = require('../sponsor/sponsor.model');
const sponsorUtils = require('../helpers/sponsorUtils');
const appointmentModel=require('../appointment/appointment.model')
const personalEmailDomain=require('../personalEmailDomain/personalEmailDomain.model')

/** create Member account function */
async function createMemberAccountObj(req,res) {
  //function createMemberAccountObj start
  let accountId = await accountUtils(); //unique account id generate

  // let memberIdentifierObj = await identifierObjFunc(req.body);
  // let accountAccessIdObj = await accountAccessIdFunc(req.body);
  let memberEntitlementObj = await memberEntitlementFunc(req.body.sponsorId,req.body.productId,res);
  console.log("memberEntitlementObj::",memberEntitlementObj)
  console.log(memberEntitlementObj.productList[0].productEntitlement.appPageDefaults,"++++")
  let memberContactArr = await contactFunc(req.body.memberContacts);
  console.log("memberContactArr:::",memberContactArr)
  let accountAccessIdArr=await accountAccessIdFunction(req.body.accountAccessId)
  console.log("accountAccessIdArr:::",accountAccessIdArr)
  // let accountActivationDetailsObj = await accountActivationFunc(req.body);
  

  return new MemberAccount({
    accountId: accountId,
    memberId: req.body.memberId,
    accountDetails:req.body.accountDetails,
   accountAccessId: accountAccessIdArr,
    memberContacts:memberContactArr,
    sponsorId: req.body.sponsorId,
    memberEntitlement: memberEntitlementObj.productList[0],
    memberPageDefault:memberEntitlementObj.productList[0].productEntitlement.appPageDefaults,

    // accountActivationDetails: accountActivationDetailsObj,
  }); //function createMemberAccountObj end
}

const createMemberAccount = async (req, res, next) => {
  // function createMemberAccount start

  let memberAccount = await createMemberAccountObj(req,res); //this will return the member obj to store in db

  if (memberAccount) {
    memberAccount
      .save()
      .then(async (memberAccount) => {
        if(req.body.showProfileBuilding == false){
          condition = { "memberPageDefault.showProfileBuilding": false }
           await MemberAccount.findOneAndUpdate(
            {memberId:req.body.memberId},
            condition,{new:true}
          );
          
        }
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({val: {memberAccountId:memberAccount.accountId}, code: '200'})
        );
        return res.json(response);
      })
      .catch((error) => {
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({err: error, code: '601'})
        );
        return res.json(response);
      });
  } else {
    let response = commonResponse.responseCb(
      commonResponse.bodyCb({err: 'member Account not created', code: '601'})
    );
    return res.json(response);
  }
}; //function createMemberAccount end

async function accountAccessIdFunction(details){
  console.log("details::::::::",details)
  let encryptEmail;
  let encryptPhone;
let obj;
let accountAccessId=[];
await details.forEach(async data=>{
  if(Object.keys(data)=="officialEmailID"){
      console.log("data:::&&&&",data.officialEmailID)
      encryptEmail=await encrypt(data.officialEmailID)
      data.officialEmailID=encryptEmail
      // details.accountAccessId.officialEmailId=encryptEmail
      // console.log("data.contact.contact:::",data)
       accountAccessId.push(data)
  }
  else if(Object.keys(data)=="primaryMobileNumber"){
      console.log("data:::*****",data.primaryMobileNumber)
      encryptPhone=await encrypt(data.primaryMobileNumber)
     // details.accountAccessId.primaryMobileNumber=encryptPhone
      // console.log("data.contact.contact:::",data)
      data.primaryMobileNumber=encryptPhone
      accountAccessId.push(data)
  }else if(Object.keys(data)=="employeeCode"){
    accountAccessId.push(data)
  }else if(Object.keys(data)=="qrCode"){
    accountAccessId.push(data)
  }else if(Object.keys(data)=="numericCode"){
    accountAccessId.push(data)
  }else{
    return new APIError("accessId not found", httpStatus.NOT_FOUND)
  }
})


console.log(" accountAccessId:::", accountAccessId)
return  accountAccessId
}

async function contactFunc(details) {
  //function contactInfoFun start
  
    console.log("data1::::::::",details)
    let encryptEmail;
    let encryptPhone;
    let obj;
    console.log("data1::::::::here")
    let memberContacts=[];
    details.forEach(async data=>{
    if(data.contact.type=="primaryEmailId"){
      encryptEmail=await encrypt(data.contact.contact)
      console.log(" encryptEmail:::", encryptEmail)
        data.contact.contact=encryptEmail
        console.log("data.contact.contact:::",data)
        memberContacts.push(data)
        

    }else if(data.contact.type=="primaryMobileNumber"){
      encryptPhone=await encrypt(data.contact.contact)
        data.contact.contact=encryptPhone
        console.log("data.contact.contact:::",data)
        memberContacts.push(data)
    }else if(data.contact.type=="employeeCode"){
          memberContacts.push(data)
    }else if(data.contact.type=="qrCode"){
      memberContacts.push(data)
    }
    
})


console.log("memberContacts::::::::::::::::::::::::::::",memberContacts)
 return memberContacts;
}

/*identifier object function return list of identifier object*/

// function identifierObjFunc(details) {
//   //function identifierObjFunc start
//   let { mobile, email } = details; //destructing the obj

//   let finalObj = []; //this will return list of object stored

//   if (email) {
//     //if email  start
//     let emailArr = []; //convert to array
//     let encryptedEmail = encrypt(email); //encrypted
//     emailArr.push(encryptedEmail);

//     for (let i in emailArr) {
//       //loop start
//       let obj = {
//         identifiers: {
//           officialEmail: emailArr[i],
//           isVerified: false,
//           isAuthId: false,
//         },
//       };
//       finalObj.push(obj); //push the obj
//     } //loop end
//   } //if email  end

//   if (mobile) {
//     //if mobile  start
//     let mobileArr = []; //convert to array
//     let encryptedmobile = encrypt(mobile); //encrypted

//     mobileArr.push(encryptedmobile);
//     for (let i in mobileArr) {
//       //loop start
//       let obj = {
//         identifiers: {
//           officialMobile: mobileArr[i],
//           isVerified: false,
//           isAuthId: false,
//         },
//       };
//       finalObj.push(obj); //push the obj
//     } //loop end
//   } //if mobile  end
//   return finalObj; //return finalObj
// } //function identifierObjFunc end

/** function will return the access of the member*/
function accountAccessIdFunc(details) {
  //function start
  let {mobile, email} = details;
  let accessobj = []; //store the data

  let encryptedEmail = encrypt(email); //encrypted
  let encryptedmobile = encrypt(mobile);
  if (mobile) accessobj.push({primaryMobileNumber: encryptedmobile});
  if (email) accessobj.push({officialEmailId: encryptedEmail});

  return accessobj;
} //function end

/** member entitlement function will return object of the sponsor bought product */

async function memberEntitlementFunc(sponsorId,productId,res) {
  console.log("sponsorId,productId:::",sponsorId,productId)
  let findDomainInSponsorAccount = await sponsorAccountModel.findOne(
    {"sponsorId": sponsorId},
    {productList: { $elemMatch: {id: productId} },
     
    }
  )
    .lean()
    .exec();
  console.log(" findDomainInSponsorAccoun:::::::::",findDomainInSponsorAccount);
  if(findDomainInSponsorAccount){
    return findDomainInSponsorAccount;
  }else{
    res.json({ststus:600,message:"sponsor not found"})
    return new APIError("sponsor not found", httpStatus.NOT_FOUND);
  }
}

/**
 * Used to generate 4 digit otp
 */

const getOTP = () =>
  new Promise((res) =>
    // crypto.randomBytes(size[, callback])
    crypto.randomBytes(4, (err, buffer) => {
      res(parseInt(buffer.toString('hex'), 16).toString().substr(0, 4));
    })
  );

const verifyWhitelistNumber = (mobile) => {
  const number = ['9986104825'];
  return number.includes(mobile);
};

//--------------------------------------------------------------------//
//verify contact create otp
const verifyContact = async (req, res, next) => {
  try {
    let filterRequestObj;
    //check query and find the object.//TODO discuss...now it fetch based on length
    if (req.body.contactList.length == 1) {
        filterRequestObj = req.body.contactList[0];
    } else if (req.body.contactList.length == 2) {
        filterRequestObj = req.body.contactList[1];
    }
    console.log('filterRequestObj::', filterRequestObj);
    

    const contactEncrypted = await encrypt(filterRequestObj.contact.contact); //encrypted the contact

    filterRequestObj.contact.contact = contactEncrypted; //encrypted aasign
    console.log('filterRequestObj::', filterRequestObj);

    let otp = await getOTP(); //get otp function

    const verifyContactInDb = {contact: contactEncrypted}; //map the contact

    let findContactInDb = await contactModel.findOne(verifyContactInDb).lean().exec(); //search in contact table

    console.log('findcontact::', findContactInDb);
    let timeCalculationForOtpAttempt = await otpAtteptDoneCalculation(findContactInDb);
    console.log('timeCalculationForOtpAttempt::', timeCalculationForOtpAttempt);
    let sendObj = {
      req,
      res,
      otpAttemptDone: timeCalculationForOtpAttempt.otpAttemptDone,
      findContactInDb,
      otp,
      verifyContactInDb,
      filterRequestObj,
    };
    await timeConditionForOtp(timeCalculationForOtpAttempt, sendObj);
  } catch (error) {
    next(error);
  }
};
//--------------------------------------------------------------------//

async function timeConditionForOtp(timeCalculationForOtpAttempt, sendObj) {
  let res = sendObj.res;
  if (timeCalculationForOtpAttempt.user) {
    if (
      timeCalculationForOtpAttempt.otpAttemptDone >= config.otp_max_limit &&
      timeCalculationForOtpAttempt.nowAndLastUpdateTimeDiffInMin <
        config.otp_limit_min
    ) {
      if (
        timeCalculationForOtpAttempt.nowAndLastUpdateTimeDiffInHr >
        config.otp_userblock_limit_hr
      ) {
        let updatedAccount = await contactModel.updateContactOtpAttempt(
          sendObj.findContactInDb._id,
          {
            updatedAt: Date.now(),
            otpAttemptDone: 0,
          }
        );
        if (updatedAccount) {
          await sendOtp(sendObj);
        }
      } else {
        let result = `Enter More than 5times wrong OTP.You have enter the existed the limited time period,it will reactivate back at 1hr`;
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({err: result, code: '610'})
        );
        return res.status(200).json(response);
      }
    } else {
      await sendOtp(sendObj);
    }
  } else {
    await sendOtp(sendObj);
  }
}
//--------------------------------------------------------------------//
//sendOtp Function--- send otp
async function sendOtp({
  req,
  res,
  otpAttemptDone,
  findContactInDb,
  otp,
  verifyContactInDb,
  filterRequestObj,
}) {
  otpAttemptDone = otpAttemptDone + 1; //increase the count+1
  console.log('otpAttemptDone after', otpAttemptDone);
  // 1.Check Contact Exists ? If Not Create , Else update OTP in contact collection
  //1.a.contact not found
  if (!findContactInDb) {
    try {
      console.log('!findContactInDb', !findContactInDb == null);
      let createContact = await contactCreateFunc(
        //create contact .
        filterRequestObj,
        otp,
        otpAttemptDone
      );
      console.log('createContact', createContact);

      let contactStoreInMongoDb = await createContact.save(); //saved in contact collection.

      if (contactStoreInMongoDb) {
        let data = {
          status: 'success',
        };
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({val: data, code: '200'})
        );
        return res.status(200).json(response);
      } else {
        let data = {
          status: 'fail',
        };
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({val: data, code: '601'})
        );
        return res.status(200).json(response);
      }
    } catch (error) {
      let response = commonResponse.responseCb(
        commonResponse.bodyCb({val: error, code: '601'})
      );
      return res.status(200).json(response);
    }
  } else {
    //1.a.contact found update
    try {
      // Check For contact Collection , Whether Official email id Exists
      // A) if exists in contact collection, Check the isVerified &  isAuthorized
      //B)Skip the veriftOtp directly take to home page
      if (
        findContactInDb.isAuthorized == true &&
        findContactInDb.isVerified == true &&
        filterRequestObj.contact.contactType == 'primaryEmailId'
      ) {
        // checking memberAccount email is present
        let getMemberAccount = await MemberAccount.find({
          accountAccessId:{
            $elemMatch:
            {primaryEmailId: findContactInDb.contact}
            }    
        })
          .lean()
          .exec();

        // token generation
        const token = await tokenGenerationFunc(
          getMemberAccount[0].memberId,
          getMemberAccount[0].accountId
        );

        //response contact for email
        let extractContactDataForEmail = await ContactInDbextract(
          findContactInDb,
          'isVerified',
          'isAuthorized',
          'channel',
          'contactType',
          'contact'
        );

        //mobile data get from contact collection.
        let getMobileContactDetails = req.body.contactList[0]; //from req body
        const contactEncrypted = await encrypt(
          getMobileContactDetails.contact.contact
        );

        const geContactInDb = {contact: contactEncrypted}; //map the contact

        //search in contact table
        let fetchContactInDb = await contactModel
          .findOne(geContactInDb)
          .lean()
          .exec();

        //response contact for phone
        let extractContactDataForMobile = await ContactInDbextract(
          fetchContactInDb,
          'isVerified',
          'isAuthorized',
          'channel',
          'contactType',
          'contact'
        );

        let contactArr = []; //array of contact for response
        contactArr.push(
          extractContactDataForMobile,
          extractContactDataForEmail
        );

        let memberEntitlement = getMemberAccount[0].memberEntitlement
          ? getMemberAccount[0].memberEntitlement
          : null;
        let memberPageDefault = getMemberAccount[0].memberPageDefault
          ? getMemberAccount[0].memberPageDefault
          : null;

        let accountStatus = getMemberAccount[0].accountDetails.accountStatus;
        let accountType = getMemberAccount[0].accountDetails.accountType;

        let data = {
          contactList: contactArr,
          token: token,
          memberEntitlement: memberEntitlement,
          memberPageDefault: memberPageDefault,
          accountStatus: accountStatus,
          accountType: accountType,
        };
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({val: data, code: '200'})
        );
        return res.status(200).json(response);
      }

      //A) if exists in contact collection, Check the isVerified &  isAuthorized
      //	i) if isVerified = false &  isAuthorized = false
      //	a) Generate OTP
      //	b) update contact collection with  otp

      let updateContact = await contactModel.updateContactDetails(
        verifyContactInDb,
        otp,
        otpAttemptDone
      );
      //if update sucess
      if (updateContact) {
        let data = {
          status: 'success',
        };
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({val: data, code: '200'})
        );
        return res.status(200).json(response);
      } else {
        //update fail
        let data = {
          status: 'fail',
        };
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({val: data, code: '601'})
        );
        return res.status(200).json(response);
      }
    } catch (error) {
      let response = commonResponse.responseCb(
        commonResponse.bodyCb({val: error, code: '601'})
      );
      return res.status(200).json(response);
    }
  }
}
//--------------------------------------------------------------------//
//This function return the extracted object for response
const ContactInDbextract = (obj, ...keys) => {
  console.log('obj::', obj);
  const newObject = Object.assign({});
  console.log('outside::', keys);
  Object.keys(obj).forEach((key) => {
    console.log('inside::', key);
    if (keys.includes(key)) {
      newObject[key] = obj[key];
      delete obj[key];
    }
  });
  console.log('newObj::', newObject);
  return newObject;
};
//--------------------------------------------------------------------//

async function updateContactDetails(userContact, obj) {
  try {
    console.log('inside::updateContactDetails');
    console.log('obj:::', obj);
    console.log('userContact:::', userContact);
    let updateStatus = await contactModel.findById(userContact._id);

    //  updateStatus.set(obj);
    console.log('updateStatus before:::', updateStatus);
    updateStatus.otpDetails.otp = obj.otp;
    updateStatus.otpDetails.otpAttemptDone = obj.otpAttemptDone;
    console.log('updateStatus  after:::', updateStatus);
    let savedInDb = await updateStatus.save();
    console.log('savedInDb::', savedInDb);
    if (savedInDb) return savedInDb;
    else return res.send('otp updated failed');
  } catch (error) {
    next(error);
  }
}
//--------------------------------------------------------------------//
//**/create new contact  obj*/

const contactCreateFunc = (data, otp, otpAttemptDone) => {
  console.log('inside::contactCreateFunc');
  return new contactModel({
    contact: data.contact.contact,
    contactType: data.contact.contactType,
    channel: data.contact.channel,
    otpDetails: {
      otp: otp,
      otpAttemptDone: otpAttemptDone,
    },
  });
};
//--------------------------------------------------------------------//
//otpAttemptDone calculation function return timeCalculation
async function otpAtteptDoneCalculation(user) {
  try {
    let otpAttemptDone;
    let updatedDate;

    if (user) {
      if (
        user.otpDetails.otpAttemptDone == undefined ||
        user.updatedAt == undefined
      ) {
        user.otpDetails.otpAttemptDone = 0;
        user.updatedAt = updatedDate = Date.now();
      }
    }
    // console.log("user.otpDetails.otpAttemptDone:::",user.otpDetails.otpAttemptDone)
    otpAttemptDone = !user
      ? (otpAttemptDone = 0)
      : user.otpDetails.otpAttemptDone;
    updatedDate = !user ? (updatedDate = Date.now()) : user.updatedAt;
    console.log('otpAttemp:', otpAttemptDone);
    console.log('updatedDate:', updatedDate);

    let lastUpdateEpochTime = Math.floor(
      new Date(updatedDate).getTime() / 1000
    ); //convert into epochtime
    let nowEpochTime = Math.floor(new Date().getTime() / 1000);
    let nowAndLastUpdateTimeDiffInMin =
      (nowEpochTime - lastUpdateEpochTime) / 60; //convert into minutes
    nowAndLastUpdateTimeDiffInMin = nowAndLastUpdateTimeDiffInMin.toFixed(2);

    let nowAndLastUpdateTimeDiffInHr = nowAndLastUpdateTimeDiffInMin / 60; //convert into hour
    nowAndLastUpdateTimeDiffInHr = nowAndLastUpdateTimeDiffInHr.toFixed(2);

    let timeCalculationForOtpAttemptObj = {
      nowAndLastUpdateTimeDiffInHr,
      nowAndLastUpdateTimeDiffInMin,
      user,
      otpAttemptDone,
    };
    console.log(
      'timeCalculationForOtpAttemptObj:',
      timeCalculationForOtpAttemptObj
    );
    return timeCalculationForOtpAttemptObj;
  } catch (error) {
    next(error);
  }
}
//--------------------------------------------------------------------//
//only for Email and mobile combination
async function getMemberContactArrEmail(
  mobileNumberEncrypted,
  filterRequestObj
) {
  let updateEmailIsAuthorized = await contactModel.updateContactAuth({
    contact: filterRequestObj.contact.contact,
  }); //updateEmailAuthorized

  console.log('updateEmailIsAuthorized:::', updateEmailIsAuthorized);

  let contactObjEmail = await contactObjFunc(updateEmailIsAuthorized._doc); //return particular fields

  let updateMobileIsAuthorized = await contactModel.updateContactAuth({
    contact: mobileNumberEncrypted,
  }); //updateMobileAuthorized

  console.log('updateMobileIsAuthorized:::', updateMobileIsAuthorized);
  let contactObjMobile = await contactObjFunc(updateMobileIsAuthorized._doc);
  let contact = []; //contact Array
  contact.push({contact: contactObjMobile}, {contact: contactObjEmail}); //convert to array
  console.log('contact :::', contact);
  return contact;
}

//--------------------------------------------------------------------//
//get member contact
async function getMemberContactArr(
  mobileNumberEncrypted,
  filterRequestObj,
  field
) {
  try {
    let contact = [];
    console.log('inside : getMemberContactArr');
    let updateMobileIsAuthorized = await contactModel.updateContactAuth({
      contact: mobileNumberEncrypted,
    }); //updateMobileAuthorized

    console.log('updateMobileIsAuthorized::::::::', updateMobileIsAuthorized); //auth=true
    let contactObjMobile = await contactObjFunc(
      //extract particular field
      updateMobileIsAuthorized._doc
    );
    console.log('contactObjMobile::', contactObjMobile);
    if (field == 'employeeCode') {
      let updateAuthInAccount =
        await MemberAccount.updateContactAuthInMemberAccount(
          //update the employee/qr/numeric code
          filterRequestObj.contact.contact,
          field
        );
      console.log(
        'updateAuthInAccount::::::::::::::::::::::::::',
        updateAuthInAccount.memberContacts
      );
      console.log('*************************************');
      console.log(filterRequestObj.contact.contact, contactObjMobile, field);

      let insertMobileContactInAccount =
        await MemberAccount.insertContactAuthInMemberAccount(
          //insert contact in memberAccount
          filterRequestObj.contact.contact,
          contactObjMobile,
          field
        );
      console.log(
        'insertMobileContactInAccount::employee_code',
        insertMobileContactInAccount.memberContacts
      );

      let insertMobileContactInMember = await Member.insertContactAuthInMember(
        //insert contact in memberAccount
        filterRequestObj.contact.contact,
        insertMobileContactInAccount.memberContacts
      );
      console.log(
        'insertMobileContactInAccount::employee_code',
        insertMobileContactInAccount.memberContacts
      );
      console.log(
        'insertMobileContactInMember::employee_code',
        insertMobileContactInMember.memberContacts
      );
      // contact = insertMobileContactInAccount.memberContacts; //contact array
      return insertMobileContactInAccount.memberContacts;
    } else if (field == 'QRCode') {
      let contactQrCode = {
        isVerified: true,
        isAuthorized: true,
        QRCode: filterRequestObj.contact.contact,
      };

      contact.push({contact: contactObjMobile}, {contact: contactQrCode}); //convert to array
      console.log('contact :::', contact);
      return contact;
    } else if (field == 'NumericCode') {
      let contactNumericCode = {
        isVerified: true,
        isAuthorized: true,
        NumericCode: filterRequestObj.contact.contact,
      };

      contact.push({contact: contactObjMobile}, {contact: contactNumericCode}); //convert to array
      console.log('contact :::', contact);
      return contact;
    } else {
      //guest or unknown
      contact.push({contact: contactObjMobile}); //convert to array
      console.log('contact :::', contact);
      return contact;
    }
  } catch (error) {
    next(error);
  }

  // console.log("inside:: getMemberContactArr:::contact :::", contact);
  // return contact;
}
//--------------------------------------------------------------------//
//contact array response fetch from db
const contactArrForResponse = async ({validateContactOtp, email}) => {
  console.log('inside :contactArrForResponse', validateContactOtp);
  try {
    let contactArr = []; //array of contact response

    let extractContactDataForMobile = await ContactInDbextract(
      validateContactOtp,
      'isVerified',
      'isAuthorized',
      'channel',
      'contactType',
      'contact'
    );
    console.log(
      'extractContactDataForMobile:::::::::::',
      extractContactDataForMobile
    );
    contactArr.push({contact: extractContactDataForMobile});
    if (email) {
      let findContactInDb = await contactModel //find email in contact table
        .findOne({contact: email})
        .lean()
        .exec();
      console.log('findContactInDb:', findContactInDb);
      let extractContactDataForEmail = await ContactInDbextract(
        findContactInDb,
        'isVerified',
        'isAuthorized',
        'channel',
        'contactType',
        'contact'
      );
      console.log('extractContactDataForEmail::', extractContactDataForEmail);
      contactArr.push({contact: extractContactDataForEmail});
    }
    console.log('inside :contactArrForResponse:contactArr:', contactArr);

    return contactArr;
  } catch (error) {
    next(error);
  }
};

//--------------------------------------------------------------------//
//check the member account exist

async function checkMemberAcccountDetail(filterRequestObj) {
  try {
    console.log('inside::checkMemberAcccountDetail');
    console.log(
      'inside::checkMemberAcccountDetail,filterRequestObj:',
      filterRequestObj
    );
    let mapContactTypeAndContact = {}; //mapping contact and contactType in filterRequestObj
    for (let i in filterRequestObj) {
      mapContactTypeAndContact[filterRequestObj.contact['contactType']] =
        filterRequestObj.contact['contact'];
    }
    console.log("mapContactTypeAndContact::",mapContactTypeAndContact)

    //check member has account
    let checkMemberAccount = await MemberAccount.find({
      accountAccessId:{
        $elemMatch:
        mapContactTypeAndContact
        }
    }).lean()
      .exec();
    console.log('checkMemberAccount:', checkMemberAccount.length);
    console.log('checkMemberAccount:', checkMemberAccount);
    if (checkMemberAccount.length) return checkMemberAccount;
    else return false;
  } catch (error) {
    return new APIError(error, httpStatus.NOT_FOUND);
  }
}
//--------------------------------------------------------------------//
//insertMemberContactFunc contact data store in memberAccount

async function insertMemberContactFunc({
  contact,
  checkMemberAccount,
  accountType,
}) {
  try {
    console.log('inside:insertMemberContactFunc');
    let insertMemberContactsInAccount = await MemberAccount.insertContactData(
      contact,
      checkMemberAccount[0].memberId,
      accountType
    );
    console.log(
      'insertMemberContactsInAccount::',
      insertMemberContactsInAccount
    );
    //inserting contact to db based on memberId in member
    let insertMemberContactsInMember = await memberModel.insertContactData(
      contact,
      checkMemberAccount[0].memberId,
      accountType
    );
    console.log('insertMemberContactsInMember:', insertMemberContactsInMember);

    return insertMemberContactsInAccount;
  } catch (error) {
    return new APIError(error, httpStatus.NOT_FOUND);
  }
}
//--------------------------------------------------------------------//
/**verifyAuthorization  function */

const verifyAuthorization = async (req, res, next) => {
  //function verifyAuthorization  start here
  try {
          let filterRequestObj;
          let domain;
          let mobileNumberEncrypted;
          let reqProductId;
          if(req.body.productId==="HM"){
              let obj={
                memberEntitlement:[],
                ProfileName:"gourab"
              }
          return res.json(obj)

          }

          if (req.body.contactList.length == 1) {
            //mobile
              filterRequestObj = req.body.contactList[0];
              mobileNumberEncrypted = encrypt(req.body.contactList[0].contact.contact);
          } else if (req.body.contactList.length == 2) {
            //email or qrcode or numeric code
              filterRequestObj = req.body.contactList[1];
              mobileNumberEncrypted = encrypt(req.body.contactList[0].contact.contact);
          }
          reqProductId = filterRequestObj.contact.productId;

          let contactTypeObj=Object.freeze({
                QRCODE:'QRCode',
                EMPLOYEECODE:'employeeCode',
                PRIMARYMOBILENUMBER:'primaryMobileNumber',
                OFFICIALEMAILID:'officialEmailID',
                NUMERICCODE:'NumericCode',
                GUEST:'guest',
                UNKNOWN:'unknown'

          })


          if (filterRequestObj.contact.contactType == contactTypeObj.QRCODE) {/********************qrcode Flow */
                    

                    let field = 'QRCode';
                    let findDomainInSponsorAccount =await sponsorAccountModel.findsponsorByAuthorizationType(filterRequestObj,'QRCode');

                    if (findDomainInSponsorAccount.length) {
                          console.log('findSponsorFromDb::', findDomainInSponsorAccount);
                          //1.create member
                          //2.create member Account
                          //3.add entitlement
                          //4.push email and mobile contact in member contact.

                          let contact = await getMemberContactArr(
                            //it will update contact,and return array Of contact
                            mobileNumberEncrypted,
                            filterRequestObj,
                            field
                          );
                          console.log('_________________________qrcode--3');
                          console.log('contact:::::::::::::::::', contact);
                          let accountType = 'entitled';
                          let memberDataObj = {
                            findDomainInSponsorAccount,
                            filterRequestObj,
                            mobileNumberEncrypted,
                            accountType,
                            contact,
                          };
                          let createMemberAndMemberAccount =await newMemberAccountAndMemberCreation(memberDataObj); //this function create member and member Account
                          if (createMemberAndMemberAccount) {
                              let response = await responseDataFunction(createMemberAndMemberAccount,contact,reqProductId);//this function return structureof response
                              console.log('response::', response);
                              return res.json(response);
                          }
                    } else {
                          console.log('sponsor not found');
                          let message = 'sponsor not found';
                          let response = commonResponse.responseCb(
                            commonResponse.bodyCb({err: message, code: '605'})
                          );
                          return res.send(response);
                    }
          } else if (filterRequestObj.contact.contactType == contactTypeObj.EMPLOYEECODE) {//**********employeeCode*************/
            
            let field = 'employeeCode';
            //check member has account
            console.log('employee_code:', filterRequestObj.contact.contact);
            //query
            let checkMemberAccount = await MemberAccount.find({
              memberContacts: {
                $elemMatch: {
                  'contact.employeeCode': filterRequestObj.contact.contact,
                },
              },
            })
              .lean()
              .exec();
            console.log('checkMemberAcco::', checkMemberAccount);
            if (checkMemberAccount.length) {// employee_code present
                   
                  let contact = await getMemberContactArr(mobileNumberEncrypted,filterRequestObj,field);//it will update contact,and return array Of contact
                  console.log('contact::', contact);

                  let responseObj = await responseDataFunction(checkMemberAccount,contact,reqProductId);

                  return res.json(responseObj);
            } else {
              //employee_code not present

              let response = commonResponse.responseCb(
                commonResponse.bodyCb({val: 'sponsor not found', code: '605'}));
              return res.json(response);
            }
          } else if (filterRequestObj.contact.contactType == contactTypeObj.PRIMARYMOBILENUMBER) { //**************mobile Flow************/
           
                let contactEncrypted = await encrypt(filterRequestObj.contact.contact);
                filterRequestObj.contact.contact = contactEncrypted; //encrypted--reassign to obj.

                let validateContactOtp = await validateOtpFunc(filterRequestObj); //validating otp and update data
                console.log('validateContactOtp::', validateContactOtp);

                if (validateContactOtp == false) {
                  //if fail it will stop here
                  //otp verification
                    let message = 'otp verification failed';
                    let response = commonResponse.responseCb(commonResponse.bodyCb({err: message, code: '602'}));
                    return res.json(response);
                }

                if (validateContactOtp.isAuthorized == true) {
                      let checkMemberAccount = await checkMemberAcccountDetail(filterRequestObj);
                      if (checkMemberAccount) {
                              let email = checkMemberAccount[0].accountAccessId[0].officialEmailID; //get email from response
                              console.log('email:', email);

                              console.log('validateContactOtp::', validateContactOtp);
                              let objContact = {
                                validateContactOtp,
                                email,
                              };

                              let contact = await contactArrForResponse(objContact);

                              let responseObj = await responseDataFunction(checkMemberAccount,contact,reqProductId);
                              return res.json(responseObj);
                      }
                } else {
                      // if mobile isAuthorized=false
                      let contactResponse = await contactArrForResponse({validateContactOtp});
                      let data = {contactList: contactResponse};
                      let response = commonResponse.responseCb(
                        commonResponse.bodyCb({val: data, code: '200'})
                      );
                      return res.json(response);
                }
          } else if (filterRequestObj.contact.contactType == contactTypeObj.OFFICIALEMAILID) {//*******************Email Flow*********/
                let contactSplit = filterRequestObj.contact.contact.split('@');
                domain = contactSplit[1];
                let contactEncrypted = await encrypt(filterRequestObj.contact.contact);
                filterRequestObj.contact.contact = contactEncrypted; //encrypted--reassign to obj.
                const validateContactOtp = await validateOtpFunc(filterRequestObj); //validating otp and update data

                if (validateContactOtp == false) {
                      //if fail it will stop here
                      //otp verification
                      let message = 'otp verification failed';
                      let response = commonResponse.responseCb(
                        commonResponse.bodyCb({err: message, code: '602'})
                      );

                      return res.json(response);
                }
            
                let checkMemberAccount = await checkMemberAcccountDetail(filterRequestObj);
            
                if (checkMemberAccount) {
                  //account exist
                      if (checkMemberAccount[0].accountDetails.accountType != 'entitled') {
                        //load by cms
                        //find sponsor
                            console.log('inside not entitled');
                            //check domain
                            let findDomainInSponsorAccount =await sponsorAccountModel.findSponsor({reqProductId, domain});

                            if (findDomainInSponsorAccount.length) {
                                  //if domain
                                  //contact not present in member account push both contacts
                                  //after isAuth=true in contact and memberAccount
                                  let contact = await getMemberContactArrEmail(
                                    //it will update contact,and return array Of contact
                                    mobileNumberEncrypted,
                                    filterRequestObj
                                  );
                                  console.log('contact::inside not entitled', contact);
                                  let accountType = 'entitled';
                                  let insertObj = {
                                    contact,
                                    checkMemberAccount,
                                    accountType,
                                  };
                                  let InsertIntoMemberAndMemberAccContact =await insertMemberContactFunc(insertObj);
                                  //inserting contact to db based on memberId in account
                                  
                                  if (InsertIntoMemberAndMemberAccContact.accountDetails.accountType =='entitled') {
                                    //extract response data

                                        let response = await responseDataFunction(InsertIntoMemberAndMemberAccContact,
                                          contact,
                                          reqProductId
                                        );//this function return structureof response

                                        return res.json(response);
                                  }
                            } else {
                                  //update as a guest user.

                                  //contact not present in member account push both contacts
                                  //after isAuth=true in contact and memberAccount
                                  // console.log("here");

                                  let contact = await getMemberContactArrEmail(mobileNumberEncrypted,filterRequestObj); //it will update contact,and return array Of contact
                                  let accountType = 'guest';
                                  let insertObj = {
                                    contact,
                                    checkMemberAccount,
                                    accountType,
                                  };
                                  let InsertIntoMemberAndMemberAccContact=await insertMemberContactFunc(insertObj);
                                  //inserting contact to db based on memberId in account
                                  

                                  if (InsertIntoMemberAndMemberAccContact.accountDetails.accountType =='guest') {
                                        let response = await responseDataFunction(
                                          //this function return structure of response
                                          InsertIntoMemberAndMemberAccContact,
                                          contact,
                                          reqProductId
                                        );

                                        return res.json(response);
                                  } else {
                                        //fail
                                        let message = 'member updated failed in db!!';
                                        let response = commonResponse.responseCb(
                                          commonResponse.bodyCb({err: message, code: '601'})
                                        );
                                        return res.json(response);
                                  }
                            }
                      } else if (checkMemberAccount[0].accountDetails.accountType == 'entitled') {
                        console.log(
                          'entitled ----here:',
                          checkMemberAccount[0].memberContacts);

                        let contact = await getMemberContactArrEmail(
                          //it will update contact,and return array Of contact
                          mobileNumberEncrypted,
                          filterRequestObj
                        );
                        let accountType = 'entitled';
                        console.log('contact inside entitled:::', contact);
                        let insertObj = {
                          contact,
                          checkMemberAccount,
                          accountType,
                        };
                        let InsertIntoMemberAndMemberAccContact =
                          await insertMemberContactFunc(insertObj);

                        console.log(
                          'InsertIntoMemberAndMemberAccContact::::::::::3',
                          InsertIntoMemberAndMemberAccContact
                        );
                        // console.log(
                        //   "updateMobileIsAuthorized._doc,:::",
                        //   updateMobileIsAuthorized._doc
                        // );

                        let response = await responseDataFunction(
                          //this function return structureof response
                          InsertIntoMemberAndMemberAccContact,
                          contact,
                          reqProductId
                        );

                        return res.json(response);
                      }
                } else {
                  //create new account

                  //find sponsor

                  console.log('productId:::domain', reqProductId, domain);

                  let findDomainInSponsorAccount = await sponsorAccountModel.findSponsor({
                    reqProductId,
                    domain,
                  });

                  if (findDomainInSponsorAccount.length) {
                    let contact = await getMemberContactArrEmail(
                      //it will update contact,and return array Of contact
                      mobileNumberEncrypted,
                      filterRequestObj
                    );
                    let accountType = 'entitled';
                    let memberDataObj = {
                      findDomainInSponsorAccount,
                      filterRequestObj,
                      mobileNumberEncrypted,
                      accountType,
                      contact,
                    };
                    let createMemberAndMemberAccount =
                      await newMemberAccountAndMemberCreation(memberDataObj); //this function create member and member Account
                    console.log(
                      'inside verify authorization new member creation createMemberAndMemberAccount::',
                      createMemberAndMemberAccount
                    );
                    if (createMemberAndMemberAccount) {
                      let response = await responseDataFunction(
                        //this function return structureof response
                        createMemberAndMemberAccount,
                        contact,
                        reqProductId
                      );
                      console.log('response::', response);

                      return res.json(response);
                    }
                  } else {
                    console.log('config.guestSponsorId', config.guestSponsorId);
                    let findDomainInSponsorAccountForGuest = await sponsorAccountModel
                      .findOne({
                        sponsorId: config.guestSponsorId,
                      })
                      .lean()
                      .exec();
                    let findDomainInSponsorAccount = [];
                    findDomainInSponsorAccount.push(findDomainInSponsorAccountForGuest);

                    let contact = await getMemberContactArrEmail(
                      //it will update contact,and return array Of contact
                      mobileNumberEncrypted,
                      filterRequestObj
                    );

                    console.log(
                      'findDomainInSponsorAccount:::::',
                      findDomainInSponsorAccount
                    );
                    let accountType = 'guest';
                    let memberDataObj = {
                      findDomainInSponsorAccount,
                      filterRequestObj,
                      mobileNumberEncrypted,
                      accountType,
                      contact,
                    };
                    let createMemberAndMemberAccount =
                      await newMemberAccountAndMemberCreation(memberDataObj); //this function create member and member Account
                    console.log(
                      'createMemberAndMemberAccount::',
                      createMemberAndMemberAccount
                    );
                    if (createMemberAndMemberAccount) {
                      let response = await responseDataFunction(
                        //this function return structureof response
                        createMemberAndMemberAccount,
                        contact,
                        reqProductId
                      );
                      console.log('response::', response);

                      return res.json(response);
                    }
                  }
                }
          } else if (filterRequestObj.contact.contactType == contactTypeObj.NUMERICCODE) {//***********************Numeric Flow******************/
                let field = contactTypeObj.NUMERICCODE;
                let findDomainInSponsorAccount =await sponsorAccountModel.findsponsorByAuthorizationType(
                    filterRequestObj,
                    contactTypeObj.NUMERICCODE);
                if (findDomainInSponsorAccount.length) {
                          console.log('findSponsorFromDb::', findDomainInSponsorAccount);
                          //1.create member
                          //2.create member Account
                          //3.add entitlement
                          //4.push email and mobile contact in member contact.

                          let contact = await getMemberContactArr(mobileNumberEncrypted,filterRequestObj,field);
                          console.log('contact:::::::::::::::::', contact);
                          let accountType = 'entitled';
                          let memberDataObj = {
                            findDomainInSponsorAccount,
                            filterRequestObj,
                            mobileNumberEncrypted,
                            accountType,
                            contact,
                          };
                          let createMemberAndMemberAccount =await newMemberAccountAndMemberCreation(memberDataObj); //this function create member and member Account
                          if (createMemberAndMemberAccount) {
                                  let response = await responseDataFunction(
                                   createMemberAndMemberAccount,
                                    contact,
                                    reqProductId
                                  );
                                  console.log('response::', response);
                                  return res.json(response);
                          }
                } else {
                        console.log('sponsor not found');
                        let message = 'sponsor not found';
                        let response = commonResponse.responseCb(commonResponse.bodyCb({err: message, code: '605'}));
                        return res.send(response);
                }
          } else if (filterRequestObj.contact.contactType == contactTypeObj.GUEST) {//***********************Guest Flow******************/
            
                  let field = contactTypeObj.GUEST;
                  console.log('config.guestSponsorId', config.guestSponsorId);
                  //store guest data in sponsor colection

                  let findDomainInSponsorAccount = await sponsorAccountModel.find({sponsorId: config.guestSponsorId,})
                    .lean()
                    .exec();
                  console.log('findDomainInSponsorAccount:::::',findDomainInSponsorAccount);

                  //saved in sponsor collection as guest
                  let outputDate = new Date();
                  console.log('outputdate:;', outputDate);

                  //get structure of sponsor accountId
                  let sponsorName = 'GUT';

                  let sponsorId =outputDate.getFullYear() +'' +(outputDate.getMonth() + 1).toString().padStart(2, '0') +
                    '' +(outputDate.getDate() + 1).toString().padStart(2, '0') +
                    '' +
                    (outputDate.getHours() + 1).toString().padStart(2, '0') +
                    '' +
                    (outputDate.getMinutes() + 1).toString().padStart(2, '0') +
                    '' +
                    sponsorName;
                  console.log('sponsorId:', sponsorId);
                  //create sponsor as a guest in sponsor collection..
                  var sponsorObj = await new sponsorModel({sponsorName: filterRequestObj.contact.contact,sponsorType:contactTypeObj.GUEST,sponsorId: sponsorId});
                  console.log('sponsorOb::', sponsorObj);
                  let sponsorModelData = await sponsorObj.save(); //save in db.
                  console.log('sponsorModel::', sponsorModelData);

                  console.log('findDomainInSponsorAccount::', findDomainInSponsorAccount);
                  let contact = await getMemberContactArr(
                    //it will update contact,and return array Of contact
                    mobileNumberEncrypted,
                    filterRequestObj,
                    field
                  );
                  let accountType = contactTypeObj.GUEST;
                  let memberDataObj = {
                    findDomainInSponsorAccount,
                    filterRequestObj,
                    mobileNumberEncrypted,
                    accountType,
                    contact,
                  };
                  let createMemberAndMemberAccount =await newMemberAccountAndMemberCreation(memberDataObj); //this function create member and member Account
                  console.log('createMemberAndMemberAccount::',createMemberAndMemberAccount);
                  if (createMemberAndMemberAccount) {
                        let response = await responseDataFunction(createMemberAndMemberAccount,contact,reqProductId);
                        console.log('response::', response);
                        return res.json(response);
                  }
          } else { //*********************unknown sponsor flow**********************//
            
                  let field =contactTypeObj.UNKNOWN;
                  console.log('config.unknownSponsorId', config.unknownSponsorId);

                  let findDomainInSponsorAccount = await sponsorAccountModel.find({sponsorId: config.unknownSponsorId})
                    .lean()
                    .exec();

                  console.log('findDomainInSponsorAccount::', findDomainInSponsorAccount);
                  let contact = await getMemberContactArr(mobileNumberEncrypted,filterRequestObj,field);
                  let accountType =contactTypeObj.UNKNOWN;
                  let memberDataObj = {
                    findDomainInSponsorAccount,
                    filterRequestObj,
                    mobileNumberEncrypted,
                    accountType,
                    contact,
                  };
                  //create new member account
                  let createMemberAndMemberAccount =await newMemberAccountAndMemberCreation(memberDataObj); //this function create member and member Account
                  console.log('createMemberAndMemberAccount::',createMemberAndMemberAccount);
                  if (createMemberAndMemberAccount) {
                        let response = await responseDataFunction(createMemberAndMemberAccount,contact,reqProductId);
                        console.log('response::', response);

                        return res.json(response);
                  }
            }
  } catch (error) {
          let response = commonResponse.responseCb(
            commonResponse.bodyCb({val: error, code: '601'})
          );
          return res.send(response);
    }
};
//--------------------------------------------------------------------//
//common response for verifyAuthorization api

const responseDataFunction = async (responseDataFromMemberAccount,contact,productId) => {
  console.log("responseDataFunc::",Array.isArray(responseDataFromMemberAccount)?responseDataFromMemberAccount[0].accountId:responseDataFromMemberAccount.accountId)
  try {
        let findEntitlementBasedOnProdctId;
        let accountId=Array.isArray(responseDataFromMemberAccount) ? responseDataFromMemberAccount[0].accountId :responseDataFromMemberAccount.accountId
        let memberId =Array.isArray(responseDataFromMemberAccount)? responseDataFromMemberAccount[0].memberId: responseDataFromMemberAccount.memberId
        let accountType=Array.isArray(responseDataFromMemberAccount) ? responseDataFromMemberAccount[0].accountDetails.accountType:responseDataFromMemberAccount.accountDetails.accountType
        let memberEntitlement=Array.isArray(responseDataFromMemberAccount) ?responseDataFromMemberAccount[0].memberEntitlement :responseDataFromMemberAccount.memberEntitlement
        let memberPageDefault=Array.isArray(responseDataFromMemberAccount)? responseDataFromMemberAccount[0].memberPageDefault: responseDataFromMemberAccount.memberPageDefault
        let accountStatus=Array.isArray(responseDataFromMemberAccount)? responseDataFromMemberAccount[0].accountDetails.accountStatus: responseDataFromMemberAccount.accountDetails.accountStatus
        let name;
        let memberContacts={};
        let accountIdEncrypt=encrypt(accountId)
        let memberIdEncrypt=encrypt(memberId)
        console.log({accountIdEncrypt})
        const token = await tokenGenerationFunc(accountIdEncrypt,memberIdEncrypt);
        console.log("token:::::::::::::",token)
        if (accountType == 'entitled') {
                findEntitlementBasedOnProdctId =memberEntitlement.filter((byId) => {
                return byId.id == productId });
            
        }else {
            findEntitlementBasedOnProdctId =memberEntitlement;
        }
        
        let memberDetails = await memberModel.findOne({memberId: memberId}).lean().exec();
        let mobile=await decrypt(memberDetails.primaryMobileNumber)
        let email=await decrypt(memberDetails.officialEmailId)
        console.log({mobile})
        console.log({email})
        memberContacts.mobile=mobile
        memberContacts.email=email
        console.log({memberDetails})
        console.log({memberContacts})

        if (memberDetails.memberDemographicInfo.name) {
          profileName= memberDetails.memberDemographicInfo.name;
        }

        let data = {
              contactList: contact,
              token: token,
              memberEntitlement: findEntitlementBasedOnProdctId,
              memberPageDefault:memberPageDefault,
              accountStatus:accountStatus,
              accountType:accountType,
              memberId:memberId,
              memberAccount: accountId,
              profileName: name ? name : '',
              contactInfo:memberContacts?memberContacts:''
        };
        console.log('data::::::::::', data);

        let response = commonResponse.responseCb(commonResponse.bodyCb({val: data, code: '200'}));
        return response;
  } catch (error) {
    return new APIError(error, httpStatus.NOT_FOUND);
  }
};

//--------------------------------------------------------------------//

//validate otp function

const validateOtpFunc = async (body) => {
  const verifyContact = {contact: body.contact.contact};
  console.log('verifyContact', verifyContact);

  let otp = body.contact.otp;
  console.log('otp::body', otp);

  try {
    let findContactInDb = await contactModel.findOne(verifyContact);

    console.log('findContact.otpDetails.otp::', findContactInDb.otpDetails.otp);
    if (findContactInDb.otpDetails.otp == otp) {
      let updateOtpAttempt = await contactModel.updateOtpAttempt(
        //update otpAttempt=O
        verifyContact,
        {
          updatedAt: Date.now(),
        }
      );
      console.log('updateOtpAttemptDone::', updateOtpAttempt.isVerified);
      if (updateOtpAttempt) return updateOtpAttempt;
      else
        return new APIError(
          'otpAttemptdone not updated!',
          httpStatus.NOT_FOUND
        );
    } else {
      // let err = new APIError(
      //   "Unable to verify the otp!",
      //   httpStatus.UNAUTHORIZED
      // );
      // return Promise.reject(err);
      return false;
    }
  } catch (error) {
    let err = new APIError(
      'Unable to verify the otp!',
      httpStatus.UNAUTHORIZED
    );
    return Promise.reject(err);
  }
};
//--------------------------------------------------------------------//
//contact  obj model
function contactObjFunc(data) {
  let obj = {
    id: data._id,
    contact: data.contact,
    type: data.contactType,
    isVerified: data.isVerified,
    isAuthorized: data.isAuthorized,
  };
  return obj;
}
//--------------------------------------------------------------------//
//token generartion
const tokenGenerationFunc = (accountId,memberId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let tokenObj = {};
      let token = new JwtToken();
      tokenObj.jwt = token.getJWTToken(accountId, memberId);
      tokenObj.refreshToken = await token.getRefreshToken(accountId, memberId);
      console.log({tokenObj})
      resolve({tokenObj: tokenObj});
    } catch (error) {
      reject(error);
    }
  });
};
//--------------------------------------------------------------------//
function contactInfoFunc(body) {
  //function contactInfoFun start
  let verifyContactInDb = {};
  for (let i in req) {
    verifyContactInDb[req.body['contactType']] = req.body['contact'];
  }

  let contactArr = []; //array of contact

  let obj = {identifiers: verifyContactInDb};
  contactArr.push(obj);
  return contactArr;
}

// function identifierObjFunc(mobile,contactVerified,contactAuth){
//   let finalObj = []; //this will return list of object stored
//   let mobileArr = []; //convert to array

//     mobileArr.push(mobile);

//     for (let i in mobileArr) {
//       //loop start
//       let obj = {
//         identifiers: {
//           officialMobile: mobileArr[i],
//           isVerified: contactVerified,
//           isAuthId: contactAuth
//         },
//       };
//       finalObj.push(obj); //push the obj
//     } //loop
//   return finalObj;
// }
//--------------------------------------------------------------------//

function notificationPreferencesFunc() {
  //function notificationPreferencesFunc start

  let notificationArr = []; //return array

  let smsObj = {notificationChannel:"SMS",isEnabled: true};
  let whatsappObj = {notificationChannel:"Whatsapp",isEnabled: true};
  let emailObj = {notificationChannel:"Email",isEnabled: true};
  let pushNotifiObj = {notificationChannel:"PushNotifications",isEnabled: true};
  notificationArr.push(smsObj, whatsappObj, emailObj,pushNotifiObj);
  return notificationArr;
}
//--------------------------------------------------------------------//
async function newMemberAccountAndMemberCreation({
  findDomainInSponsorAccount,
  filterRequestObj,
  mobileNumberEncrypted,
  accountType,
  contact,
}) {
  try {
    console.log(
      'inside newMemberAccountAndMemberCreation::',
      findDomainInSponsorAccount
    );
    let memberContactInfoObj;
    let officialEmailID;
    if (filterRequestObj.contact.contactType == 'officialEmailID') {
      console.log('inside:::::::::::::::::');
      memberContactInfoObj = [
        {primaryMobileNumber: mobileNumberEncrypted},
        {officialEmailId: filterRequestObj.contact.contact},
      ];
      officialEmailID = filterRequestObj.contact.contact;
      console.log('memberContactInfoObj::', memberContactInfoObj);
      console.log('officialEmailID::', officialEmailID);
    } else if (filterRequestObj.contact.contactType == 'QRCode') {
      memberContactInfoObj = [
        {primaryMobileNumber: mobileNumberEncrypted},
        {QRCode: filterRequestObj.contact.contact},
      ];
    } else if (filterRequestObj.contact.contactType == 'NumericCode') {
      memberContactInfoObj = [
        {primaryMobileNumber: mobileNumberEncrypted},
        {NumericCode: filterRequestObj.contact.contact},
      ];
    } else {
      memberContactInfoObj = [{primaryMobileNumber: mobileNumberEncrypted}];
    }
    let notificationPreferencesObj = await notificationPreferencesFunc(); //notification pref
    console.log('notificationPreferencesObj::', notificationPreferencesObj);
    let memberId = await memberIdUtils(); //unique memberId
    console.log('memberId::', memberId);
    let newMemberCreation = new Member({
      //member obj
      memberId: memberId,
      sponsorId: findDomainInSponsorAccount[0].sponsorId,
      officialEmailId: officialEmailID ? officialEmailID : null,
      primaryMobileNumber: mobileNumberEncrypted,
      memberContacts: contact,
      memberContactInfo: memberContactInfoObj,
      notificationPreferences: notificationPreferencesObj,
    });
    //accountDetails

    console.log('newMemberCreation:::', newMemberCreation);

    let saveMemberDetailsInDb = await newMemberCreation.save();
    console.log('saveMemberDetailsInDb::', saveMemberDetailsInDb);
    console.log(
      'findDomainInSponsorAccount:::::::::',
      findDomainInSponsorAccount
    );
    console.log(
      'findDomainInSponsorAccount:::::::::++++++++++++++++',
      findDomainInSponsorAccount[0].productList
    );

    // console.log("saveMemberDetailsInDb::",findDomainInSponsorAccount[0].productList[0].productEntitlement);

    //if member created
    if (saveMemberDetailsInDb) {
      let accountDetails = {
        accountStatus:
          findDomainInSponsorAccount[0].accountDetails.accountStatus,
        accountType: accountType,
        isActivated: findDomainInSponsorAccount[0].accountDetails.isActivated,
      };
      console.log('accountDetails::', accountDetails);
      let accountAccessId;
      let officialEmailID;
      if (filterRequestObj.contact.contactType == 'officialEmailID') {
        accountAccessId = [
          {officialEmailID: filterRequestObj.contact.contact},
          {primaryMobileNumber: mobileNumberEncrypted},
        ];
        // officialEmailID = filterRequestObj.contact.contact;
      } else if (filterRequestObj.contact.contactType == 'QRCode') {
        accountAccessId = [
          {QRCode: filterRequestObj.contact.contact},
          {primaryMobileNumber: mobileNumberEncrypted},
        ];
      } else if (filterRequestObj.contact.contactType == 'NumericCode') {
        accountAccessId = [
          {NumericCode: filterRequestObj.contact.contact},
          {primaryMobileNumber: mobileNumberEncrypted},
        ];
      } else {
        accountAccessId = [
          {primaryMobileNumber: mobileNumberEncrypted}
        ];
      }
      console.log('accountAccessId:::::', filterRequestObj.contact.contactType);
      console.log('accountAccessId:::::', accountAccessId);
      
      let newMemberAccountCreation = new MemberAccount({
        accountId:await accountUtils(),
        memberId: saveMemberDetailsInDb.memberId,
        sponsorId: saveMemberDetailsInDb.sponsorId,
        officialEmailID: officialEmailID ? officialEmailID : null,
        officialMobileNumber: mobileNumberEncrypted,
        memberContacts: contact,
        accountDetails: accountDetails,
        accountAccessId: accountAccessId,
        //memberEntitlement: findDomainInSponsorAccount[0].productList,
        memberPageDefault:
          findDomainInSponsorAccount[0].productList[0].productEntitlement
            .appPageDefaults,
      });

      newMemberAccountCreation.memberEntitlement.push(
        findDomainInSponsorAccount[0].productList[0]
      );
      let newMemberAccountSavedInDb = await newMemberAccountCreation.save();
      console.log('newMemberAccountCreation::', newMemberAccountCreation);
      if (newMemberAccountSavedInDb) {
        return newMemberAccountSavedInDb;
      } else {
        return false;
      }
    } else {
      return new APIError('member update Failed!!', httpStatus.NOT_FOUND);
    }
  } catch (error) {
    return new APIError(error, httpStatus.NOT_FOUND);
  }
}

//--------------------------------------------------------------------//
function memberAccountAccessIdFunc(verifyContactInDb) {
  //function start

  let accessobj = []; //store the data
  accessobj.push(verifyContactInDb);

  return accessobj;
} //function end
/*decrpt function return decrypted value*/
function decrypt(data) {
  try {
    const algorithm = 'aes-192-cbc';
    const key = crypto.scryptSync('onetoone', 'salt', 24);
    const iv = Buffer.alloc(16, 0);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted =
      decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');

    return decrypted;
  } catch (e) {
    return data;
  }
}
//--------------------------------------------------------------------//

/*encrpt function return encrypted value*/
function encrypt(data) {
  try {
    const algorithm = 'aes-192-cbc';
    const key = crypto.scryptSync('onetoone', 'salt', 24);
    const iv = Buffer.alloc(16, 0);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
    console.log(encrypted);
    return encrypted;
  } catch (e) {
    return data;
  }
}
//--------------------------------------------------------------------//

// refreshToken Api
async function getRefreshToken(req, res, next) {
  let refreshToken = req.query.refreshtoken;
  let refreshJwt = new JwtToken();
  let accIDFromRefreshToken;
  try {
    accIDFromRefreshToken = await refreshJwt.checkRefreshToken(refreshToken);
    console.log('accIDFromRefreshToken-->>>>>>', accIDFromRefreshToken);

    let payload = refreshJwt.decryptRefreshToken(accIDFromRefreshToken);
    console.log('payload--->>>>', payload.accountId);
    

    if (payload == false) {
      
      let response = commonResponse.responseCb(
        commonResponse.bodyCb({
          err: 'Unable to generate token. Unauthorized',
          code: '601',
        })
      );
      return res.json(response);
    }
    let decryptedAccountId=decrypt(payload.accountId)
    MemberAccount.findOne({accountId :decryptedAccountId})
      .then(async (member) => {
        if (member) {
          console.log('memeber:::', member);
          try {
            console.log(
              'try:::from member account',
              member.accountId,
              member.memberId
            );
            let accountId = encrypt(member.accountId);
            let memberId = encrypt(member.memberId);
            let tokenObj = {};
            tokenObj.jwt = refreshJwt.getJWTToken(accountId, memberId);
            console.log('tokenobj::::', tokenObj);
            tokenObj.refreshToken = await refreshJwt.getRefreshToken(
              accountId,
              memberId
            );
            let response = commonResponse.responseCb(
              commonResponse.bodyCb({val: tokenObj, code: '200'})
            );
            return res.json(response);
          } catch (error) {
            let errorShow = {
              message: 'Internal server error, Unable to generate token',
              errorMessage: error,
            };
            let response = commonResponse.responseCb(
              commonResponse.bodyCb({err: errorShow, code: '601'})
            );
            return res.json(response);
          }
        } else {
          let error = 'account id not found';
          let response = commonResponse.responseCb(
            commonResponse.bodyCb({err: error, code: '601'})
          );
          return res.json(response);
        }
      })
      .catch((error) => {
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({err: error, code: '601'})
        );
        return res.json(response);
      });
  } catch (error) {
    let errorShow = {message: 'refresh token not found', errorMessage: error};
    let response = commonResponse.responseCb(
      commonResponse.bodyCb({err: errorShow, code: '601'})
    );
    return res.json(response);
  }
}
//--------------------------------------------------------------------//
//getMemberEntitleMent

async function getMemberEntitleMent(req, res, next) {
  //function start
  let token;
  let userToken = req.cookies.catalogtoken || req.headers.authorization; // accountid token validation
  token = userToken.split(' ')[1];
  let productId = req.body.productId;
  let jwt = new JwtToken();
  if (token) {
    let accountId = await jwt.decryptToken(token);
    console.log('tokenDecryption:::::::::::::', accountId);
    let decryptAccountId=decrypt(accountId)
    if (decryptAccountId) {
      let findAccount = await MemberAccount.findOne({accountId: decryptAccountId});
      // let findAccount = await MemberAccount.findOne({accountId: accountId});
      if (findAccount) {
        let memberData=await memberModel.findOne({memberId:findAccount.memberId})
        let findEntitlementBasedOnProdctId;
        let memberContacts={};
        let updatePageDefaultSession;
        let mobile=await decrypt(memberData.primaryMobileNumber)
        let email=await decrypt(memberData.officialEmailId)
        console.log({mobile})
        console.log({email})
        memberContacts.mobile=mobile
        memberContacts.email=email
        console.log({memberContacts})
        //based on entitled
        if (findAccount.accountDetails.accountType == 'entitled') {
          findEntitlementBasedOnProdctId = findAccount.memberEntitlement.filter(
            (byId) => {
              return byId.id == productId;
            }
          );
          console.log(
            'findEntitlementBasedOnProdctId::',
            findEntitlementBasedOnProdctId
          );
        } else {
          findEntitlementBasedOnProdctId = findAccount.memberEntitlement;
        }

        //code to disable modes on the basic of _counsellingmodemasters
        if(findEntitlementBasedOnProdctId && findEntitlementBasedOnProdctId.length>0){
          let productIndex=findEntitlementBasedOnProdctId.findIndex(x => x.id ===productId)
          console.log({productIndex})
          let modelist=findEntitlementBasedOnProdctId[productIndex].productEntitlement.counselling.modeList         
          let masterModes= mongoose.connection.db.collection('_counsellingmodemasters').find({})
          await masterModes.forEach(doc =>{ 
            if(doc.isEnabled==false)
            {
              let modeIndex=modelist.findIndex(x => x.modesId ===doc.counsellingModesId)
              if(modeIndex>-1)
              {
                modelist[modeIndex].isEnabled=false
              }   
            }                         
          }) 
        }
        //
        
        
        let statusOfBookingPageDefault=findAccount.memberPageDefault.bookingPageDefaults.bookingHomePage
        let pageDefault='upcoming-session'
        // .productEntitlement.appPageDefaults.bookingPageDefaults.bookingHomePage
        console.log({statusOfBookingPageDefault})
        if(statusOfBookingPageDefault==pageDefault){
          try{
                let appointmentRequested=await appointmentModel.find({$and:[{memberAccountId:decryptAccountId},{
                  $or: [
                    { 'appointmentStatus.memberStatus.status': 'Requested' },
                    { 'appointmentStatus.memberStatus.status': 'Confirmed' },
                    

                  ]
                },]}).lean().exec()
                console.log({appointmentRequested})
                let todayEpoch = Date.now()
                let updatePageDefault='no-upcoming-session'
                
                console.log({todayEpoch})
                if(appointmentRequested.length){
                  appointmentRequested.map(async (appointmentVal) => {
                    if(appointmentVal.appointmentStatus.memberStatus.status === 'Requested'|| (appointmentVal.appointmentStatus.memberStatus.status === 'Confirmed' && appointmentVal.appointmentTiming.appointmentEndTime >= todayEpoch)){
                      console.log("if condition:",appointmentVal.appointmentTiming.appointmentEndTime);
                      updatePageDefaultSession=findAccount
                    }else{
                        updatePageDefaultSession=await MemberAccount.findOneAndUpdate({accountId:decryptAccountId},{'memberPageDefault.bookingPageDefaults.bookingHomePage':updatePageDefault},{new:true}).lean().exec() 
                        console.log("else:::::::::::::::::::updatePageDefaultSession",updatePageDefaultSession)
                        let data = {
                          memberEntitlement: findEntitlementBasedOnProdctId,
                          memberPageDefault: updatePageDefaultSession.memberPageDefault,
                          memberId: updatePageDefaultSession.memberId,
                          memberAccount: updatePageDefaultSession.accountId,
                          accountDetails:updatePageDefaultSession.accountDetails,
                          profilename:memberData.memberDemographicInfo.name,
                          memberRiskProfile:memberData.memberRiskProfile,
                          contactInfo:memberContacts,
                          memberDemographicInfo:memberData.memberDemographicInfo
                        };
                        let response = commonResponse.responseCb(commonResponse.bodyCb({val: data, code: '200'}));
                        return res.json(response); 
                       }
                      
                    })
                             
                }
          }catch(error){
                console.log("error in catch block:",error)
                let response = commonResponse.responseCb(
                  commonResponse.bodyCb({err: "Fail to updatePageDefault", code: '601'})
                );
                return res.json(response)
          }

         }

        
        let data = {
          memberEntitlement: findEntitlementBasedOnProdctId,
          memberPageDefault: findAccount.memberPageDefault,
          memberId: findAccount.memberId,
          memberAccount: findAccount.accountId,
          accountDetails:findAccount.accountDetails,
          profilename:memberData.memberDemographicInfo.name,
          memberRiskProfile:memberData.memberRiskProfile,
          contactInfo:memberContacts,
          memberDemographicInfo:memberData.memberDemographicInfo
        };
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({val: data, code: '200'})
        );
        return res.json(response);
      } else {
        let errorShow = {message: 'accountid not exist in memberAccount'};
        let response = commonResponse.responseCb(
          commonResponse.bodyCb({err: errorShow, code: '601'})
        );
        return res.json(response);
      }
    } else {
      let errorShow = {message: 'accountid not exist in token'};
      let response = commonResponse.responseCb(
        commonResponse.bodyCb({err: errorShow, code: '601'})
      );
      return res.json(response);
    }
  } else {
    let errorShow = {message: 'token not found'};
    let response = commonResponse.responseCb(
      commonResponse.bodyCb({err: errorShow, code: '601'})
    );
    return res.json(response);
  }
} //function end

//-----------------------------------------------------------------//

//search sponsor

const getAuthorizationType = async (req, res, next) => {
  try {
    let sponsorAuthorization = await sponsorAccountModel.searchSponsorByName(
      req.params.name
    );

    if (sponsorAuthorization) {
      let response = commonResponse.responseCb(
        commonResponse.bodyCb({val: sponsorAuthorization, code: '200'})
      );
      return res.json(response);
    } else {
      let response = commonResponse.responseCb(
        commonResponse.bodyCb({err: 'sponsor not found', code: '603'})
      );
      return res.json(response);
    }
  } catch (error) {
    let response = commonResponse.responseCb(
      commonResponse.bodyCb({err: error, code: '601'})
    );
    return res.json(response);
  }
};


//--------------------------------------------------------------------//

async function intergatedsystemlogin(req, res, next) {
  const { first_name, password } = req.body;
  try {
    const validateUser = await validateUserFunc(
      { first_name },
      "member_account"
    );
    console.log("validateUser:::::::::::",validateUser)
    await validatePasswordFunc(password, validateUser.password);
    let accountIdEncrypt=encrypt(validateUser.accountId)
    let memberIdEncrypt=encrypt(validateUser.memberId)
    const token = await tokenGenerationFunc(accountIdEncrypt,memberIdEncrypt);
    res.status(httpStatus.OK).json(token);
  } catch (error) {
    next(error);
  }
}
validateUserFunc = (fetchUserDetails, schemaName) => {
  return new Promise(async (resolve, reject) => {
    let user;
    const modelName = mongoose.model(schemaName);
    console.log("fetchUserDetails:::::::::::",fetchUserDetails)
    try {
      user = await modelName.findOne(fetchUserDetails).exec();
      console.log("user::::::::::::::::",user.password)
    } catch (error) {
      reject(error);
    }
    if (user === undefined || user === null) {
      reject(new APIError("No such user exists!", httpStatus.NOT_FOUND));
    } else resolve(user);
  });
};


validatePasswordFunc = (userpassword, Dbpassword) => {
  return new Promise(async (resolve, reject) => {
    let passwordHash = new PasswordHash();
    try {
      const validatedPassword = await passwordHash.validatePassword(
        userpassword,
        Dbpassword
      );
      if (validatedPassword) resolve();
      reject(
        new APIError("Unable to verify the password!", httpStatus.UNAUTHORIZED)
      );
    } catch (error) {
      reject(
        new APIError("Unable to verify the password!", httpStatus.UNAUTHORIZED)
      );
    }
  });
};


/*************check common domain**************************/
async function getDomainEmail(req,res){
  try{
        let emailSplit = req.params.email.split('@');
        email = emailSplit[1];
        let domain=email.split('.')
        data=domain[0]
        
      
        let checkDomainIsExist=await personalEmailDomain.findOne({domain:data}).lean().exec()
        if(checkDomainIsExist){
            return res.json({status:200,result:true})
        }else{
            return res.json({status:200,result:false})
        }
  }catch(error){
    console.log("catch block error:",error)
    return res.json({status:601,err:error})
  }
  
  
  
}  

/*************************** */

module.exports = {
  createMemberAccount,
  verifyContact,
  verifyAuthorization,
  getRefreshToken,
  getAuthorizationType,
  getMemberEntitleMent,
  intergatedsystemlogin,
  getDomainEmail
};
