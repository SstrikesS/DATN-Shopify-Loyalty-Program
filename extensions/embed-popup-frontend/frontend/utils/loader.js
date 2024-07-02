import {getResource} from "./apis.js";

export async function AppResourceLoader() {
    const dataRes = await getResource();
    if (dataRes?.data !== null) {

        return {
            store: dataRes.data.store,
            customer: dataRes.data.customer,
            rewards: dataRes.data.rewards,
            redeemPrograms: dataRes.data.redeemPrograms,
            earnPointPrograms: dataRes.data.earnPointPrograms,
            vipTiers: dataRes.data.vipTiers,
        }
    } else {

        return null;
    }
}
