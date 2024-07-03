import Program from "~/class/program.class";
import type {ProgramType} from "~/class/program.class";
import RedeemPointModel from "~/models/redeem_point";
import {discountCodeBasicCreate} from "~/utils/shopify_query";
import {generateRandomString} from "~/utils/helper";

export type RewardType =
    'DiscountCodeBasicAmount'
    | 'DiscountCodeBasicPercentage'
    | 'DiscountCodeFreeShipping'
    | 'DiscountCodeBxgy'
    | 'GiftCard';

export type CombineWithType = {
    shippingDiscounts: boolean,
    productDiscounts: boolean,
    orderDiscounts: boolean,
}

export type CustomerGetsType = {
    all: boolean,
    collection: string[] | undefined,
    value: number,
}

export type CustomerBuysType = {
    all: boolean,
    collections: string[] | undefined,
    quantity: number | undefined,
    percentage: number | undefined,
}

export type giftCardCreateQueryType = {
    expiresOn: Date | undefined,
    initialValue: number,
    note: string | undefined,
    templateSuffix: string | undefined,
}

export type discountCodeBasicCreateQueryType = {
    combinesWith: CombineWithType,
    customerGets: CustomerGetsType,
    minimumQuantity: number | null | undefined,
    minimumPercentage: number | null | undefined,
    startsAt: Date,
    endsAt: Date | undefined | null,
}

export type discountCodeBxgyCreate = {
    combinesWith: CombineWithType,
    customers: [string],
    customerGets: CustomerGetsType,
    customerBuys: CustomerBuysType,
    startsAt: Date,
    endsAt: Date | undefined | null,
}

export type discountCodeFreeShippingCreate = {
    combinesWith: CombineWithType,
    maximumShippingPrice: number | undefined,
    minimumQuantity: number | null | undefined,
    minimumPercentage: number | null | undefined,
    startsAt: Date,
    endsAt: Date | undefined | null,
}

export type QueryType =
    giftCardCreateQueryType
    | discountCodeBasicCreateQueryType
    | discountCodeBxgyCreate
    | discountCodeFreeShippingCreate
    | undefined

export type RedeemPointType = ProgramType & {
    type: RewardType,
    pointValue: number,
    icon: string,
    prefix: string,
    query: QueryType,
}

export class RedeemPoint extends Program {
    private _type: RewardType;
    private _pointValue: number;
    private _icon: string;
    private _prefix: string;
    private _query: QueryType;

    constructor(data: RedeemPointType) {
        super(data as ProgramType);
        this._type = data.type;
        this._pointValue = data.pointValue;
        this._icon = data.icon;
        this._prefix = data.prefix;
        this._query = data.query;
    }

    get prefix() {
        return this._prefix
    }

    set prefix(value: string) {
        this._prefix = value;
    }

    get type() {
        return this._type;
    }

    set type(value: RewardType) {
        this._type = value;
    }

    get icon() {
        return this._icon;
    }

    set icon(value: string) {
        this._icon = value;
    }

    get query() {
        return this._query;
    }

    set query(value: QueryType) {
        this._query = value;
    }

    get pointValue() {
        return this._pointValue;
    }

    set pointValue(value: number) {
        this._pointValue = value;
    }


     queryCreate(customer_id: string) {
        let query;
        switch (this.type) {
            case "DiscountCodeBasicAmount":
            case "DiscountCodeBasicPercentage":
                query = this.query as discountCodeBasicCreateQueryType;
                return discountCodeBasicCreate(query,  generateRandomString(12, this.prefix), this.name, customer_id, this.type);
            case "DiscountCodeBxgy":
                query = this.query as discountCodeBxgyCreate;
                console.log(query)
                break;
            case "DiscountCodeFreeShipping":
                query = this.query as discountCodeFreeShippingCreate;
                console.log(query)
                break;
            case "GiftCard":
                query = this.query as giftCardCreateQueryType;
                console.log(query)
                break;
            default:
                break;
        }

    }

    async save(){
        await RedeemPointModel.findOneAndUpdate({id: this.id, store_id: this.store_id},
            {
                id: this.id,
                store_id: this.store_id,
                name: this.name,
                status: this.status,
                limit_usage: this.limitUsage,
                limit_reset_interval: this.limitResetInterval,
                limit_reset_value: this.limitResetValue,
                customer_eligibility: this.customerEligibility,
                type: this.type,
                icon: this.icon,
                point_value: this.pointValue,
                prefix: this.prefix,
                query: this.query,
            },{
                returnDocument: "after",
                new: true,
                lean: true,
                upsert: true,
            })
    }
}
