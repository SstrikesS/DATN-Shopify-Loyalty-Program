import mongoose from "mongoose";
const Schema = mongoose.Schema;
const vipTierSchema = new Schema({
    id: {type: String, required: true},
    store_id: {type: String, required: true},
    icon: {type: String, required: true},
    name: {type: String, required: true},
    entry_requirement: {type: Number, required: true},
    reward: {type: [String]},
    bonus_point_earn: {type: Number},
    previousTier: {type: String},
    nextTier: {type: String},
    customer_count: {type: Number, default: 0, required: true},
    status: {type: Boolean, required: true, default: true},
},{
    timestamps: true,
})

const vipTier = mongoose.models.VipTier || mongoose.model('VipTier', vipTierSchema);

export default vipTier;
