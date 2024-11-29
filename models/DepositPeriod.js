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
  },
  End_Choice: {
    type: Date,
  },
  For: {
    type: String,
    enum: ["PFA", "PFE", "STAGE"], //2 date pfa date pfa et date de choix (3.3)
  },
});

export default mongoose.model("DepositPeriod", DespositPeriodchema);
