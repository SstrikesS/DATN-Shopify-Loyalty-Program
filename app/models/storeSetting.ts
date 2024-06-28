import mongoose from "mongoose";

const Schema = mongoose.Schema;

const currencySchema = new Schema({
    plural: { type: String, required: true, default: "Points" },
    singular: { type: String, required: true, default: "Point" },
})

const PointProgramSchema = new Schema({
    currency: { type: currencySchema, required: true },
    point_expiry_time: { type: Number, default: -1 },
    point_expiry_interval: { type: String, default: 'month' },
    status: { type: Boolean, required: true, default: true },
})

const VIPProgramSchema = new Schema({
    milestoneType: { type: String, required: true },
    program_reset_time: { type: Number, default: -1 },
    program_reset_interval: { type: String, default: 'month' },
    program_start: {type: Date, default: Date.now },
    status: { type: Boolean, required: true, default: true },
})

const StoreSchema = new Schema({
    id: { type: String, required: true },
    point_program_setting: { type: PointProgramSchema,  required: true },
    vip_program_setting: { type: VIPProgramSchema,  required: true },
    status: { type: Boolean, required: true, default: true },
}, {
    timestamps: true,
})


const StoreModel = mongoose.models.store || mongoose.model('store', StoreSchema);
export default StoreModel;
