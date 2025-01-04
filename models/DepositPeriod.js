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
    enum: ["PFA", "PFE", "STAGE"],
    default: "STAGE",
    required: true,
  },
  lateDepotCode: {
    type: String,
    default: null,
  },
});

export default mongoose.model("DepositPeriod", DespositPeriodchema);
