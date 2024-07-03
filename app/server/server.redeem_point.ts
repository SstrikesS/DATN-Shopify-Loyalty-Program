import type {RedeemPointType} from "~/class/redeem_point.class";
import RedeemPointModel from "~/models/redeem_point";
import mongoose from "mongoose";

function modelsToClass(models: any) {
    return {
        id: models.id,
        store_id: models.store_id,
        name: models.name,
        status: models.status,
        limitUsage: models.limit_usage,
        limitResetInterval: models.limit_reset_interval,
        limitResetValue: models.limit_reset_value,
        customerEligibility: models.customer_eligibility,
        prefix: models.prefix,
        type: models.type,
        icon: models.icon,
        pointValue: models.point_value,
        query: models.query,
    } as RedeemPointType
}

export async function getRedeemPointPrograms(storeId: string, state = false): Promise<RedeemPointType[] | null> {
    if (state) {
        const mongooseList = await RedeemPointModel.find({store_id: storeId, status: true}, null, {lean: true});
        if (mongooseList === null || mongoose === undefined) {
            return null;
        } else {
            return mongooseList.map<RedeemPointType>((item: any) => {
                return modelsToClass(item);
            })
        }
    } else {
        const mongooseList = await RedeemPointModel.find({store_id: storeId}, null, {lean: true});
        if (mongooseList === null || mongoose === undefined) {
            return null;
        } else {
            return mongooseList.map<RedeemPointType>((item: any) => {
                return modelsToClass(item);
            })
        }
    }
}

export async function getRedeemPointProgram(storeId: string, id: string) {
    const mongooseData = await RedeemPointModel.findOne({store_id: storeId, id: id}, null, {lean: true});
    if (mongooseData === null || mongooseData === undefined) {
        return null;
    } else {
        return modelsToClass(mongooseData);
    }
}

export async function getSpecificCustomerRedeemPointProgram(storeId: string, customerId: string): Promise<RedeemPointType[] | null> {

    return await getRedeemPointPrograms(storeId, true);
}
