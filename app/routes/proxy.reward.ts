import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {authenticate} from "~/shopify.server";
import {customerQuery, rewardMetafieldCreate, rewardMetafieldGet, shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import Store from "~/class/store.class";
import {getCustomer} from "~/server/server.customer";
import Customer from "~/class/customer";
import {getCustomerRewards} from "~/server/server.reward";
import {getRedeemPointProgram} from "~/server/server.redeem_point";
import {RedeemPoint} from "~/class/redeem_point.class";
import type { RewardDataType} from "~/class/reward.class";
import {RewardClass} from "~/class/reward.class";

export async function loader({request}: LoaderFunctionArgs) {
    const {admin} = await authenticate.public.appProxy(request);
    const url = new URL(request.url);
    const customer_id = url.searchParams.get('logged_in_customer_id') !== null ? `gid://shopify/Customer/${url.searchParams.get('logged_in_customer_id')}` : undefined;
    if (customer_id && admin) {
        const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
            ${customerQuery(customer_id)}
        }`
        );
        const {data} = await response.json();
        const store = await getStore(data.shop);
        const customer = await getCustomer(data.customer, data.shop.id);
        if (store instanceof Store && customer instanceof Customer) {
            const rewards = await getCustomerRewards(data.customer);

            return json({
                data: {
                    store: store,
                    customer: customer,
                    rewards: rewards,
                },
            })
        } else {

            return json({
                data: null,
            })
        }
    } else {

        return json({
            data: null,
        })
    }
}

export async function action({request}: ActionFunctionArgs) {
    const {admin} = await authenticate.public.appProxy(request);
    const url = new URL(request.url);
    const customer_id = url.searchParams.get('logged_in_customer_id') !== null ? `gid://shopify/Customer/${url.searchParams.get('logged_in_customer_id')}` : undefined;
    const redeem_program_id = url.searchParams.get('redeem_program_id') !== null ? url.searchParams.get('redeem_program_id') : undefined;
    if (customer_id && admin && redeem_program_id) {
        const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
            ${customerQuery(customer_id)}
        }`
        );
        const {data} = await response.json();
        const store = await getStore(data.shop);
        const customer = await getCustomer(data.customer, data.shop.id);
        const redeemProgramData = await getRedeemPointProgram(data.shop.id, redeem_program_id);
        if (store instanceof Store && customer instanceof Customer && redeemProgramData !== null) {
            const redeemProgram = new RedeemPoint(redeemProgramData);
            if (customer.pointBalance >= redeemProgram.pointValue) {
                if (await redeemProgram.checkLimitUsage(customer.id)) {
                    if (store.vipSetting.status && customer.vipTierId !== undefined && customer.vipTierId !== null && !redeemProgram.checkCustomerEligibility(customer.vipTierId)) {
                        console.log(`--Customer ${customer.id} did not meet the eligibility of the program ${redeemProgram.id}--`)

                        return json({
                            success: false,
                            data: null,
                            message: 'Customer not meet eligibility of this program'
                        })
                    } else {
                        //Make query API by Redeem Program Setting
                        const RewardCreateMutation = redeemProgram.queryCreate(customer.id)
                        //Create reward
                        const response = await admin.graphql(`
                        mutation MyMutation {
                            ${RewardCreateMutation}
                        }`
                        );
                        const {data} = await response.json();

                        if (data?.discountCodeBasicCreate?.codeDiscountNode?.id) {
                            //Make reward
                            const rewardData = {
                                id: data?.discountCodeBasicCreate?.codeDiscountNode?.id,
                                programId: redeemProgram.id,
                                customerId: customer.id,
                                status: true,
                                code: data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount?.codes?.nodes[0]?.code,
                                type: redeemProgram.type,
                                title: redeemProgram.name,
                                value: redeemProgram.type === 'DiscountCodeBasicAmount' ? data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount?.customerGets?.value?.amount?.amount :
                                    redeemProgram.type === 'DiscountCodeBasicPercentage' ? data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount?.customerGets?.value?.percentage :
                                        redeemProgram.type === 'DiscountCodeFreeShipping' ? null :
                                            redeemProgram.type === 'DiscountCodeBxgy' ? null :
                                                redeemProgram.type === 'GiftCard' ? null : null,
                                endAt: data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount?.endsAt !== null ? new Date(data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount?.endsAt) : null,
                                startAt: new Date (data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount?.startsAt),
                            } as RewardDataType;
                            //Save to metafield
                            const responseQuery = await admin.graphql(`
                            query MyQuery {
                                ${rewardMetafieldGet(customer.id)}
                            }`
                            );
                            const responseQueryBody = await responseQuery.json();
                            let value: RewardDataType[] = [];
                            if(responseQueryBody.data.customer.metafield.value) {
                                value = JSON.parse(responseQueryBody.data.customer.metafield.value) as RewardDataType[];
                            }
                            value.push(rewardData)

                            const responseMutation = await admin.graphql(`
                            mutation MyMutation {
                                ${rewardMetafieldCreate(customer.id, value)}
                            }`
                            );
                            const responseMutationBody = await responseMutation.json();
                            //Save to mongoDB
                            if(responseMutationBody.data?.metafieldsSet) {
                                const reward = new RewardClass(rewardData);
                                customer.pointBalance = customer.pointBalance - redeemProgram.pointValue;
                                customer.pointSpent = customer.pointSpent + redeemProgram.pointValue;
                                await customer.save().then((r) =>
                                    console.log(`--Update customer ${customer.id} successfully`)
                                );
                                await reward.save().then((r) =>
                                    console.log(`--Update reward successfully--`)
                                )

                                return json({
                                    success: true,
                                    data: {
                                        reward: rewardData,
                                        customer: customer,
                                    },
                                    message: 'Reward was added successfully'
                                })
                            } else {

                                return json({
                                    success: false,
                                    data: null,
                                    message: 'GraphQL Server Error'
                                })
                            }
                        } else {

                            return json({
                                success: false,
                                data: null,
                                message: 'GraphQL Server Error'
                            })
                        }
                    }
                } else {
                    console.log(`--Customer ${customer.id} usage reached the limit of the program ${redeemProgram.id}--`)

                    return json({
                        success: false,
                        data: null,
                        message: 'Customer usage reached the limit'
                    })
                }
            } else {
                console.log(`--Customer ${customer.id} balance do not have enough point to exchange program ${redeemProgram.id}--`)

                return json({
                    success: false,
                    data: null,
                    message: 'Customer balance do not have enough point'
                })
            }
        } else {

            return json({
                success: false,
                data: null,
                message: 'Invalid data'
            })
        }
    } else {

        return json({
            success: false,
            data: null,
            message: 'Invalid request'
        })
    }
}

