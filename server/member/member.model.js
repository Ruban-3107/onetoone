const mongoose = require("mongoose");
const commonResponse = require("../entity/commonresponse");

const memberSchema = new mongoose.Schema(
  {
    memberId: { type: String ,unique:true,required:true},
    sponsorId: { type: String },
    employeeCode:{type:String},
    memberContactInfo: [],
    officialEmailId:{type:String},
    primaryMobileNumber:{type:String},
    memberContacts:[
     {
        contact: {
          isAuthorized: { type: Boolean, default: false },
          isVerified: { type: Boolean, default: false },
          type: { type: String },
          contact: { type: String },
          id: { type: mongoose.Schema.Types.ObjectId, ref: "contacts" },
        },
      },],

    channel:{type:String},
    memberDemographicInfo: { 
       name:{ type: String},
       age:{ type: String},
       gender:{ type: String},
       relationshipStatus:{ type: String},
       location:{ type: String},
      key_areas:[] },
    
    memberRiskProfile: { 
      currentRiskFlag:{type:String,default:null},
      lastDistressLevel:{type:String,default:null},
     },
    memberAssessmentProfile: {},
    memberContentProfile: {},
    memberPreferences: {},
    notificationPreferences: [],
    memberAgreementTerms: { type: Object },
    memberSupportGroup: {},
    memberProfileHistory: {},
  },
  { timestamps: true }
);


memberSchema.statics=({

  async insertContactData(contact,checkMember){
    console.log("memberId::",checkMember)
    let insertDataIndb=await this.findOneAndUpdate(
      {memberId: checkMember},
      {memberContacts : contact},
      {new:true}
      
   )
   console.log("insertDataIndb::",insertDataIndb)
   return insertDataIndb

  },
  async insertContactAuthInMember(code,contact){

    try{
   console.log("code,contact::::::::::",code,contact)
    //   let mapObj;
    //   // if(field=="employeeCode"){
    //   //    
    //   // }
      mapObj={'employeeCode':code}
    //   console.log("code::",code)
    //  console.log("mapObj:",mapObj)

    //   console.log("code::",code,contact)
    //   let updateData = await this.findOneAndUpdate(
    //   mapObj,
    //   {$push:{memberContacts:{contact}
        
    // },
    //   { new: true }
    // );
    let updateData = await this.findOneAndUpdate(
      mapObj,
      {memberContacts:contact
          
    },{ new: true }).lean().exec()
    
    console.log("updateData:::",updateData)
    return updateData
    }catch(error){
      console.log(error)
    }

  }
})




module.exports = mongoose.model("member", memberSchema);
