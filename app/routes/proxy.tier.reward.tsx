import type { LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {authenticate} from "~/shopify.server";
import {customerQuery, shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import {getCustomer} from "~/server/server.customer";
import Store from "~/class/store.class";
import CustomerClass from "~/class/customer.class";
import {getNextTierReward} from "~/server/server.tier";

export async function loader({request}: LoaderFunctionArgs) {
    const {admin} = await authenticate.public.appProxy(request);
    const url = new URL(request.url);
    const customer_id = url.searchParams.get('logged_in_customer_id') !== null ? `gid://shopify/Customer/${url.searchParams.get('logged_in_customer_id')}` : undefined;
    const reward = url.searchParams.get('rewards') !== null ? JSON.parse(url.searchParams.get('rewards') as string) as string[] : null;
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
        if (store instanceof Store && customer instanceof CustomerClass && reward !== null && reward.length > 0) {
            const nextTierReward = await getNextTierReward(store.id, reward);
            console.log(reward);
            console.log(nextTierReward);

            if(nextTierReward !== null) {
                return json({
                    data: {
                        nextTierReward: nextTierReward,
                    },
                })
            } else {
                return json({
                    data: null
                })
            }

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
