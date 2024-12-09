import mongoose from "mongoose";

const DespositPeriodchema = new mongoose.Schema({
  Start_Deposit: {
    type: Date,
    required: true,
  },
  End_Deposit: {
    type: Date,
    required: true,
  },
  Start_Choice: {
    type: Date,
    required: true,

  },
  End_Choice: {
    type: Date,
    required: true,

  },
  For: {
    type: String,
    enum: ["PFA", "PFE", "STAGE"], //2 date pfa date pfa et date de choix (3.3)
    default: "STAGE",
    required: true,

  },
});

export default mongoose.model("DepositPeriod", DespositPeriodchema);
