import RewardModel from "~/models/reward";
import type {RewardDataType} from "~/class/reward";
function modelsToClass(model: any) {
    return {
        id: model.id,
        program_id: model.program_id,
        customer_id: model.customer_id,
        code: model.code,
        type: model.type,
        title: model.title,
        value: model.value,
        endAt: model.end_at,
        status: model.status,
    } as RewardDataType;
}


export async function getCustomerRewards(customerId: string) {
    if(customerId != '') {
        const rewards = await RewardModel.find({customer_id: customerId}, null, {lean: true});
        if(rewards === null || rewards === undefined) {
            return null;
        }
        return rewards.map((r) => {
            return modelsToClass(r)
        }) as RewardDataType[]
    } else {
        return null;
    }
}
