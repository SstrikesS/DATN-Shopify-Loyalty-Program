import type {LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {authenticate} from "~/shopify.server";
import {customerQuery, shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import Store from "~/class/store.class";
import {getCustomer} from "~/server/server.customer";
import CustomerClass from "~/class/customer.class";
import {getCustomerRewards} from "~/server/server.reward";
import {getSpecificCustomerRedeemPointProgram} from "~/server/server.redeem_point";
import {getSpecificCustomerEarnPointProgram} from "~/server/server.earn_point";
import {getSpecificCustomerVipTier} from "~/server/server.tier";

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
            if (store instanceof Store && customer instanceof CustomerClass) {
            const rewards = await getCustomerRewards(data.customer);
            const redeemPrograms = await getSpecificCustomerRedeemPointProgram(data.shop.id, data.customer.id);
            const earnPointPrograms = await getSpecificCustomerEarnPointProgram(data.shop.id, data.customer.id);
            const vipTiers = await getSpecificCustomerVipTier(data.shop.id, customer.vipTierId);

            return json({
                data: {
                    store: store,
                    customer: customer,
                    rewards: rewards,
                    redeemPrograms: redeemPrograms,
                    earnPointPrograms: earnPointPrograms,
                    vipTiers: vipTiers,
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
