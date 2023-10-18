const mongoose = require("mongoose");
const APIError = require("../helpers/APIError");
const httpStatus = require("http-status");
const memberDataToCMS =require('./memberAccount.sendToCms')

const MemberAccountSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      trim: true
    },
    first_name: {
      type: String
    },
    memberId: {
      type: String,
      required: true,
      unique: true,
    },
    sponsorId: {
      type: String,
      required:true
    },
    accountAccessId: [{type:Object}],
    memberContacts: [
      {
        contact: {
          isAuthorized: { type: Boolean, default: false },
          isVerified: { type: Boolean, default: false },
          type: { type: String },
          contact: { type: String },
          id: { type: mongoose.Schema.Types.ObjectId, ref: "contacts" },
        },
      },
    ],

    accountDetails: {
      accountStatus: { type: String, default: "created" },
      accountType: { type: String, default: "notset" },
      isActivated: { type: Boolean, default: false },
    },

     memberEntitlement: [
      {
        name: { type: String },
        id: { type: String },
        accountActivationDetails:
        {
            activationChannel: { type: String },
            activationDate: {
                type: Date,
            },
            isActive: { type: Boolean }
        },
        totalMemberCount: {
            type: String
        },
        activeMembers: {
            type: String
        },
        duration: {
            type: String
        },
        productEntitlement: {
            appPageDefaults: {
                showProfileBuilding: {
                    type: Boolean,
                    default: true
                },
                showWelcomeVideo: {
                    type: Boolean,
                    default: true
                },
                showLabelFeelings: {
                    type: Boolean,
                    default: true
                },
                homepage: {
                    type: String,
                },
                bookingPageDefaults: {
                    bookingHomePage: { type: String },
                    showReferral: { type: Boolean }
                },
                explorePageDefaults: {
                    exploreHomePage: { type: String }
                },
                assessmentPageDefaults: {
                    assessmentHomePage: { type: String }
                }
            },
            channelList: [
                {
                    channelId: { type: String },
                    channelName: { type: String },
                    isEnabled: { type: Boolean }
                }
            ],
            content: {
                isEnabled: { type: Boolean },
                contentTypeList: [
                    {
                        contentTypeId: { type: String },
                        contentType: { type: String },
                        contentCategory: { type: String },
                        levelEnabled: { type: String }
                    }]
            },
            assessments: {
                isEnabled: { type: Boolean },
                assessmentTypeList: [
                    {
                        assessmentTypeId: { type: String },
                        assessmentType: { type: String },
                        assessmentCategory: { type: String },
                        levelEnabled: { type: String },
                    }
                ]
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
                            session_img: { type: String }
                        }
                    }
                ],
                counsellingLanguagesList: [
                    {
                        id: { type: String },
                        name: { type: String },
                        isEnabled: { type: Boolean }
                    },
                    {
                        id: { type: String },
                        name: { type: String },
                        isEnabled: { type: Boolean }
                    }
                ],
                counsellingCategoriesList: [
                    {
                        id: { type: String },
                        value: { type: String },
                        isEnabled: { type: Boolean },
                        sessionPerIssue: { type: String },
                        sessionDuration: { type: String }
                    }
                ],
                totalSessionsIncluded: {
                    numberOfSessions: { type: String }
                },
                concernContextCategoryList: {
                    onGoingConcern: {
                        type: [
                        { concernId: { type: String },
                          concernName: { type: String },
                          concernText: { type: String },
                          concernImg:{ type: String },
                          contexts:[
                            {
                              contextName:{type:String},
                              contextId:{type:String},
                              
                            }
                          ],
                          lastAppointmentDate:{ type: Date}
                    }]},
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
                                    sessionConsumedCount: { type: Number },
                                    isOnGoingConcern: { type: Boolean },
                                    sessionDuration: [],
                                    concernText: {
                                        name: { type: String },
                                        img: { type: String },
                                    },
                                    contexts: [
                                        {
                                            contextId: { type: String },
                                            contextName: { type: String }
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                },
                additionalSessions: {
                    isEnabled: { type: Boolean },
                    paidBy: { type: String }
                },
            },
            launches: {
                launchList: [
                    {
                        launchTypeId: { type: String },
                        number: { type: String },
                        typeName: { type: String },
                        isEnabled: { type: Boolean }
                    }
                ],
                launchCollateralList: [
                    {
                        launchCollateralType: { type: String },
                        number: { type: String },
                        typeName: { type: String },
                        isEnabled: { type: Boolean }
                    }
                ]
            },
            dependents: {
                number: { type: String },
                dependentType: [
                    {
                        dependentId: { type: String },
                        dependentName: { type: String },
                        isEnabled: { type: Boolean },
                    }
                ]
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
                        isEnabled: { type: String }
                    }
                ]
            },
            sponsorAuthorization: {
                domain: [],
                authorizationTypeEnabled: [
                    {
                        authorizationTypeId: { type: String },
                        authorizationType: { type: String },
                        value: { type: String },
                        isEnabled: { type: Boolean }
                    }
                ]
            }
        },
    }
     ],
    memberPageDefault: { type: Object },
  },
  { timestamps: true }
);




