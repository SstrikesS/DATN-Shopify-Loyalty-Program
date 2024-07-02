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



