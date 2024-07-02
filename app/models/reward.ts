import mongoose from "mongoose";
const Schema = mongoose.Schema;

const rewardSchema = new Schema({
    id: {type: String, required: true},
    customer_id: {type: String, required: true},
    program_id: {type: String, required: true},
    status: {type: Boolean, required: true, default: true},
},{
    timestamps: true,
})

const RewardModel = mongoose.models.Reward || mongoose.model('Reward', rewardSchema);

export default RewardModel;
