import type {ActionFunctionArgs} from "@remix-run/node";
import {authenticate} from "~/shopify.server";
import db from "../db.server";
import {customerQuery, shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import {getCustomer} from "~/server/server.customer";
import Store from "~/class/store.class";
import Customer from "~/class/customer";
import {ProgramHandler} from "~/server/server.webhook.order_paid";

export const action = async ({request}: ActionFunctionArgs) => {
    const {topic, shop, session, admin, payload} = await authenticate.webhook(request);

    if (!admin) {
        // The admin context isn't returned if the webhook fired after a shop was uninstalled.
        throw new Response();
    }

    // The topics handled here should be declared in the shopify.home.toml.
    // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
    switch (topic) {
        case "APP_UNINSTALLED":
            if (session) {
                await db.session.deleteMany({where: {shop}});
            }

            break;
        case "ORDERS_PAID":
            console.log("--Webhook ORDERS_PAID triggers--");
            if (session && payload.customer.id) {
                const response = await admin.graphql(`
                query MyQuery {
                    ${shopQuery}
                    ${customerQuery('gid://shopify/Customer/' + payload.customer.id)}
                }`
                );
                const {data} = await response.json();
                const store = await getStore(data.shop);
                const customer = await getCustomer(data.customer, data.shop.id);
                if (store instanceof Store && customer instanceof Customer) {
                    if (await ProgramHandler(store, customer, parseFloat(payload.subtotal_price))) {
                        console.log(`--Webhook ORDERS_PAID executed successfully--`);
                    } else {
                        console.log(`--Webhook ORDERS_PAID executed with ERROR--`);
                    }
                } else {
                    console.log(`--Invalid Webhook--`);
                }
            }
            break;
        case "PRODUCTS_UPDATE":
            console.log("--Webhook PRODUCTS_UPDATE triggers--");
            break;
        case "CUSTOMERS_DATA_REQUEST":
            break;
        case "CUSTOMERS_REDACT":
            break;
        case "SHOP_REDACT":
            break;
        default:
            console.log('Unhandled webhook topic');
            throw new Response("Unhandled webhook topic", {status: 404});
    }

    throw new Response();
};
