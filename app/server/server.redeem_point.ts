import type {RedeemPointType} from "~/class/redeem_point.class";
import RedeemPointModel from "~/models/redeem_point";

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
        type: models.type,
        icon: models.icon,
        pointValue: models.point_value,
        query: models.query,
    } as RedeemPointType
}

export function addRedeemPointProgram(data: RedeemPointType) {

}

export async function getRedeemPointPrograms(storeId: string): Promise<RedeemPointType[]> {
    const mongooseList = await RedeemPointModel.find({store_id: storeId}, null ,{lean: true});

    return mongooseList.map<RedeemPointType>((item: any) => {
        return modelsToClass(item);
    })
}

export async function getRedeemPointProgram(storeId: string, id: string) {
    const mongooseData = await RedeemPointModel.findOne({store_id: storeId, id: id}, null, {lean: true});

    return modelsToClass(mongooseData);
}
