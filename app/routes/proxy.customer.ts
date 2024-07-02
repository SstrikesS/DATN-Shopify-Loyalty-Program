import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {authenticate} from "~/shopify.server";
import {customerQuery, shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import Store from "~/class/store.class";
import {getCustomer} from "~/server/server.customer";
import Customer from "~/class/customer";

export async function loader({request}: LoaderFunctionArgs) {
    const {admin} = await authenticate.public.appProxy(request);
    const url = new URL(request.url);
    const customer_id = url.searchParams.get('customer_id') !== null ? url.searchParams.get('logged_in_customer_id') : undefined;
    if (customer_id && admin) {
        const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
            ${customerQuery(customer_id)}
        }`
        );
        const {data} = await response.json();
        const store = await getStore(data.shop);
        const customer = await getCustomer(data.customer,data.shop.id);
        if (store instanceof Store && customer instanceof Customer) {

            return json({
                data: {
                    customer: customer,
                },
            })
        } else {

            return json({
                data: null,
            })
        }
    }
}

export async function action ({request}: ActionFunctionArgs) {
    const {admin} = await authenticate.public.appProxy(request);
    const url = new URL(request.url);
    const customer_id = url.searchParams.get('customer_id') !== null ? url.searchParams.get('logged_in_customer_id') : undefined;
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

            return json({
                data: {
                    customer: customer,
                },
            })
        } else {

            return json({
                data: null,
            })
        }
    }
}
