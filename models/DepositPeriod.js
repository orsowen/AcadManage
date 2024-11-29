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
  For: {
    type: String,
    enum: ["PFA", "PFE", "STAGE"],
    required: true,
  },
});

export default mongoose.model("DepositPeriod", DespositPeriodchema);
