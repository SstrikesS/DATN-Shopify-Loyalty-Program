import type {HeadersFunction, LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {Link, Outlet, useLoaderData, useRouteError} from "@remix-run/react";
import {boundary} from "@shopify/shopify-app-remix/server";
import {AppProvider} from "@shopify/shopify-app-remix/react";
import {NavMenu} from "@shopify/app-bridge-react";
// @ts-ignore
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import {authenticate} from "~/shopify.server";
import {shopQuery} from "~/utils/shopify_query";
import {addNewMemberStore, isMemberStore} from "~/server/server.store";

export const links = () => [{rel: "stylesheet", href: polarisStyles}];

export const loader = async ({request}: LoaderFunctionArgs) => {
    const {admin} = await authenticate.admin(request);

    const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
        }`
    );
    const {data} = await response.json();
    const checkStore = await isMemberStore(data.shop);

    if(!checkStore) {
        await addNewMemberStore(data.shop.id).then(() => {
            console.log(`--Store ${data.shop.id} setup successful--`)
        })
    }

    return json({apiKey: process.env.SHOPIFY_API_KEY || ""});
};

export default function App() {
    const {apiKey} = useLoaderData<typeof loader>();

    return (
        <AppProvider isEmbeddedApp apiKey={apiKey}>
            <NavMenu>
                <Link to="/app" rel="home">
                    Home
                </Link>
                <Link to="/app/programs">Program</Link>
            </NavMenu>
            <Outlet/>
        </AppProvider>
    );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
    return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
    return boundary.headers(headersArgs);
};
