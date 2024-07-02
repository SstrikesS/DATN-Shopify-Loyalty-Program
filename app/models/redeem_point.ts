import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CustomerGetsSchema = new Schema({
    all: {type: Boolean, required: true, default: true},
    collections: {type: [String]},
    value: {type: Number, required: true},
})

const CustomerBuysSchema = new Schema({
    all: {type: Boolean, required: true, default: true},
    collections: {type: Array, required: true},
    quantity: {type: Number},
    percentage: {type: Number},
})

const CombineSchema = new Schema({
    shippingDiscounts: {type: Boolean, required: true, default: true},
    productDiscounts: {type: Boolean, required: true, default: true},
    orderDiscounts: {type: Boolean, required: true, default: true},
});

export const giftCardCreateQuerySchema = new Schema({
    expiresOn: {type: Date},
    initialValue: {type: Number, required: true},
    note: {type: String},
    templateSuffix: {type: String},
})

export const discountCodeBasicCreateQuerySchema = new Schema({
    combinesWith: {type: CombineSchema, required: true},
    customerGets: {type: CustomerGetsSchema, required: true},
    minimumQuantity: {type: Number},
    minimumPercentage: {type: Number},
    startsAt: {type: Date, default: Date.now, required: true},
    endsAt: {type: Date},
});

export const discountCodeBxgyCreateQuerySchema = new Schema({
    combinesWith: {type: CombineSchema, required: true},
    customerGets: {type: CustomerGetsSchema, required: true},
    customerBuys: {type: CustomerBuysSchema, required: true},
    startsAt: {type: Date, default: Date.now, required: true},
    endsAt: {type: Date},
})

export const discountCodeFreeShippingCreateQuerySchema = new Schema({
    combinesWith: {type: CombineSchema, required: true},
    maximumShippingPrice: {type: Number},
    minimumQuantity: {type: Number},
    minimumPercentage: {type: Number},
    startsAt: {type: Date, default: Date.now, required: true},
    endsAt: {type: Date},
})

const redeemPointSchema = new Schema({
    id: {type: String, required: true},
    store_id: {type: String, required: true},
    type: {type: String, required: true},
    icon: {type: String, required: true},
    name: {type: String, required: true},
    point_value: {type: Number, required: true},
    query: {type: Schema.Types.Mixed, required: true},
    prefix: {type: String},
    limit_usage: {type: Number, required: true},
    customer_eligibility: {type: String, required: true},
    limit_reset_interval: {type: String, default: 'day'},
    limit_reset_value: {type: Number, default: -1},
    status: {type: Boolean, required: true, default: true},
})

const RedeemPointModel = mongoose.models.RedeemPoint || mongoose.model('RedeemPoint', redeemPointSchema);

export default RedeemPointModel
