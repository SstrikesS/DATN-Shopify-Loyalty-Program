import {
    Page, MediaCard, Card, BlockStack, Text, Box, Layout
} from "@shopify/polaris";
import {useLoaderData, useNavigate} from "@remix-run/react";
import React, {useEffect, useState} from "react";
import type {LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {authenticate} from "~/shopify.server";
import {shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import Store from "~/class/store.class";
import {getCustomerList} from "~/server/server.customer";
import {subWeeks} from "date-fns";

export async function loader({request}: LoaderFunctionArgs) {
    const {admin} = await authenticate.admin(request);

    const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
        }`
    );
    const {data} = await response.json();
    const store = await getStore(data.shop);
    const customerList = await getCustomerList(data.shop.id);
    const last_7_day_customer_add = customerList.customers.filter((r) => {
        const now = new Date();
        const last_week = subWeeks(now, 1);
        return new Date(r.createdAt).valueOf() > last_week.valueOf()
    })
    if (store instanceof Store) {

        return json({
            data: {
                totalSale: store.totalSale,
                totalEarn: store.totalEarn,
                pointTransaction: store.pointTransaction,
                customerTotal: customerList ? customerList.customers.length : 0,
                last_7_day_customer_add: last_7_day_customer_add ? last_7_day_customer_add.length : 0,
                orderCount: store.orderCount,
                shopId: store.id,
            }
        })
    } else {
        return json({
            data: null,
        })
    }

}

export default function Programs() {
    const [publicPath, setPublicPath] = useState('');
    const {data} = useLoaderData<typeof loader>();
    useEffect(() => {
        setPublicPath(window.location.protocol + "//" + window.location.host)
    }, [])

    const navigate = useNavigate();


    return (
        <div>
            <Page title="Programs">
                <Layout>
                    <Layout.Section variant="oneHalf">
                        <div>
                            <MediaCard
                                title="Points"
                                primaryAction={{
                                    content: "Setup",
                                    onAction: () => {
                                        navigate('../program/points');
                                    },
                                }}
                                description="Create ways your customers can earn points and use points"
                            >
                                <img
                                    alt=""
                                    width="100%"
                                    height="100%"
                                    style={{
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                    }}
                                    src={publicPath + "/points_program.jpg"}
                                />
                            </MediaCard>
                        </div>
                    </Layout.Section>
                    <Layout.Section variant="oneHalf">
                        <div>
                            <MediaCard
                                title="VIP Tiers"
                                primaryAction={{
                                    content: "Setup",
                                    onAction: () => {
                                        navigate('../program/vips');
                                    },
                                }}
                                description="Offer exclusive rewards for your loyal customers. VIP is a great option to reward your best customers through increasing rewards, statuses, and perks."
                            >
                                <img
                                    alt=""
                                    width="100%"
                                    height="100%"
                                    style={{
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                    }}
                                    src={publicPath + "/vip_program.jpg"}
                                />
                            </MediaCard>
                        </div>
                    </Layout.Section>
                    {/*<div>*/}
                    {/*    <MediaCard*/}
                    {/*        title="Referral"*/}
                    {/*        primaryAction={{*/}
                    {/*            content: "Setup",*/}
                    {/*            onAction: () => {*/}
                    {/*            },*/}
                    {/*        }}*/}
                    {/*        description="Grow your customer list and instantly increase sales and reward them for referring their friends and encouraging them to try out your brand."*/}
                    {/*    >*/}
                    {/*        <img*/}
                    {/*            alt=""*/}
                    {/*            width="100%"*/}
                    {/*            height="100%"*/}
                    {/*            style={{*/}
                    {/*                objectFit: 'cover',*/}
                    {/*                objectPosition: 'center',*/}
                    {/*            }}*/}
                    {/*            src={publicPath + "/referral_program.jpg"}*/}
                    {/*        />*/}
                    {/*    </MediaCard>*/}
                    {/*</div>*/}
                </Layout>
            </Page>
            <Page title="Performance"
                  subtitle="Here’s what’s happening in your reward programs"
            >
                <Layout>
                    <Layout.Section variant="oneThird">
                        <Card>
                            <Box padding="200">
                                <BlockStack gap="200">
                                    <Text variant="bodyMd" as="h6">
                                        Total sale with Loyalty program reward
                                    </Text>
                                    <Text variant="headingLg" as="h1">
                                        ${data?.totalSale.toFixed(2)}
                                    </Text>
                                    <Text variant="bodyMd" as="h6">
                                        Total earn with Loyalty program reward
                                    </Text>
                                    <Text variant="headingLg" as="h1">
                                        ${data?.totalEarn.toFixed(2)}
                                    </Text>
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneThird">
                        <Card>
                            <Box padding="200">
                                <BlockStack gap="200">
                                    <Text variant="bodyMd" as="h6">
                                        Total orders with Loyalty program reward
                                    </Text>
                                    <Text variant="headingLg" as="h1">
                                        {data?.orderCount ? data?.orderCount  > 1 ? `${data?.orderCount} Orders` : `${data?.orderCount} Order`: `0 Order`}
                                    </Text>
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneThird">
                        <Card>
                            <Box padding="200">
                                <BlockStack gap="200">
                                    <Text variant="bodyMd" as="h6">
                                        Total memberships with Loyalty program
                                    </Text>
                                    <Text variant="headingLg" as="h1">
                                        {data?.customerTotal ? data?.customerTotal > 1 ? `${data?.customerTotal} Customers` : `${data?.customerTotal} Customer` : `0 Customer`}
                                    </Text>
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneHalf">
                        <Card>
                            <Box padding="200">
                                <BlockStack gap="200">
                                    <Text variant="headingLg" as="h1">
                                        Members
                                    </Text>
                                    <Text variant="bodyMd" as="h6">
                                        Gain insights into your membership growth over time for more effective marketing
                                        campaigns that promote signups.
                                    </Text>
                                    <Text variant="headingMd" as="h2">
                                        Members added last 7 days
                                    </Text>
                                    <Text variant="headingLg" as="h2">
                                        {data?.last_7_day_customer_add ? data?.last_7_day_customer_add > 1 ? `${data?.last_7_day_customer_add} Customers` : `${data?.last_7_day_customer_add} Customer` : `0 Customer`}
                                    </Text>

                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneHalf">
                        <Card>
                            <Box padding="200">
                                <BlockStack gap="200">
                                    <Text variant="headingLg" as="h1">
                                        Points transactions
                                    </Text>
                                    <Text variant="bodyMd" as="h6">
                                        Encourage profitable actions by increasing engagement with your points program.
                                    </Text>
                                    <Text variant="headingMd" as="h2">
                                        Total points transactions
                                    </Text>
                                    <Text variant="headingLg" as="h2">
                                        {data?.pointTransaction ? data?.pointTransaction > 1 ? `${data?.pointTransaction} Transactions` : `${data?.pointTransaction} Transaction` : `0 Transaction`}
                                    </Text>
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </div>
    )
}

