import {
    Badge,
    BlockStack, Box, Button,
    Card, EmptySearchResult, InlineStack,
    Page, ResourceItem, ResourceList, SkeletonBodyText, SkeletonDisplayText, SkeletonThumbnail, Text, TextField,
} from "@shopify/polaris";
import {useCallback, useEffect, useState} from "react";
import {authenticate} from "~/shopify.server";
import {useFetcher, useLoaderData} from "@remix-run/react";
import {json} from "@remix-run/node";
import type {LoaderFunctionArgs} from "@remix-run/node";
import {customerListQuery, shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import Store from "~/class/store.class";
import {getCustomerList} from "~/server/server.customer";
import {getTiers} from "~/server/server.tier";

const GLOBAL_QUERY_LIMIT = 8;

export async function loader({request}: LoaderFunctionArgs) {
    const {admin} = await authenticate.admin(request);
    const url = new URL(request.url);
    let sort = url.searchParams.get('sort') !== null ? url.searchParams.get('sort') as string : 'point_balance';
    let limit = url.searchParams.get('limit') !== null ? parseInt(url.searchParams.get('limit') as string) : GLOBAL_QUERY_LIMIT;
    let page = url.searchParams.get('page') !== null ? parseInt(url.searchParams.get('page') as string) : 1;
    let reverse = url.searchParams.get('reverse') !== null ? url.searchParams.get('reverse') === 'true' ? -1 : url.searchParams.get('reverse') === 'false' ? 1 : -1 : -1;
    let skip = page && limit ? limit * (page - 1) : 0;
    // console.log(sort, limit, page, reverse, skip);

    const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
        }`
    );
    const {data} = await response.json();
    const store = await getStore(data.shop);

    if (store instanceof Store) {
        const customerList = await getCustomerList(store.id, sort, limit, page, reverse, skip)
        // console.log(customerList);
        const vipTierList = await getTiers(store.id);
        const query = customerList.customers.map(customer => `id:${customer.id.split('gid://shopify/Customer/')[1]}`).join(' OR ')

        const responseQuery = await admin.graphql(`
        #graphql
            ${customerListQuery(limit, query)}
        `);
        const responseQueryJson = await responseQuery.json();

        const shopifyMap = new Map(responseQueryJson.data.customers.edges.map((item: any) => [item.node.id, item.node]));
        const customerData = customerList.customers.map(item1 => {
            const item2 = shopifyMap.get(item1.id) as any;
            return item2 ? {
                ...item1,
                name: item2.displayName as string,
                email: item2.email as string,
                phone: item2.phone !== null ? item2.phone as string : undefined,
                image: item2.image.url as string,
                address: item2.addresses.longitude !== null && item2.addresses.latitude !== null ? `{${item2.addresses.longitude as string}, ${item2.addresses.latitude as string}}` : undefined,
            } : item1;
        });

        return json({
            data: {
                customers: customerData,
                shopId: store.id,
                shopDomain: store.myshopifyDomain,
                vipTiers: vipTierList,
                pageInfo: customerList.pageInfo
            }
        })
    } else {
        return json({data: null});
    }
}

export default function CustomerPage() {
    const {data} = useLoaderData<typeof loader>();
    const fetcher = useFetcher<typeof loader>();
    const [customerData, setCustomerData] = useState(data?.customers);
    const [pageInfo, setPageInfo] = useState(data?.pageInfo);
    const [page, setPage] = useState(1);
    const [isFetching, setIsFetching] = useState(true);
    const [sortValue, setSortValue] = useState('pointBalance-ASC');
    // const [queryValue, setQueryValue] = useState('');
    const sortValueChangeHandler = useCallback((newValue: string) => {
        setSortValue(newValue);
        const sort = newValue.split('-');
        const reverse = sort[1] === 'DESC';
        fetcher.load(`./?limit=${GLOBAL_QUERY_LIMIT}&sort=${sort[0]}&reverse=${reverse}&page=${page}`)
        setIsFetching(true);

    }, []);

    const handleNextPage = () => {
        const sort = sortValue.split('-');
        const reverse = sort[1] === 'DESC';
        const newPage = page + 1
        fetcher.load(`./?limit=${GLOBAL_QUERY_LIMIT}&sort=${sort[0]}&reverse=${reverse}&page=${newPage}`)
        setIsFetching(true);
        setPage((prevState) => {
            return (prevState + 1)
        })
    }

    const handlePreviousPage = () => {
        const sort = sortValue.split('-');
        const reverse = sort[1] === 'DESC';
        const newPage = page - 1
        fetcher.load(`./?limit=${GLOBAL_QUERY_LIMIT}&sort=${sort[0]}&reverse=${reverse}&page=${newPage}`)
        setIsFetching(true);
        setPage((prevState) => {
            return (prevState - 1)
        })
    }

    useEffect(() => {
        console.log('fetcher');
        const data = fetcher.data
        if (data !== undefined && data !== null) {
            console.log('fetcher data: ', data);
            if (data.data?.customers !== undefined && data.data?.customers !== null) {
                setCustomerData(data.data?.customers);
            }
            if (data.data?.pageInfo !== undefined && data.data?.pageInfo !== null) {
                setPageInfo(data.data?.pageInfo);
            }
            setIsFetching(false);
        }
    }, [fetcher?.data])

    useEffect(() => {
        if (customerData !== null && customerData !== undefined && customerData?.length > 0) {
            setIsFetching(false)
        }
    }, [customerData]);


    const emptyStateMarkup =
        <EmptySearchResult
            title={'No customers yet'}
            description={'Try changing the filters or search term'}
            withIllustration
        />

    const fetchStateMarkup = <InlineStack gap="200" align='start'>
        <Box width='100%'>
            <InlineStack gap="200" align='center'>
                <Box width="10%">
                    <SkeletonThumbnail/>
                </Box>
                <Box width='75%' paddingBlock='200'>
                    <SkeletonBodyText/>
                </Box>
                <Box width="10%" paddingBlock='400'>
                    <SkeletonDisplayText/>
                </Box>
            </InlineStack>
        </Box>
    </InlineStack>

    return (
        <Page title="Customer">
            <Card>
                <BlockStack gap="100">
                    <TextField
                        label="Search"
                        autoComplete="off"
                    >
                    </TextField>
                    {isFetching ?
                        <BlockStack gap="200">
                            {fetchStateMarkup}
                            {fetchStateMarkup}
                            {fetchStateMarkup}
                            {fetchStateMarkup}
                            {fetchStateMarkup}
                        </BlockStack>
                        :
                        <ResourceList
                            emptyState={emptyStateMarkup}
                            items={customerData ? customerData : []}
                            showHeader={true}
                            sortValue={sortValue}
                            sortOptions={[
                                {label: 'Most Points', value: 'point_balance-DESC'},
                                {label: 'Less Points', value: 'point_balance-ASC'},
                            ]}
                            onSortChange={sortValueChangeHandler}
                            pagination={{
                                hasNext: pageInfo?.hasNextPage,
                                hasPrevious: pageInfo?.hasPreviousPage,

                                label: `${page}`,
                                onNext: handleNextPage,
                                onPrevious: handlePreviousPage,
                            }}
                            renderItem={(item) => {
                                const media = <img style={{
                                    width: "32px", height: "32px"
                                }} src={item.image} alt=""/>;
                                return (
                                    <InlineStack gap="200" align='start'>
                                        <Box width='80%'>
                                            <ResourceItem
                                                id={item.id}
                                                url="#"
                                                media={media}
                                                accessibilityLabel={`View details for ${item.name}`}
                                            >
                                                <InlineStack gap="200" align='center'>
                                                    <Box width="30%">
                                                        <Text variant="bodyMd" fontWeight="bold" as="h6" truncate>
                                                            {item.name}
                                                        </Text>
                                                        <Text as="h6" variant="bodyMd" truncate>
                                                            {item.email}
                                                        </Text>
                                                    </Box>
                                                    <Box width="15%" paddingBlock='200'>
                                                        <InlineStack align='center'>
                                                            {item.status === false ?
                                                                <Badge tone="info">Guest</Badge> :
                                                                item.status === true ?
                                                                    <Badge tone="success">Member</Badge> :
                                                                    <Badge tone="critical">Unknown</Badge>
                                                            }
                                                        </InlineStack>
                                                    </Box>
                                                    <Box width="15%" paddingBlock='200'>
                                                        <Text as="h6" variant="bodyMd" alignment="center">
                                                            {item.pointBalance} Points
                                                        </Text>
                                                    </Box>
                                                    <Box width="15%" paddingBlock='200'>
                                                        <Text as="h6" variant="bodyMd" alignment="center">

                                                            {(() => {
                                                                const tier = data?.vipTiers?.find(t => t.id === item.vipTierId);

                                                                return tier ? tier.name : 'No Vip Tier';
                                                            })()}
                                                        </Text>
                                                    </Box>
                                                </InlineStack>
                                            </ResourceItem>
                                        </Box>
                                        <Box width="15%" paddingBlock='400'>
                                            <InlineStack align='center'>
                                                <a href={`https://admin.shopify.com/store/${data?.shopDomain}/customers/${item.id.split(`gid://shopify/Customer/`)[1]}`}
                                                   target="_blank" rel="noopener noreferrer">
                                                    <Button>View on Shopify</Button>
                                                </a>
                                            </InlineStack>
                                        </Box>
                                    </InlineStack>
                                )
                            }}
                        >
                        </ResourceList>
                    }
                </BlockStack>
            </Card>
        </Page>
    )
}