MemberAccountSchema.statics = {
  getMemberAccountId(id) {
    return this.findOne({ account_id: id })
      .exec()
      .then((user) => {
        if (user) {
          return user._id;
        }
        const err = new APIError(
          "No user details found ",
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  async insertContactData(contact, checkMemberAccount, accountType) {
    console.log("memberId::", checkMemberAccount);
    let insertDataIndb = await this.findOneAndUpdate(
      { memberId: checkMemberAccount },
      {
        memberContacts: contact,
        "accountDetails.isActivated": true,
        "accountDetails.accountType": accountType,
        "accountDetails.accountStatus": "active",
      },
      { new: true }
    )
      .lean()
      .exec();

    console.log("insertDataIndb::", insertDataIndb);
    if (insertDataIndb) {
      return insertDataIndb;
    } else {
      return new APIError("insertContactData error!!", httpStatus.NOT_FOUND);
    }
  },
  async insertContactDataForGuestUser(contact, checkMemberAccount) {
    try {
      console.log("memberId::", checkMemberAccount);
      let insertDataIndb = await this.findOneAndUpdate(
        { memberId: checkMemberAccount },
        {
          memberContacts: contact,
          "accountDetails.isActivated": true,
          "accountDetails.accountType": "guest",
          "accountDetails.accountStatus": "active",
        },
        { new: true }
      );
      console.log("insertDataIndb::", insertDataIndb);
      if (insertDataIndb) {
        return insertDataIndb;
      } else {
        return new APIError("insertContactData error!!", httpStatus.NOT_FOUND);
      }
    } catch (error) {
      return new APIError(error, httpStatus.NOT_FOUND);
    }
  },

  async insertContactAuthInMemberAccount(code, contact, field) {
    try {
      console.log("code,contact,field", code, contact, field);

      let mapObj = { "contact.employeeCode": code };

      console.log("code::", code);
      console.log("mapObj:", mapObj);

      console.log("code::", code, contact);
      let updateData = await this.findOneAndUpdate(
        { memberContacts: { $elemMatch: mapObj } },
        { $push: { memberContacts: { contact } } },
        { new: true }
      );

      return updateData;
    } catch (error) {
      return new APIError(error, httpStatus.NOT_FOUND);
    }
  },

  async updateContactAuthInMemberAccount(code, field) {
    let mapObj;
    console.log("code:", code);
    console.log("field:", field);

    try {
      if (field == "employeeCode") {
        mapObj = { "contact.employeeCode": code };
      }
      console.log("code::", code);
      console.log("mapObj:", mapObj);

      let updateData = await this.findOneAndUpdate(
        { memberContacts: { $elemMatch: mapObj } },

        {
          $set: {
            "memberContacts.$.contact.isAuthorized": true,
            "memberContacts.$.contact.isVerified": true,
          },
        },
        { new: true }
      )
        .lean()
        .exec();
      console.log("updateData:::", updateData);
      return updateData;
    } catch (error) {
      return new APIError(error, httpStatus.NOT_FOUND);
    }
  },
};

module.exports = mongoose.model("member_account", MemberAccountSchema);
