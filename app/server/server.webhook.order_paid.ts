import type Customer from "~/class/customer";
import type Store from "~/class/store.class";
import {getEarnPointProgramByType} from "~/server/server.earn_point";
import EarnPoint from "~/class/earn_point.class";
import {getTier} from "~/server/server.tier";


export async function ProgramHandler(store: Store, customer: Customer, order_subtotal: number) {
    const earnPointProgramData = await getEarnPointProgramByType(store.id, 'complete_an_order')
    if (earnPointProgramData !== null && store.pointSetting.status) {
        const earnPointProgram = new EarnPoint(earnPointProgramData);

        if (await earnPointProgram.checkLimitUsage(customer.id)) {
            if(store.vipSetting.status) {
                if (customer.vipTierId !== undefined && customer.vipTierId !== null) {
                    if (earnPointProgram.checkCustomerEligibility(customer.vipTierId)) {
                        const vipTier = await getTier(store.id, customer.vipTierId);

                        if (vipTier !== undefined && vipTier !== null) {
                            customer.addPoint(order_subtotal, vipTier?.bonusPointEarn, earnPointProgram.pointValue, earnPointProgram.type.split('/')[1], store.vipSetting.milestoneType)
                            return true;
                        } else {

                            console.log(`--Failed to get customer tier data--`)
                            return false;
                        }

                    } else {

                        console.log(`--Customer ${customer.id} did not meet the eligibility of the program ${earnPointProgram.id}--`)
                        return false;
                    }
                }

                customer.addPoint(order_subtotal, 0, earnPointProgram.pointValue, earnPointProgram.type.split('/')[1], store.vipSetting.milestoneType)
                return true;
            } else {

                customer.addPoint(order_subtotal, 0, earnPointProgram.pointValue, earnPointProgram.type.split('/')[1], null)
                return true;
            }
        } else {

            console.log(`--Customer ${customer.id} usage reached the limit of the program ${earnPointProgram.id}--`)
            return false;
        }
    } else {

        console.log(`--Failed to get program data--`)
        return false;
    }
}
