
import CustomerModel from "~/models/customer";
import type { CustomerType} from "~/class/customer";
import Customer from "~/class/customer";
import customerLimitModels from "~/models/customer_limit";


export async function addCustomers(customers :any) {
    await CustomerModel.insertMany(customers);
}

export async function getCustomer(shopifyData: any, storeId: string): Promise<Customer | null> {
    if(shopifyData?.id) {
        const customer = await CustomerModel.findOne({id: shopifyData?.id});
        if (customer) {
            return new Customer({
                id: shopifyData.id as string,
                store_id: storeId,
                name: shopifyData.displayName as string,
                email: shopifyData.email as string,
                phone: shopifyData.phone !== null ? shopifyData.phone as string : undefined,
                image: shopifyData.image.url as string,
                address: shopifyData.addresses.longitude !== null && shopifyData.addresses.latitude !== null ?`{${shopifyData.addresses.longitude as string}, ${shopifyData.addresses.latitude as string}}` : undefined,
                vipTierId: customer.vip_tier_id,
                dob: customer.dob,
                pointBalance: customer.point_balance,
                pointEarn: customer.point_earn,
                pointSpent: customer.point_spent,
                lastEarnPoint: new Date(customer.last_earn_point),
                lastUsedPoint: new Date(customer.last_used_point),
                vipPoint: {
                    point: customer.vip_point.point,
                    money_spent: customer.vip_point.money_spent
                },
                status: customer.status,
            } as CustomerType)
        } else  {
            return null;
        }
    } else {
        return null;
    }
}

export async function getCustomerLimit(storeId: string, customerId: string, programId: string) {
    const mongooseList = await customerLimitModels.findOne({customer_id: customerId, store_id: storeId, program_id: programId}, null, {lean: true}) as any;

    if(mongooseList === undefined || mongooseList === null) {
        return null;
    } else {
        return mongooseList.usage as number;
    }
}

export async function updateCustomerLimit(storeId: string, customerId: string, programId: string, usage: number) {
    await customerLimitModels.findOneAndUpdate({customer_id: customerId, store_id: storeId, program_id: programId}, {usage: usage}, {
        returnDocument: "after",
        new: true,
        lean: true,
        upsert: true,
    })
}
