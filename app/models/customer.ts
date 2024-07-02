import mongoose from "mongoose";

const Schema = mongoose.Schema;

const VipPointSchema = new Schema({
    point: {type: Number, required: true},
    money_spent: {type: Number, required: true},
})

const customer = new Schema({
    id: { type: String, required: true },
    store_id: { type: String, required: true },
    vip_tier_id: {type: String},
    dob: {type: Date},
    point_balance: {type: Number, default: 0, required: true},
    point_earn: {type: Number, default: 0, required: true},
    point_spent: {type: Number, default: 0, required: true},
    last_earned_point: {type: Date, default: Date.now(), required: true},
    last_used_point: {type: Date, default: Date.now(), required: true},
    vip_point: {type: VipPointSchema, required: true},
    status: { type: Boolean, required: true, default: true },
},{
    timestamps: true,
})

const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', customer);

export default CustomerModel



