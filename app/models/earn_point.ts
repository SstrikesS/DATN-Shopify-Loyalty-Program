import mongoose from "mongoose";

const Schema = mongoose.Schema;

const earnPointSchema = new Schema({
    id: { type: String, required: true },
    store_id: { type: String, required: true },
    type: { type: String, required: true },
    icon: { type: String, required: true },
    name: { type: String, required: true },
    point_value: { type: Number, required: true },
    limit_usage: { type: Number, required: true },
    customer_eligibility: { type: String, required: true },
    limit_reset_interval: { type: String, default: 'month' },
    limit_reset_value: { type: Number, default: -1 },
    status: { type: Boolean, required: true, default: true },
})

const EarnPointModel = mongoose.models.EarnPoint || mongoose.model('EarnPoint', earnPointSchema);

export default EarnPointModel

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
})

export const vipTier = mongoose.models.VipTier || mongoose.model('VipTier', vipTierSchema);

