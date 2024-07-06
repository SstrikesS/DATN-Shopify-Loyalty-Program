import type { RewardDataType} from "~/class/reward.class";
import {RewardClass} from "~/class/reward.class";
import Store from "~/class/store.class";

export async function getCustomerRewards(customerData: any) {
    if (customerData?.metafield?.value) {
        const data = JSON.parse(customerData?.metafield?.value as string) as RewardDataType[];
        const now = new Date();
        return data.filter(item => {
            const startAtDate = new Date(item.startAt);
            const endAtDate = item.endAt ? new Date(item.endAt) : null;
            if (endAtDate === null) {
                return now > startAtDate && item.status;
            }
            return now > startAtDate && now > endAtDate && item.status;
        })
    } else {
        return null;
    }
}

export async function getAllCustomerReward(customerData: any) {
    if (customerData?.metafield?.value) {
        return JSON.parse(customerData?.metafield?.value as string) as RewardDataType[];
    } else {
        return null;
    }

}

export async function checkRewardUsage(store: Store, discount_codes: any[] | null, rewardList: any, total_price: number) {
    console.log('discount_codes', discount_codes);
    if (discount_codes === null) {
        return null;
    } else if (discount_codes.length > 0) {
        let rewards = await getCustomerRewards(rewardList);
        for (const value of discount_codes) {
            if (rewards !== null) {
                const reward = rewards.find((r) => r.code === value.code);
                if (reward) {
                    reward.status = false;
                    const rewardClass = new RewardClass(reward);
                    rewardClass.save().then((r) =>
                        console.log(`--Reward ${rewardClass.id} is update successfully!`)
                    )
                    if(reward.type === 'DiscountCodeBasicAmount') {
                        if(reward.value && reward.value > total_price ) {
                            store.totalSale = store.totalSale + total_price
                        } else if(reward.value && reward.value < total_price){
                            store.totalSale = store.totalSale + reward.value
                        }
                    } else if(reward.type === 'DiscountCodeBasicPercentage') {
                        if(reward.value){
                            store.totalSale = store.totalSale + reward.value * total_price
                        }
                    }
                }
            }
        }

        return rewards;
    } else {
        return null;
    }
}

