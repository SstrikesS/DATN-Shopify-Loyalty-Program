import CustomerModel from "~/models/customer";
import type {CustomerType, VipPointType} from "~/class/customer.class";
import CustomerClass from "~/class/customer.class";
import customerLimitModels from "~/models/customer_limit";
import {now} from "~/utils/helper";

function modelsToClass(models: any) {
    return {
        id: models.id,
        store_id: models.store_id,
        vipTierId: models.vip_tier_id,
        dob: models.dob,
        pointBalance: models.point_balance,
        pointEarn: models.point_earn,
        pointSpent: models.point_spent,
        lastEarnPoint: models.last_used_point,
        lastUsedPoint: models.last_used_point,
        vipPoint: models.vip_point as VipPointType,
        createdAt: models.createdAt,
        status: models.status,
    } as CustomerType
}

export async function addCustomers(customers: any) {
    await CustomerModel.insertMany(customers);
}

export function addCustomer(payload: any, storeId: string) {
    const customerData = {
        id: payload.id,
        store_id: storeId,
        name: payload.displayName as string,
        email: payload.email,
        phone: payload.phone !== null ? payload.phone as string : undefined,
        address: payload.addresses.longitude !== null && payload.addresses.latitude !== null ? `{${payload.addresses.longitude as string}, ${payload.addresses.latitude as string}}` : undefined,
        image: payload.image.url as string,
        dob: undefined,
        reward: undefined,
        vipTierId: undefined,
        pointBalance: 0,
        pointEarn: 0,
        pointSpent: 0,
        lastEarnPoint: now(),
        lastUsedPoint: now(),
        vipPoint: {
            point: 0,
            money_spent: 0,
        } as VipPointType,
        status: true,
        createdAt: now(),
    } as CustomerType;

    const customer = new CustomerClass(customerData);
    customer.save().then(r =>
        console.log(`Customer ${customer.id} is created successfully`)
    )
}

export async function getCustomer(shopifyData: any, storeId: string): Promise<CustomerClass | null> {
    if (shopifyData?.id) {
        const customer = await CustomerModel.findOne({id: shopifyData?.id});
        if (customer) {
            return new CustomerClass({
                id: shopifyData.id as string,
                store_id: storeId,
                name: shopifyData.displayName as string,
                email: shopifyData.email as string,
                phone: shopifyData.phone !== null ? shopifyData.phone as string : undefined,
                image: shopifyData.image.url as string,
                address: shopifyData.addresses.longitude !== null && shopifyData.addresses.latitude !== null ? `{${shopifyData.addresses.longitude as string}, ${shopifyData.addresses.latitude as string}}` : undefined,
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
                createdAt: customer.createdAt,
                status: customer.status,
            } as CustomerType)
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export async function getCustomerList(storeId: string, sort: string = 'point_balance', limit: number = 8, page: number = 0, reverse: number = 1, skip: number = 0) {

    const mongooseList = await CustomerModel.find({
        store_id: storeId,
    }, null, {
        lean: true,
        sort: {[sort]: reverse},
        limit: limit + 1,
        skip: skip,
    });

    if (mongooseList === undefined || mongooseList === null) {
        return {
            customers: [] as CustomerType[],
            pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
            }
        }
    } else {

        if (mongooseList.length > 0 && mongooseList.length === limit + 1) {
            mongooseList.pop();

            return {
                customers: mongooseList.map<CustomerType>((c) => modelsToClass(c)) as CustomerType[],
                pageInfo: {
                    hasNextPage: true,
                    hasPreviousPage: skip > 0,
                }
            }
        } else {

            return {
                customers: mongooseList.map<CustomerType>((c) => modelsToClass(c)) as CustomerType[],
                pageInfo: {
                    hasNextPage: false,
                    hasPreviousPage: skip > 0,
                }
            }
        }

    }
}

export async function getCustomerLimit(storeId: string, customerId: string, programId: string) {
    const mongooseList = await customerLimitModels.findOne({
        customer_id: customerId,
        store_id: storeId,
        program_id: programId
    }, null, {lean: true}) as any;

    if (mongooseList === undefined || mongooseList === null) {
        return null;
    } else {
        return mongooseList.usage as number;
    }
}

export async function updateCustomerLimit(storeId: string, customerId: string, programId: string, usage: number) {
    await customerLimitModels.findOneAndUpdate({
        customer_id: customerId,
        store_id: storeId,
        program_id: programId
    }, {usage: usage}, {
        returnDocument: "after",
        new: true,
        lean: true,
        upsert: true,
    })
}
