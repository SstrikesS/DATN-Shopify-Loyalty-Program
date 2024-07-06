import vipTier from "~/models/tier";
import type {TierType} from "~/class/tier.class";
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

export async function getTiers(storeId: string): Promise<TierType[] | null> {
    const mongooseList = await vipTier.find({store_id: storeId}).sort({entry_requirement: 1}).lean();
    if (mongooseList === undefined || mongooseList === null) {
        return null;
    } else {
        return mongooseList.map<TierType>((item: any) => {
            return {
                ...modelsToClass(item)
            } as TierType
        });
    }
}

export async function getTier(storeId: string, id: string): Promise<TierType | null> {
    const mongooseModel = await vipTier.findOne({store_id: storeId, id: id}, null, {lean: true});
    if (mongooseModel === undefined || mongooseModel === null) {
        return null;
    } else {
        return modelsToClass(mongooseModel);
    }
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
    if (previousTier !== undefined) {
        const tierData = await getTier(storeId, previousTier);
        if (tierData !== null) {
            const tier = new Tier(tierData);
            tier.nextTier = currentTier;
            await tier.saveTier();
        }
    }

    if (nextTier !== undefined) {
        const tierData = await getTier(storeId, nextTier);
        if (tierData !== null) {
            const tier = new Tier(tierData);
            tier.previousTier = currentTier;
            await tier.saveTier();
        }
    }
}

export async function sortUpdateTier(currentTier: string, storeId: string, oldPreviousTier: string | undefined, oldNextTier: string | undefined, newPreviousTier: string | undefined, newNextTier: string | undefined) {

    if (oldPreviousTier !== undefined) {
        if (oldNextTier !== undefined) {
            const tierPreData = await getTier(storeId, oldPreviousTier);
            if (tierPreData !== null) {
                const tierPre = new Tier(tierPreData);
                tierPre.nextTier = oldNextTier;
                await tierPre.saveTier();
            }

            const tierNextData = await getTier(storeId, oldNextTier);
            if (tierNextData !== null) {
                const tierNext = new Tier(tierNextData);
                tierNext.previousTier = oldPreviousTier;
                await tierNext.saveTier();
            }
        } else {
            const tierPreData = await getTier(storeId, oldPreviousTier);
            if (tierPreData !== null) {
                const tierPre = new Tier(tierPreData);
                tierPre.nextTier = undefined;
                await tierPre.saveTier();
            }
        }
    } else if (oldNextTier !== undefined) {
        const tierNextData = await getTier(storeId, oldNextTier);
        if(tierNextData !== null) {
            const tierNext = new Tier(tierNextData);
            tierNext.previousTier = undefined;
            await tierNext.saveTier();
        }
    }

    await sortNewTier(currentTier, storeId, newPreviousTier, newNextTier);
}

export async function getSpecificCustomerVipTier(storeId: string, tierId: string | undefined | null) {
    const mongooseData = await vipTier.findOne({store_id: storeId}).sort({entry_requirement: 1}).lean();

    if (tierId === undefined || tierId === null) {

        return {
            currentTier: null,
            nextTier: mongooseData !== null && mongooseData !== undefined ? modelsToClass(mongooseData) : null,
            previousTier: null,
        };
    } else {
        const currentTier = await getTier(storeId, tierId);
        let nextTier;
        let previousTier;
        if (currentTier !== null) {
            if (currentTier.nextTier !== null && currentTier.nextTier !== undefined) {
                nextTier = await getTier(storeId, currentTier.nextTier);
            } else {
                nextTier = null;
            }
            if (currentTier.previousTier !== null && currentTier.previousTier !== undefined) {
                previousTier = await getTier(storeId, currentTier.previousTier)
            } else {
                previousTier = null;
            }

            return {
                currentTier: currentTier,
                nextTier: nextTier !== null ? nextTier : null,
                previousTier: previousTier !== null ? previousTier : null
            }
        } else {

            return {
                currentTier: null,
                nextTier: mongooseData !== null && mongooseData !== undefined ? modelsToClass(mongooseData) : null,
                previousTier: null,
            };
        }
    }
}
