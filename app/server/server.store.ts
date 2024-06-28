import storeModel from "~/models/storeSetting"
import type {CurrencyType, PointSetting, StoreType, VIPSetting} from "~/class/store.class";
import Store from "~/class/store.class";
import type { DefaultIntervalType} from "~/utils/helper";
import {de_pointSetting, de_vipSetting} from "~/utils/helper";

type ShopifyShop = {
    id: string,
    name: string,
    url: string,
    myshopifyDomain: string,
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
                    ...shopShopify,
                    vipSetting: {
                        milestoneType: store.vip_program_setting.milestoneType,
                        program_reset_time: store.vip_program_setting.program_reset_time,
                        program_reset_interval: store.vip_program_setting.program_reset_interval as DefaultIntervalType,
                        program_start: store.vip_program_setting.program_start,
                        status: store.vip_program_setting.status,
                    } as VIPSetting,
                    pointSetting: {
                        currency: store.point_program_setting.currency as CurrencyType,
                        point_expiry_time: store.point_program_setting.point_expiry_time,
                        point_expiry_interval: store.point_program_setting.point_expiry_interval as DefaultIntervalType,
                        status: store.point_program_setting.status,
                    } as PointSetting,
                } as unknown as StoreType
            )
        } else {

            console.log('--Error: Store not found--');
            return null;
        }
    }
}
