import EarnPointModel from "~/models/earn_point";
import {de_listEarnPointProgram} from "~/utils/helper";
import {ulid} from "ulid";
import type {EarnPointType} from "~/class/earn_point.class";

function modelsToClass (models: any) {
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
    } as EarnPointType
}

export async function addEarnPointProgram(storeId: string) {
    const earnPointList = de_listEarnPointProgram.map((item, index) => {
        return {id: ulid(), store_id: storeId, ...item} as unknown as EarnPointType
    })
    await EarnPointModel.insertMany(earnPointList)
}

export async function getEarnPointPrograms(storeId: string): Promise<EarnPointType[]>{
    const mongooseList = await EarnPointModel.find({store_id: storeId}, null, {lean: true});
    return mongooseList.map<EarnPointType>((item: any) => {
        return modelsToClass(item);
    });
}

export async function getEarnPointProgram(storeId: string, id: string) {
    const mongooseData = await EarnPointModel.findOne({store_id: storeId, id: id}, null, {lean: true});
    return modelsToClass(mongooseData);
}

// export async function createEarnPoint(){
//     return await EarnPointModel.create({
//         id: ulid(),
//         store_id: '1',
//         type: 'place_an_order/money_spent',
//         icon: 'https://cdn-icons-png.flaticon.com/32/2435/2435281.png',
//         name: 'Complete an order 22222222222222222222222',
//         point_value: 5,
//         limit_usage: -1,
//         customer_eligibility: "null",
//         limit_reset_interval: "month",
//         limit_reset_value: -1,
//         status: true,
//     })
// }
