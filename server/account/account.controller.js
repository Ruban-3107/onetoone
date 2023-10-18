const _account = require("./account.model");
const getMongoDBID = require("../helpers/mongoDBUtils");
const PasswordHash = require("../helpers/PasswordHash");
const JwtToken = require("../helpers/JWTTokenHandler");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");
const crypto = require("crypto");
const { Domain } = require("../helpers/domain.list.enum");
const _integratedSystemAccount = require("./integratedsystemaccount/account.intergatedSystem.model");
const mongoose = require("mongoose");
const _domain = require("../domain/domain.model");
const _employee = require("../employee/employee.model");
const {Setting} = require("../setting/setting.model");
const User = require('../user/user.model');
const _company = require("../company/company.model");
const cr=require("../entity/commonresponse.js")
const config=require("../../config/config")


/**
 * Create new account
 * @property {string} req.body.email - The email of account.
 * @property {Number} req.body.phone - The mobileNumber of account.
 * @property {string} req.body.first_name - The first name of account.
 * @property {string} req.body.last_name - The last name of account.
 * @property {string} req.body.domain - The domain ID to which the account tagged to.
 * @property {string} req.body.employee_code - The employee code of account.
 * @property {string} req.body.email_verified - The status of the email verification .
 * @property {string} req.body.phone_verified - The status of the phone verification .
 * @returns {Account}
 */
async function create(req, res, next) {
  let encryptedEmail = await encrypt(req.body.email)
  let encryptedPhone = await encrypt(req.body.phone)

  const account = new _account({
    email: encryptedEmail || "",
    phone: encryptedPhone,
    domain: getMongoDBID(req.body.domain),
    employee_code: req.body.employee_code,
    created_date: req.body.created_date,
    email_verified: req.body.email_verified,
    phone_verified: req.body.phone_verified,
    entitlement: req.body.entitlement,
    activated: req.body.isActive,
    userName: req.body.userName,
    first_name: req.body.userName,
    cmsData: req.body.cmsData,
    updatedChannel: req.body.source,
    source: req.body.source,
    qr_code: req.body.qr_code,
    accountType: req.body.userAccountType,
    registration_status: "Registered",
    appId: [req.body.appId],
    authenticationType: req.authenticationType
  });
  console.log("function create::::EncryptedPhone,EncryptedPhone...", encryptedEmail, encryptedPhone)
  account
    .save()
    .then(async (savedAccount) => {
      const userData = await addUserFromCms(req.body, savedAccount._id);
      console.log("function create::::response.successfully stored..uuid:", userData._id)
      res.json({ 'uuid': userData._id });
    })
    .catch((e) => next(e));
}

