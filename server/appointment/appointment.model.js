const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const AppointmentSchema = new mongoose.Schema(
  {
    appointment_id: { type: String },

    memberAccountId: { type: String },

    caseId: { type: Schema.Types.ObjectId, ref: "case" },

    reschedule_counter: { type: String },

    channel: { type: String },
    
    isCouple:{type:Boolean,default:false},
    isAgree:{type:Boolean,default:false},

    appointmentPreferences: {
      mode: {

        modesId: { type: String },

        modesName: { type: String },
      },

      languages: {

        id: { type: String },
        name: { type: String },
      },

      preferred_slots: [
        {
          dateTime: String,
        },
      ],
    },

    appointmentStatus: {
      memberStatus: {
        status: { type: String },
      },

      processStatus: {
        status: { type: String },
      },

      sponsorStatus: {
        status: { type: String },
      },
      cancellation_reason: {
        comment: { type: String }
      },
      cancellation_reason_id:{type:Number},
      reschedule_counter: { type: Number, default: 0 },
      isReschedule: { type: Boolean, default: false }
    },
    appointmentTiming: {
      appointmentStartTime: { type: Date }, //start time--getting from req.body
      appointmentEndTime: { type: Date }, //start time + duration ???add 60min
      enableBookingTime: { type: Date },  //get from policy -start time-10min
      disableCancelTime: { type: Date }, //get from policy //appointmentStartTime-1440
      disableRescheduleTime: { type: Date },//get from policy - appointmentStartTime-1440
    },
    appointmentDetails: {
      language: { type: Object },
      counsellor: {
        name: { type: String },
        counsellor_id: { type: String }
      },
      meeting_url: { type: Schema.Types.ObjectId, ref: "_meeting" },
      appointmentDateTime: { type: Date },
      cancellation_date: {
        type: Date
      },
    },
    appointmentFeedback: {
      feedbackId: {
        type: Schema.Types.ObjectId,
        ref: "appointment_feedback"
      },
      isFeedbackGiven: {
        type: Boolean
      }
    },
    appointmentUpdateHistory: [
      {
        booking_status: { type: String },

        counsellor_Id: { type: String },

        booking_confirmedDate: { type: String },

        booking_startTime: { type: String },

        booking_endTime: { type: String },

        cancellation_Reason: { type: String },



        reschedule: { type: String },

        meeting_url: { type: String },

        booking_line_id: { type: String },

        updatedChannel: { type: String },

        notifyUser: { type: Boolean },

        rescheduleFlag: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);










module.exports = mongoose.model("appointment", AppointmentSchema);
