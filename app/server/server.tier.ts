import {vipTier} from "~/models/earn_point";
import type { TierType} from "~/class/tier.class";
import {Tier} from "~/class/tier.class";

function modelsToClass(models: any) {
    return {
        id: models.id,
        store_id: models.store_id,
        name: models.name,
        icon: models.icon,
        entryRequirement: models.entry_requirement,
        reward: models.reward,
        bonusPointEarn: models.bonus_point_earn,
        previousTier: models.previousTier,
        nextTier: models.nextTier,
        customerCount: models.customer_count,
        status: models.status,
    } as TierType
}

export async function getTiers(storeId: string): Promise<TierType[]> {
    const mongooseList = await vipTier.find({ store_id: storeId }).sort({ entry_requirement: 1 }).lean();


    return mongooseList.map<TierType>((item: any) => {
        return {
            ...modelsToClass(item)
        } as TierType
    });
}

export async function getTier(storeId: string, id: string) {
    const mongooseModel = await vipTier.findOne({store_id: storeId, id: id}, null, {lean: true});

    return modelsToClass(mongooseModel);
}

export async function updateTier(data: TierType) {
    return vipTier.findOneAndUpdate({id: data.id, store_id: data.store_id}, {
        id: data.id,
        store_id: data.store_id,
        name: data.name,
        icon: data.icon,
        entry_requirement: data.entryRequirement,
        reward: data.reward,
        bonus_point_earn: data.bonusPointEarn,
        previousTier: data.previousTier,
        nextTier: data.nextTier,
        customer_count: data.customerCount,
        status: data.status,
    }, {
        returnDocument: "after",
        new: true,
        lean: true,
        upsert: true,
    });
}

export async function sortNewTier(currentTier: string, storeId: string, previousTier: string | undefined, nextTier: string | undefined) {
    if(previousTier !== undefined) {
        const tierData = await getTier(storeId, previousTier);
        const tier = new Tier(tierData);
        tier.nextTier = currentTier;
        await tier.saveTier();
    }
    if(nextTier !== undefined) {
        const tierData = await getTier(storeId, nextTier);
        const tier = new Tier(tierData);
        tier.previousTier = currentTier;
        await tier.saveTier();
    }
}

export async function sortUpdateTier(currentTier: string, storeId: string, oldPreviousTier: string | undefined, oldNextTier: string | undefined, newPreviousTier: string | undefined, newNextTier: string | undefined){

    if(oldPreviousTier !== undefined) {
        if(oldNextTier !== undefined) {
            const tierPreData = await getTier(storeId, oldPreviousTier);
            const tierPre = new Tier(tierPreData);
            tierPre.nextTier = oldNextTier;
            await tierPre.saveTier();

            const tierNextData = await getTier(storeId, oldNextTier);
            const tierNext = new Tier(tierNextData);
            tierNext.previousTier = oldPreviousTier;
            await tierNext.saveTier();
        } else {
            const tierPreData = await getTier(storeId, oldPreviousTier);
            const tierPre = new Tier(tierPreData);
            tierPre.nextTier = undefined;
            await tierPre.saveTier();
        }
    } else if(oldNextTier !== undefined){

        const tierNextData = await getTier(storeId, oldNextTier);
        const tierNext = new Tier(tierNextData);
        tierNext.previousTier = undefined;
        await tierNext.saveTier();

    }
}
