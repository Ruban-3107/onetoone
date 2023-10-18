const Promise = require("bluebird");
const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");
const Schema = mongoose.Schema;
const idvalidator = require("mongoose-id-validator");
const { response } = require("express");

/**
 * Domain Schema
 */
const SponsorAccountSchema = new mongoose.Schema({
  sponsorAccountId: {
    type: String,
  },
  sponsorId: {
    type: String,
  },
  sponsorName: { type: String },
  memberCount: {
    type: String,
  },
  appPageDefaults: {
    showProfileBuilding: { type: Boolean },
    showWelcomeVideo: { type: Boolean },
    homepage: { type: String },
    showLabelFeelings: { type: Boolean },
  },
  accountDetails: {
    accountStatus: { type: String },
    accountType: { type: String },
    isActivated: {
      type: String,
      default: false,
    },
  },
  accountActivationDetails: {
    activationChannel: { type: String },
    activationDate: {
      type: Date,
      default: Date.now,
    },
  },
  productList: [
    {
      name: { type: String },
      id: { type: String },
      productEntitlement: {
        channelList: [
          {
            channelId: { type: String },
            channelName: { type: String },
            isEnabled: { type: Boolean },
          },
        ],
        content: {
          isEnabled: { type: Boolean },
          contentTypeList: [
            {
              contentTypeId: { type: String },
              contentType: { type: String },
              contentCategory: { type: String },
              levelEnabled: { type: String },
            },
          ],
        },
        assessments: {
          isEnabled: { type: Boolean },
          assessmentTypeList: [
            {
              assessmentTypeId: { type: String },
              assessmentType: { type: String },
              assessmentCategory: { type: String },
              levelEnabled: { type: String },
            },
          ],
        },
        counselling: {
          isEnabled: { type: Boolean },
          modeList: [
            {
              modesId: { type: String },
              modesName: { type: String },
              isEnabled: { type: Boolean },
              frontEndImages: {
                image: { type: String },
                selected_img: { type: String },
                session_img: { type: String },
              },
            },
          ],
          counsellingCategoriesList: [
            {
              id: { type: String },
              value: { type: String },
              isEnabled: { type: Boolean },
              sessionPerIssue: { type: String },
              sessionDuration: { type: String },
            },
          ],
          concernContextCategoryList: {
            concernContextCategory: [
              {
                mainDisplayOder: { type: String },
                displayName: { type: String },
                concernsList: [
                  {
                    concernId: { type: String },
                    displayOrder: { type: String },
                    concernDisplayCategory: { type: String },
                    isCouple: { type: Boolean },
                    sessionsPerIssue: { type: Number },
                    sessionDuration: [],
                    concernText: {
                      name: { type: String },
                      img: { type: String },
                    },
                    contexts: [
                      {
                        contextId: { type: String },
                        contextName: { type: String },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          totalSessionsIncluded: {
            numberofSessions: { type: String },
          },
          additionalSessions: {
            isEnabled: { type: Boolean },
            paidBy: { type: String },
          },
        },
        launches: {
          launchList: [
            {
              launchTypeId: { type: String },
              number: { type: String },
              typeName: { type: String },
              isEnabled: { type: Boolean },
            },
          ],
          launchCollateralList: [
            {
              launchCollateralType: { type: String },
              number: { type: String },
              typeName: { type: String },
              isEnabled: { type: Boolean },
            },
          ],
        },
        dependents: {
          number: { type: String },
          dependentType: [
            {
              dependentId: { type: String },
              dependentName: { type: String },
              isEnabled: { type: Boolean },
            },
          ],
        },
        groupTherapyList: {
          overallLimit: { type: String },
          groupTherapy: [
            {
              sessionId: { type: String },
              sessionType: { type: String },
              numberIncluded: { type: String },
              listPrice: {
                amount: { type: String },
                denomination: { type: String },
              },
              isEnabled: { type: String },
            },
          ],
        },
        sponsorAuthorization: {
          domain: [],
          authorizationTypeEnabled: [
            {
              authorizationTypeId: { type: String },
              authorizationType: { type: String },
              value: { type: String },
              isEnabled: { type: Boolean },
            },
          ],
        },
      },
    },
  ],
});
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

// SponsorAccountSchema.plugin(idvalidator);

/**
 * Methods
 */
SponsorAccountSchema.method({});

/**
 * Statics
 */
SponsorAccountSchema.statics = {
  /**
   * Get domain
   * @param {ObjectId} params.domainID - The objectId of domain.
   * @param {string} params.type - The appId of the domain.
   * @returns {Promise<Domain, APIError>}
   */
  get(params) {
    let query = {};
    if (params.type) {
      query = {
        $and: [{ _id: params.domainID }, { appId: { $in: params.type } }],
      };
    } else {
      query = {
        $and: [
          { _id: params },
          {
            $or: [{ appId: { $exists: false } }, { appId: { $nin: ["LEAP"] } }],
          },
        ],
      };
    }
    return this.find(query)
      .populate({
        path: "booking_type",
        match: {
          status: true,
        },
      })
      .then((domain) => {
        if (domain) {
          return domain;
        }
        const err = new APIError(
          "No such domain exists!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * Get domain
   * @param {ObjectId} id - The objectId of domain.
   * @returns {Promise<Domain, APIError>}
   */

  getDomainById(id) {
    return this.findById(id)
      .populate({
        path: "booking_type",
        match: {
          status: true,
        },
      })
      .then((domain) => {
        if (domain) {
          return domain;
        }
        const err = new APIError(
          "No such domain exists!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * List Domains
   * @param {number} skip - Number of Domains to be skipped.
   * @param {number} limit - Limit number of Domains to be returned.
   * @returns {Promise<Domains[]>}
   */

  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .populate("booking_type")
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  insertmanyData(data) {
    return this.insertMany(data).then((savedDomain) => {
      if (savedDomain) return savedDomain;
      const err = new APIError(
        "No Domain added in product table!",
        httpStatus.NOT_FOUND
      );
      return Promise.reject(err);
    });
  },
  updateDomainData(condition, dataObj, options) {
    console.log("condition::", condition);
    return this.findOneAndUpdate(condition, dataObj, options)
      .exec()
      .then((response) => {
        if (response) {
          return response;
        }
        const err = new APIError(
          "No domain update failed!",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },
  //   async findsponsorByAuthorizationType(obj,authorizationType) {
  //     console.log(obj.contact.contact,obj.contact.productId,authorizationType,"inside findsponsor");
  //     let findDomainInSponsorAccount = await this.find(
  //     { },{'productList': {
  //       '$elemMatch': {
  //         'id':obj.contact.productId,
  //         "productEntitlement.sponsorAuthorization.authorizationTypeEnabled.value":obj.contact.contact,
  //         'productEntitlement.sponsorAuthorization.authorizationTypeEnabled.authorizationType':authorizationType,
  //         'productEntitlement.sponsorAuthorization.authorizationTypeEnabled.isEnabled': true
  //       }
  //     },'appPageDefaults':1,'accountDetails':1,'sponsorId':1,'_id':0

  //     }).lean().exec()

  //     // let findDomainInSponsorAccount = await
  //     // this.find({
  //     //     productList: {
  //     //       $elemMatch: {
  //     //         id: obj.contact.productId,
  //     //         "productEntitlement.sponsorAuthorization.authorizationTypeEnabled.authorizationType":
  //     //         authorizationType,
  //     //           "productEntitlement.sponsorAuthorization.authorizationTypeEnabled.value":
  //     //           obj.contact.contact,
  //     //         "productEntitlement.sponsorAuthorization.authorizationTypeEnabled.isEnabled":true
  //     //       },
  //     //     },
  //     //   })
  //     //   .lean()
  //     //   .exec();
  //     //   console.log("findDomainInSponsorAccount::",findDomainInSponsorAccount.length)
  //     console.log("findDomainInSponsorAccount::",findDomainInSponsorAccount);
  //       if(findDomainInSponsorAccount[0].productList) {
  //           console.log("true");
  //           return findDomainInSponsorAccount
  //         }
  //       else {
  //           return false;
  //         };

  //   },

  // findsponsorByAuthorizationType(obj,authorizationType){
  //   console.log("here",obj,authorizationType);
  //  return this.aggregate([
  //    {
  //      '$unwind': {
  //        'path': '$productList',
  //        'includeArrayIndex': 'string',
  //        'preserveNullAndEmptyArrays': true
  //      }
  //    }, {
  //      '$match': {
  //        'productList.id': obj.contact.productId
  //      }
  //    },{
  //        '$match':{
  //           "productList.productEntitlement.sponsorAuthorization.authorizationTypeEnabled.value":obj.contact.contact,

  //            "productList.productEntitlement.sponsorAuthorization.authorizationTypeEnabled.authorizationType":
  //            authorizationType,
  //            "productList.productEntitlement.sponsorAuthorization.authorizationTypeEnabled.isEnabled": true,
  //        }
  //    }
  //   ]).then((findDomainInSponsorAccount=>{
  //       console.log(findDomainInSponsorAccount);
  //       if(findDomainInSponsorAccount.length) {
  //           console.log("true");
  //           return findDomainInSponsorAccount
  //         }
  //       else {
  //           return false;
  //         };

  //   })).catch((e=>{
  //       console.log(e);
  //   }))
  async findsponsorByAuthorizationType(obj, authorizationType) {
    try {
      let findDomainInSponsorAccount = await this.find(
        {
          $and: [
            {
              "productList.productEntitlement.sponsorAuthorization.authorizationTypeEnabled.value":
                obj.contact.contact,
            },
          ],
        },
        {
          productList: {
            $elemMatch: {
              id: obj.contact.productId,
              "productEntitlement.sponsorAuthorization.authorizationTypeEnabled.authorizationType":
                authorizationType,
              "productEntitlement.sponsorAuthorization.authorizationTypeEnabled.isEnabled": true,
            },
          },
          appPageDefaults: 1,
          accountDetails: 1,
          sponsorId: 1,
          _id: 0,
        }
      )
        .lean()
        .exec();
      console.log("findDomainInSponsorAccount::", findDomainInSponsorAccount);

      return findDomainInSponsorAccount;
    } catch (error) {
      return new APIError(error, httpStatus.NOT_FOUND);
    }
  },

  async findSponsor({ reqProductId, domain }) {
    try {
      console.log("reqProductId,domain", reqProductId, domain);
      let findDomainInSponsorAccount = await this.find(
        {
          "productList.productEntitlement.sponsorAuthorization.domain": domain,
        },
        {
          productList: {
            $elemMatch: {
              id: reqProductId,

              "productEntitlement.sponsorAuthorization.authorizationTypeEnabled.authorizationType":
                "officialEmailID",
              "productEntitlement.sponsorAuthorization.authorizationTypeEnabled.isEnabled": true,
            },
          },
          appPageDefaults: 1,
          accountDetails: 1,
          sponsorId: 1,
          _id: 0,
        }
      )
        .lean()
        .exec();
      console.log(
        " findDomainInSponsorAccoun:::::::::",
        findDomainInSponsorAccount
      );

      return findDomainInSponsorAccount;
    } catch (error) {
      return new APIError(error,httpStatus.NOT_FOUND)
    }
  },

  //  },

  // findSponsor({reqProductId,domain}){
  //        console.log("here",reqProductId,domain);
  //       return this.aggregate([
  //         {
  //           '$unwind': {
  //             'path': '$productList',
  //             'includeArrayIndex': 'string',
  //             'preserveNullAndEmptyArrays': true
  //           }
  //         }, {
  //           '$match': {
  //             'productList.id': reqProductId
  //           }
  //         }, {
  //           '$match': {
  //             'productList.productEntitlement.sponsorAuthorization.domain': domain,
  //           },
  //         },{
  //             '$match':{
  //                 "productList.productEntitlement.sponsorAuthorization.authorizationTypeEnabled.authorizationType":
  //                 "officialEmailID",
  //                 "productList.productEntitlement.sponsorAuthorization.authorizationTypeEnabled.isEnabled": true,
  //             }
  //         }
  //        ]).then((data=>{
  //            console.log(data);
  //           return  data
  //        })).catch((e=>{
  //            console.log(e);
  //        }))

  //       },

  async searchSponsorByName(name) {
    let obj = {};
    let authorizationObj = {};
    let sponsorAuthorization;
    let domain;
    //{ $regex: name, $options: "i" }
    console.log("searchDomainByName called:", name);
    return this.find({ sponsorName: name })
      .lean()
      .exec()
      .then((sponsor) => {
        if (sponsor && sponsor.length) {
          domain =
            sponsor[0].productList[0].productEntitlement.sponsorAuthorization
              .domain;
          if (domain.length) {
            obj = { officialEmailID: true };
            sponsorAuthorization =
              sponsor[0].productList[0].productEntitlement.sponsorAuthorization
                .authorizationTypeEnabled;
            sponsorAuthorization.map(({ authorizationType, isEnabled }) => {
              authorizationObj[authorizationType] = isEnabled;
            });
            let newObj = { ...authorizationObj, ...obj };

            return newObj;
          }
          console.log("sponsor:::"),
            (response =
              sponsor[0].productList[0].productEntitlement.sponsorAuthorization
                .authorizationTypeEnabled);

          if(response) {
            return response;
          }else return false;
        }
      })
      .catch((error) => {
        console.log("error:", error);
        return new APIError(error,httpStatus.NOT_FOUND)
      });
  },
};

// /**
//  * @typedef Domain
//  */
module.exports = mongoose.model("sponsor_account", SponsorAccountSchema);
