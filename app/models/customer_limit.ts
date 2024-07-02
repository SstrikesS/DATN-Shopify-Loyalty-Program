import mongoose from "mongoose";
const Schema = mongoose.Schema;

const customerLimit = new Schema({
    customer_id: {type: String, required: true},
    store_id: {type: String, required: true},
    program_id: {type: String, required: true},
    usage: {type: Number, required: true},
},{
    timestamps: true,
})

const customerLimitModels = mongoose.models.CustomerLimit || mongoose.model('CustomerLimit', customerLimit);

export default customerLimitModels;