function addUserFromCms(data, id) {
  return new Promise((resolve, reject) => {
    let notifications;
    if (data.appId === 'REACH') {
      notifications = [
        { name: 'PushNotifications', value: true, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/Notifications_eq00ed.svg' },
        { name: 'SMS', value: true, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/SMS_pwtw11.svg' },
        { name: 'WhatsApp', value: false, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/Whatsapp_kg2mev.svg' }
      ];
    }
    else {
      notifications = [
        { name: 'Email', value: true, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/Mail_qmlef1.svg' },
        { name: 'PushNotifications', value: true, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/Notifications_eq00ed.svg' },
        { name: 'SMS', value: true, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/SMS_pwtw11.svg' },
        { name: 'WhatsApp', value: false, image: 'https://res.cloudinary.com/cloud-1to1help/image/upload/v1602153381/Icons%20and%20Images/Whatsapp_kg2mev.svg' }
      ];
    }
    const user = new User({
      account_id: id,
      gender: data.gender,
      notification: notifications,
      language: data.language ? [data.language] : [],
      appId: [data.appId],
      cmsData: true,
      source: "CMS",
      birthdate: data.birthdate,
      updatedChannel: "CMS",
      cmsMemberId: data.memberId,
      first_name: data.firstName,
      last_name: data.last_name,
      location: data.location,
      relationship_status: data.relationship_status
    });
    user
      .save()
      .then((savedUser) => {
        resolve(savedUser);
      })
      .catch((e) => reject(e));
  });
};

/**
 * Generate otp and verify if its new user or existing user in accounts both
 * phone number and email Id is unique in account collection
 * @property {string} req.body._id - objectID of the account.
 * @property {string} req.body.phone - The mobileNumber of user.
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.otpFor - flag that defines whether notification is email otp or mobileNumber otp .
 * @returns {user} json object of the account
 */

async function generateOtp(req, res, next) {
  try {
    const { _id, email, phone } = req.body;
    console.log("email:.......", email)
    console.log("Phone:.......:", phone)
    const phoneEncrypted = await encrypt(phone)
    const emailEncrypted = await encrypt(email)
    req.body.phone = phoneEncrypted;
    req.body.email = emailEncrypted;
    console.log("phoneEncrypted:.......", phoneEncrypted)
    const fetchUserDetails = email ? { 'email': emailEncrypted } : { 'phone': phoneEncrypted };
    console.log("fetchuserdetails:", fetchUserDetails)
    let whitelist = false;
    let otp = await getOTP();
    if (phone) {
      const whitelist = verifyWhitelistNumber(phone.toString());   // this function is used set default phone number otp for testFlight testing when the uploaded on app store
      if (whitelist) otp = '1234';
    }
    let user;
    let savedUser;
    let temp = {};
    temp._id = _id;
    let otpAttemptDone;
    let updatedDate;
    console.log("hr:::1",config.otp_userblock_limit_hr)
    console.log("max limit 5",config.otp_max_limit)
    console.log("otp min",config.otp_limit_min)

    user = await _account.findOne(fetchUserDetails).exec();
    console.log(user)
    if(user){
    if(user.otpAttemptDone== null && user.updatedAt== null ){
      user.otpAttemptDone=0;
      user.updatedAt=Date.now()
      }
    }
    otpAttemptDone=!user ? otpAttemptDone=0 : user.otpAttemptDone
    console.log("otpAttemptDone",otpAttemptDone)
    updatedDate = !user ? updatedDate= Date.now() : user.updatedAt
    console.log("updatedDate",updatedDate)
    
    
    let lastUpdateEpochTime=Math.floor(new Date(updatedDate).getTime() / 1000)  //convert into epochtime 
    
    let nowEpochTime=Math.floor(new Date().getTime() / 1000)     
    
    let nowAndLastUpdateTimeDiffInMin=(nowEpochTime-lastUpdateEpochTime)/60       //convert into minutes
    nowAndLastUpdateTimeDiffInMin=nowAndLastUpdateTimeDiffInMin.toFixed(2)
    
    
    let nowAndLastUpdateTimeDiffInHr=nowAndLastUpdateTimeDiffInMin/60               //convert into hour
    nowAndLastUpdateTimeDiffInHr=nowAndLastUpdateTimeDiffInHr.toFixed(2)
    if(user){
     if((user.otpAttemptDone>=config.otp_max_limit) && (nowAndLastUpdateTimeDiffInMin<config.otp_limit_min)){
      if((nowAndLastUpdateTimeDiffInHr>config.otp_userblock_limit_hr))  {
        
        let updatedAccount=  await _account.updateAccount(user._id,{'updatedAt': Date.now(),'count':0})
        if(updatedAccount){
          await send()
        }
      }
      else{
        
        let result=`Enter More than 5times wrong OTP.You have enter the existed the limited time period,it will reactivate back at 1hr`
        let response=cr.responseCb(

           cr.bodyCb({ err: result,code:"610" })
           )
           res.status(200).json(response);
        
      }
    
      
    }else{
      await send()
    }
    }else{
    await send()
  }
  
  

    async function send(){
      console.log(otpAttemptDone)
      otpAttemptDone=otpAttemptDone +1     //increasing the count
      
    if (phoneEncrypted && !user) savedUser = await saveNewAccount(req.body, otp,otpAttemptDone);
    if (phoneEncrypted && user) savedUser = await updateAccountModel(user, { 'otp': otp, 'otpFor': req.body.otpFor,'otpAttemptDone':otpAttemptDone });
    if (emailEncrypted && !user && _id) savedUser = await updateAccountModel(temp, { 'otp': otp, 'otpFor': req.body.otpFor, 'email': emailEncrypted,'otpAttemptDone':otpAttemptDone });
    if (emailEncrypted && !_id) {
      if (user) savedUser = await updateAccountModel(user, { 'otp': otp, 'otpFor': req.body.otpFor,'otpAttemptDone':otpAttemptDone });
      else{
        //throw new APIError("Email id does not exists!", httpStatus.UNAUTHORIZED);
         let data={activated:"false",message:"otp generated successfully"}
         let response= cr.responseCb(

         cr.bodyCb({ val:data,code: "200" })
         )
        res.status(200).json(response);
        }
    }
    if (emailEncrypted && user && _id) {
      if ((user._id).toString() === _id) {
        savedUser = await updateAccountModel(user, { 'otp': otp, 'otpFor': req.body.otpFor,'otpAttemptDone':otpAttemptDone });
      }
      else {
        throw new APIError(
          "Email id already exists!",
          httpStatus.UNAUTHORIZED
        );
      }
    }
    let data={activated:savedUser.activated,message:"otp generated successfully"}
    let response= cr.responseCb(

       cr.bodyCb({ val:data,code: "200" })
       )
     res.status(200).json(response);
  
    
  }
} catch (error) {
    next(error);
  }
}


/**
 * Used to verify the otp entered by user
 */

async function verifyOtp(req, res, next) {
  const { otp,phone, email } = req.body;
  console.log("function::verifyOTp::")
  console.log("otp:", otp)
  //console.log("_id:", _id)
  console.log("phone:", phone)
  console.log("email:", email)
  const phoneEncrypted = await encrypt(phone)
  const emailEncrypted = await encrypt(email)
  console.log("phoneEncrypted:", phoneEncrypted)
  console.log("emailEncrypted:", emailEncrypted)
  let condition= email ? { 'email': emailEncrypted } : { 'phone': phoneEncrypted };
  const updateCondition = email
    ? { email_verified: true, registration_status: "Email verified" }
    : { phone_verified: true, registration_status: "Mobile verified" };
  _account
    .verifyOtpforAccount(condition, otp, updateCondition)
    .then(async(account) => {
      if (account) {
        if(account.registration_status=="Mobile verified" || account.registration_status=="Email verified"){
          let updatedAccount=  await _account.updateAccount(account._id,{'otpAttemptDone': 0})
          updatedAccount.phone = decrypt(updatedAccount.phone)
          updatedAccount.email = decrypt(updatedAccount.email)
          console.log("function::verifyOTp:::account success:")
          res.status(200).json(updatedAccount);
        }else{
        account.phone = decrypt(account.phone)
        account.email = decrypt(account.email)
        console.log("function::verifyOTp:::account success:")
        
        res.status(200).json(account);
        }
      }
    })
    .catch((e) => next(e));
}

/**
 *
 * Used to save the new user when requested for otp
 */
function saveNewAccount(user, otp,otpAttemptDone) {
  return new Promise((resolve, reject) => {
    const account = new _account({
      phone: user.phone,
      registration_status: "Mobile verification pending",
      created_date: user.created_date,
      activated: false,
      appId: user.appId || ['LEAP'],
      cmsData: user.cmsdata || false,
      otp: otp,
      otpFor: user.otpFor,
      otpAttemptDone:otpAttemptDone
    });
    account
      .save()
      .then((savedAccount) => {
        savedAccount.otp = undefined;
        savedAccount.phone = decrypt(account.phone)
        savedAccount.email = decrypt(account.email)
        resolve(savedAccount);
      })
      .catch((e) => reject(e));
  });
}

/**
 * Used to update account in different steps of registration
 * @argument {object} - account object
 * @argument {object} - object to be updated
 */
function updateAccountModel(account, obj) {
  console.log("function:updateAccountmodel..")
  return new Promise(async (resolve, reject) => {
    const updateStatus = await _account.findById(getMongoDBID(account._id));
    updateStatus.set(obj);
    updateStatus
      .save()
      .then((savedAccount) => {
        savedAccount.otp = undefined;
        savedAccount.phone = decrypt(savedAccount.phone)
        savedAccount.email = decrypt(savedAccount.email)
        console.log("savedUser.phone::::", savedAccount.phone)
        console.log("savedUser.email::::", savedAccount.email)
        console.log("function:updateAccountmodel..savedAccount:", savedAccount)
        resolve(savedAccount);
      })
      .catch((e) => reject(e));
  });
}

async function updateDataFromCms(req, res, next) {
  console.log("req::", req.body)
  try {
    let id = req.body.uuid
    let userData = await User.getUserDataById(id)     //based on user id get data from database
    console.log("before:::userData:::::::::::::::::::::::", userData)
    if (userData) {
      console.log("userData::::", userData.account_id)    //if user is there updated data

      let updateAccount = await _account.updateAccount(userData.account_id, { 'activated': req.body.activated, 'phone_verified': req.body.phone_verified, 'email_verified': req.body.email_verified })
      if (updateAccount) {            //after successfull updated sending response
        console.log("updateAccount:::", updateAccount);

        let result = { result: `Account updated successfully`, uuid: userData._id }
        let response = cr.responseCb(

          cr.bodyCb({ val: result, code: "200" })
        )
        res.status(200).json(response);


      } else {
        let result = `Account not updated`
        let response = cr.responseCb(

          cr.bodyCb({ err: result, code: "610" })
        )
        res.status(200).json(response);


      }
    }
    else {
      let result = `user not found`
      let response = cr.responseCb(

        cr.bodyCb({ err: result, code: "610" })
      )
      res.status(200).json(response);

    }
  } catch (e) {
    let result = "Failed";
    let response = cr.responseCb(

      cr.bodyCb({ err: result, code: "610" })
    )
    res.status(200).json(response);

  }


}


/**
 * Used to verify ,activate and complete the registration of the user
 * @property {string} req.body._id - MongoId  of Account.
 * @returns {TokenObject}
 */
async function activateAccount(req, res, next) {
  try {
    console.log("function activateAccount:::::", req.body)
    const accountDetails = await _account.get(req.body._id);
    if (accountDetails.accountType)
      type = accountDetails.accountType;
    const validation = validateAccountActivation(accountDetails);
    if (validation === true) {
      const obj = {
        activated: true,
        registration_status: "Registered"
      };
      const activationStatus = await updateAccountModel(req.body, obj);
      const token = await tokenGenerationFunc(activationStatus);
      console.log("token:::::",token)
      res
        .status(httpStatus.OK)
        .json({ account: activationStatus, token: token });
    } else
      throw new APIError(
        "Authentication verification error!",
        httpStatus.UNAUTHORIZED
      );
  } catch (error) {
    next(error);
  }
}

/**
 * Used for verifying the otp to login in with email or phone number
 * Returns JWT and refreshtoken once verified
 * @property {string} req.body.email - email  of user.
 * @property {string} req.body.phone - phone Number  of user.
 * @property {string} req.body.otp - otp entered by user.
 * @returns {TokenObject}
 */
async function loginOtp(req, res, next) {
  const { email, phone, otp } = req.body;
  console.log("loginOtp:email:", email)
  console.log("loginOtp:phone:", phone)
  console.log("loginOtp:otp:", otp)
  const phoneEncrypted = await encrypt(phone)
  const emailEncrypted = await encrypt(email)

  const fetchUserDetails = email ? { 'email': emailEncrypted } : { 'phone': phoneEncrypted };
  let user;
  console.log("function:loginOtp::fetchuser:", fetchUserDetails)

  try {
    const validateUser = await validateUserFunc(fetchUserDetails, "_account");
    console.log("function::loginOtp::validaetUser._doc::::", validateUser._doc)
    await validateOtpFunc(validateUser._doc, otp);
    validateActivationFunc(validateUser._doc);
    const token = await tokenGenerationFunc(validateUser._doc);
    console.log("token::::",token)
    validateUser._doc.phone = decrypt(validateUser._doc.phone)
    validateUser._doc.email = decrypt(validateUser._doc.email)
    console.log("validateUser._doc.phone::::", validateUser._doc.phone)
    console.log("validateUser._doc.email::::", validateUser._doc.email)
    res
      .status(httpStatus.OK)
      .json({ account: validateUser._doc, token: token });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

/**
 * Used by CMS to get JWT and refreshtoken
 * Returns JWT and refreshtoken once verified
 * @property {string} req.body.first_name - first_name of user.   // should be moved integrated system collection
 * @property {string} req.body.password - password of user.
 * @returns {TokenObject}
 */
async function intergatedsystemlogin(req, res, next) {
  const { first_name, password } = req.body;
  try {
    const validateUser = await validateUserFunc(
      { first_name },
      "_account"
    );
    await validatePasswordFunc(password, validateUser.password);
    const token = await tokenGenerationFunc(validateUser);
    res.status(httpStatus.OK).json(token);
  } catch (error) {
    next(error);
  }
}


/**
 * Validates the user
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.email - The phone of user.
 * @property {string} req.body.password - The password of user.
 * @returns {TokenObject}
 */
async function login(req, res, next) {   // not used to be removed after testing
  const { email, phone, password } = req.body;
  const fetchUserDetails = email ? { email } : { phone };
  try {
    const validateUser = await validateUserFunc(fetchUserDetails, "_account");
    await validatePasswordFunc(password, validateUser.password);
    validateActivationFunc(validateUser);
    const token = await tokenGenerationFunc(validateUser);
    res.status(httpStatus.OK).json({ account: validateUser._doc, token: token });
  } catch (error) {
    next(error);
  }
}

async function loginVerify(req, res, next) {  
  try {
    const { email, phone } = req.body;

    console.log("function:loginVerify:email", email)
    console.log("function:loginVerify:email", phone)
    let encryptedPhone = await encrypt(phone)
    let encryptedEmail = await encrypt(email)
    req.body.phone = encryptedPhone
    req.body.email = encryptedEmail
    const fetchUserDetails = email ? { 'email': encryptedEmail } : { 'phone': encryptedPhone };
    let user;
    let savedUser;
    
    user = await _account.findOne(fetchUserDetails).exec();
    
     if (phone && !user) {
            // savedUser = await saveNewAccount(req.body, null);
            //savedUser = [];
            //let response={savedUser}
            //res.send(response)
             let result=`error`
            let response=cr.responseCb(
    
               cr.bodyCb({ err: result,code:"601" })
               )
               res.json(response);
            
          }

          if (phone && user) {
            savedUser = user;
            let data={activated:savedUser.activated,message:"otp generated successfully"}
            let response=cr.responseCb(
    
              cr.bodyCb({ val: data,code:"200" })
              )
              res.status(200).json(response);
          
          }
          if (email && !user) {
          savedUser = [];
          //let data={savedUser}
          let result=`error`
          let response=cr.responseCb(
           
              cr.bodyCb({ err: result,code:"601" })
              )
              res.json(response);
        }
          if (email && user) {
            savedUser = user;
            let data={activated:savedUser.activated,message:"otp generated successfully"}
            // res.json(savedUser);
            let response=cr.responseCb(
    
              cr.bodyCb({ val: data,code:"200" })
              )
              res.status(200).json(response);
          }
    
  } catch (error) {
    next(error);
  }
}

/**
 * Used to generate 4 digit otp
 */

const getOTP = () =>
  new Promise((res) =>
    // crypto.randomBytes(size[, callback])
    crypto.randomBytes(4, (err, buffer) => {
      res(parseInt(buffer.toString("hex"), 16).toString().substr(0, 4));
    })
  );

/**
 * update domain or first_name or registration_status or accountType or qr_code of an account
 * @property {string} req.body.domain - domain mongoId .
 * @property {string} req.body.first_name - The first_name of user.
 * @property {string} req.body.registration_status - The registration_status of user.
 * @property {string} req.body.accountType - The accountType of user.
 * @property {string} req.body.qr_code - The qr_code of used by user.
 * @returns {Account}
 */

async function updateRegisterAccount(req, res, next) {
  const { domain, first_name, _id, registration_status, accountType, qr_code } = req.body;
  if ((domain || first_name || registration_status || accountType || qr_code) && _id) {
    _account
      .updateAccount(_id, req.body)
      .then((account) => {
        return res.json(account);
      })
      .catch((e) => next(e));
  }
}

async function updateAccount(req, res, next) {   // not used to be removed after testing
  if (req.body.password) {
    try {
      let passwordHash = new PasswordHash();
      hashpwd = await passwordHash.hashPassword(req.body.password);
      req.body.password = hashpwd;
    } catch (error) {
      console.log("Error hashing password for user", req.body._id);
      next(error);
    }
  }
  try {
    let savedAccount = await updateAccountModel(req.body, req.body)
    res.json(savedAccount)
  } catch (error) {
    next(error)
  }
}

function verifyCompany(req,res,next){
  const {company, domain_id} = req.body;
  console.log("company:: ",company);
  console.log("domain_id:: ",domain_id);

  let condition;
  if(company){
    condition = {$and: [{'company': company},{'domain_id': domain_id}]}
  }
  if(req.body.company){
    _company
    .verifyCompany(condition)
    .then((domain) => {
      console.log(domain + " Domain in if condition");
      return res.json(domain); // eslint-disable-line no-param-reassign
      return next();
    })
    .catch((e) => next(e));
  }
}

function verifyAuthType(req, res, next) { //******** */ added for company ******************
  const { domain, employee_code, qr_code, email, phone, domain_id } = req.body;
  console.log("function:verifyAuthtype")
  console.log("domain:", domain)
  console.log("employee_code:", employee_code)
  console.log("email:",email)
  console.log("phone:", phone)
  console.log("domain_id:", domain_id)

  let condition;
  if (domain_id) {
    console.log("In this condition domain_id");
    condition = { 'domain_id': domain_id };
  }
  if (qr_code)
    condition = { $and: [{ '_id': domain }, { 'qr_code': qr_code }] };
  console.log(JSON.stringify(condition) + " => condition => qr_code");
  if (employee_code)
    console.log(employee_code + " =>employee_code");
  condition = { $and: [{ 'domain': domain }, { 'employee_code': employee_code }] };
  console.log(JSON.stringify(condition) + " => condition => employee_code");
  if (email)
    condition = { $and: [{ 'domain': domain }, { 'email': email }] };
  if (req.body.qr_code) {
    _domain
      .verifyDomain(condition)
      .then((domain) => {
        console.log(domain + " Domain in if condition");
        return res.json(domain); // eslint-disable-line no-param-reassign
        return next();
      })
      .catch((e) => next(e));

  }
  if (req.body.domain_id) {
    if (condition) {
      _domain
      .findById(condition.domain_id)
      .then((domain)=>{
        if(domain){
        console.log("domain=====>",domain);
        return res.json(domain);
        }else{
          console.log("No such domain exists");
          return res.json("No such domain exists");
        }
      }).catch((err)=>{
        console.log("Error in catch block", err);
        next(err);
      })
    }
    else {
      console.log("Condition not satisfied")
    }
  } 
  else {
    _employee
      .verifyEmployee(condition)
      .then((account) => {
        console.log("account--employee:", account, "condition=> ", condition)
        return res.json(account);
        return next();
      })
      .catch((e) => {
        console.log(e + " error in catch block #####");
        next(e)
      });

  }
}

/**
 * verify and validate the domain
 * @param {string} req.params.domain - domain .
 * @returns {Domain}
 */

async function getDomain(req, res, next, id) {
  console.log("getDomain function::::id:", id)

  const splitId = id.split('@');
  const domain = splitId[1];
  const email = id;
  console.log("after split:", domain)
  try {
    let data = await _domain.verifyDomain({ domain: { $in: [domain] } })
    if (!data.length) {

      let employee = await _employee.findOne({ 'email': email })
      if (employee) {
        let domainId = employee.domain;
        console.log("domainId", domainId);
        let domainData = await _domain.verifyDomain({ _id: domainId })
        req.domain = domainData
        return next()
      } else {
        let data = "Error_001"

        req.domain = data
        return next();

      }
    }
    else {
      req.domain = data
      return next();
    }
  } catch (error) {
    next(error)
  }
}

function get(req, res) {
  console.log("function get,req.domain:", req.domain)
  return res.json(req.domain);
}

/**
 * list of domain
 * @returns {Domain[]}
 */
function listDomain(req, res, next) {
  _domain
    .list()
    .then((domain) => {
      console.log("function:listdomain:", domain)
      return res.json(domain);
    })
    .catch((e) => next(e));
}

function listCompany(req, res, next) {
  _company
    .list()
    .then((company) => {
      console.log("function:listcompany:", company)
      return res.json(company);
    })
    .catch((e) => next(e));
}

/**
 * create of domain for company name entered by guest user
 * @returns {Domain}
 */
function createDomain(req, res, next) {
  const domain = new _domain({
    company_name: req.body.company_name,
    appId: req.body.appId
  });
  domain.save()
    .then(savedDomain => res.json(savedDomain))
    .catch(e => next(e));
}

/**
 * search domain by company name
 * @param {String} req.params.name - company name of the domain
 * @returns {Domain[]}
 */
function searchDomain(req, res, next) {
  _domain
    .searchDomainByName(req.params.name)
    .then((domain) => {
      return res.json(domain);
    })
    .catch((e) => next(e));
}

/**
 * Get account list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {Account[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  _account
    .list({ limit, skip })
    .then((accounts) => res.json(accounts))
    .catch((e) => next(e));
}

validateAccountActivation = (account) => {
  let condition =
    account.phone_verified === true && account.domain && account.first_name;
  if (account.accountType) {
    if (account.accountType == 'registered_user') {
      condition = account.phone_verified === true && account.domain;
      if (account.email)
        condition = account.phone_verified === true &&
          account.domain &&
          account.email_verified === true;
      else
        condition = account.phone_verified === true &&
          account.domain &&
          account.employee_code || account.qr_code;
    }
    if (account.accountType == 'guest_user')
      condition = account.phone_verified === true &&
        account.domain && !account.email
    if (account.accountType == 'verified_user')
      condition = account.phone_verified === true &&
        !account.domain && !account.email
  }

  if (condition) return true;
  else return false;
};

validateUserFunc = (fetchUserDetails, schemaName) => {
  return new Promise(async (resolve, reject) => {
    let user;
    const modelName = mongoose.model(schemaName);
    try {
      user = await modelName.findOne(fetchUserDetails).exec();
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

validateActivationFunc = (validateduser) => {
  if (
    (validateduser.email_verified === true ||
      validateduser.phone_verified === true) &&
    validateduser.activated === true
  )
    return;
  else if (
    (validateduser.email_verified === true ||
      validateduser.phone_verified === true) &&
    validateduser.entitlement === true
  )
    return;
  else
    throw new APIError(
      "Authentication verification error!",
      httpStatus.UNAUTHORIZED
    );
};

validateOtpFunc = (userDetails, otp) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (userDetails.otp === otp) {
      let updatedAccount=await _account.updateAccount(userDetails._id,{'otpAttemptDone': 0})
      resolve()};
      reject(
        new APIError("Unable to verify the otp!", httpStatus.UNAUTHORIZED)
      );
    } catch (error) {
      reject(
        new APIError("Unable to verify the otp!", httpStatus.UNAUTHORIZED)
      );
    }
  });
};

tokenGenerationFunc = (validateduser) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user_id = validateduser._id.toString();
      const uuid = await User.getUserId(validateduser._id)
      let tokenObj = {};
      let token = new JwtToken();
      tokenObj.jwt = token.getJWTToken(user_id, uuid);
      tokenObj.refreshToken = await token.getRefreshToken(user_id);
      resolve({ user: user_id, tokenObj: tokenObj });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * It will get the new refresh token along with the access token
 * @param req
 * @param res
 * @returns {*}
 */
async function getrefreshtoken(req, res, next) {
  let refreshToken = req.query.refreshtoken;
  let refreshJwt = new JwtToken();
  let accIDFromRefreshToken;
  try {
    accIDFromRefreshToken = await refreshJwt.checkRefreshToken(refreshToken);
    console.log('accIDFromRefreshToken-->>>>>>', accIDFromRefreshToken)


    let payload = refreshJwt.decryptRefreshToken(accIDFromRefreshToken);
    console.log('payload--->>>>', payload);

    if (!payload) {
      const err = new APIError(
        "Unable to generate token. Unauthorized",
        httpStatus.UNAUTHORIZED,
        true
      );
      next(err);
    }
    _account
      .findById(payload.user)
      .then(async (user) => {
        if (user) {
          try {
          const uuid = await User.getUserId(user._id)      //need to add by ruban
          console.log("uuid:::", uuid);
            let tokenObj = {};
            tokenObj.jwt = refreshJwt.getJWTToken(user._id,uuid);
            tokenObj.refreshToken = await refreshJwt.getRefreshToken(user._id);
            res.status(httpStatus.OK).json(tokenObj)
          } catch (error) {
            const err = new APIError(
              "Internal server error, Unable to generate token",
              httpStatus.INTERNAL_SERVER_ERROR,
              true
            );
            next(err);
          }
        }
        else {
          console.log("else of not user");
          const err = new APIError(
            "No such account Id exists!",
            httpStatus.UNAUTHORIZED
          );
          next(err);
        }
      })
      .catch((e) => next(e));
  } catch (error) {
    console.error("Error when fetching the refresh token " + error)
    next(error)
  }
}

const verifyWhitelistNumber = (phone) => {
  const number = ['9986104825']
  return number.includes(phone)
}

function getCarousel(req, res, next) { // to be removed after testing
  Setting
    .getCarousel()
    .then((carousel) => {
      return res.json(carousel);
    })
    .catch((e) => next(e));
}

function getLeapLoginVideo(req, res, next) { // to be removed after testing
  Setting
    .getLeapLoginVideo()
    .then((settingsDetail) => {
      return res.json(settingsDetail);
    })
    .catch((e) => next(e));
}
function encrypt(data) {
  try {
    
    const algorithm = "aes-192-cbc";
    const key = crypto.scryptSync('onetoone', 'salt', 24);
    const iv = Buffer.alloc(16, 0);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypt = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
    console.log("function:encrypt:", encrypt)
    return encrypt
  } catch (e) {
    return data;
  }
}


function decrypt(data) {
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





module.exports = {
  login,
  create,
  list,
  generateOtp,
  updateAccount,
  updateRegisterAccount,
  loginOtp,
  intergatedsystemlogin,
  verifyOtp,
  activateAccount,
  getDomain,
  get,
  getrefreshtoken,
  listDomain,
  createDomain,
  verifyAuthType,
  loginVerify,
  getCarousel,
  searchDomain,
  getLeapLoginVideo,
  verifyCompany,
  listCompany,
  updateDataFromCms
};
