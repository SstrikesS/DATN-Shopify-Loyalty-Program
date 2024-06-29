import storeModel from "~/models/storeSetting"
import type { PointSetting, StoreType, VIPSetting} from "~/class/store.class";
import Store from "~/class/store.class";
import {de_pointSetting, de_vipSetting} from "~/utils/helper";


type ShopifyShop = {
    id: string,
    name: string,
    url: string,
    myshopifyDomain: string,
}

function modelsToClass(models: any) {
    return {
        id: models.id,
        vipSetting: {
            milestoneType: models.vip_program_setting.milestoneType,
            program_reset_time: models.vip_program_setting.program_reset_time,
            program_reset_interval: models.vip_program_setting.program_reset_interval,
            program_start: new Date(models.vip_program_setting.program_start),
            status: models.vip_program_setting.status,
        } as VIPSetting,
        pointSetting: {
            currency: {
                singular: models.point_program_setting.currency.singular,
                plural: models.point_program_setting.currency.plural,
            },
            point_expiry_time: models.point_program_setting.point_expiry_time,
            point_expiry_interval: models.point_program_setting.point_expiry_interval,
            status: models.point_program_setting.status,
        } as PointSetting,
        status: models.status
    }
}

export async function isMemberStore(shopShopify: ShopifyShop) {
    const result = await storeModel.findOne({id: shopShopify.id});

    if (result && result?.status === false) {
        result.status = true;
        await result.save();

        return true;
    }

    return result !== null;
}

export async function addNewMemberStore(storeId: string) {
    await storeModel.create({
        id: storeId,
        vip_program_setting: de_vipSetting,
        point_program_setting: de_pointSetting,
        status: true,
    });
}

export async function getStore(shopShopify: ShopifyShop) {
    if (shopShopify?.id) {
        const store = await storeModel.findOne({id: shopShopify.id});
        if (store) {
            return new Store({
                    name: shopShopify.name,
                    url: shopShopify.url,
                    myshopifyDomain: shopShopify.myshopifyDomain,
                    ...modelsToClass(store),
                } as StoreType
            )
        } else {
            console.log('--Error: Store not found--');
            return null;
        }
    } else {
        console.log('--Error: Store not found--');
        return null;
    }
}

