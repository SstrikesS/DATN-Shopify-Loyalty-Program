import "@shopify/shopify-app-remix/adapters/node";
import {
    ApiVersion,
    AppDistribution,
    shopifyApp,
} from "@shopify/shopify-app-remix/server";
import {PrismaSessionStorage} from "@shopify/shopify-app-session-storage-prisma";
import {restResources} from "@shopify/shopify-api/rest/admin/2024-04";
import prisma from "./db.server";
import * as mongoose from "mongoose";
import {Agenda} from "agenda";

const shopify = shopifyApp({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    apiVersion: ApiVersion.April24,
    scopes: process.env.SCOPES?.split(","),
    appUrl: process.env.SHOPIFY_APP_URL || "",
    authPathPrefix: "/auth",
    sessionStorage: new PrismaSessionStorage(prisma),
    distribution: AppDistribution.AppStore,
    restResources,
    future: {
        unstable_newEmbeddedAuthStrategy: true,
    },
    ...(process.env.SHOP_CUSTOM_DOMAIN
        ? {customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN]}
        : {}),
});
export const dbConnectionString = "mongodb+srv://admin:20194677@cluster0.tytl7jo.mongodb.net/datn-2024?retryWrites=true&w=majority";
export const agenda = new Agenda({
    db: {
        address: dbConnectionString,
        collection: 'agendaJobs',
    }
});
mongoose.set("debug", true);
mongoose.set("debug", {color: true});
mongoose
    .connect(dbConnectionString)
    .then(() => {
        console.log("Connect to mongodb successfully");
        agenda.start().then(() => {
            console.log("Agenda is listening");
        }).catch((err) => {
            console.error(err);
        });
    })
    .catch((err) => {
        console.log("Error occurred when connect to mongodb: ", err.message);
    });

export default shopify;
export const apiVersion = ApiVersion.April24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
