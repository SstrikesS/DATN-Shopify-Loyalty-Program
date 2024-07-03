import {CombineWithType, discountCodeBasicCreateQueryType} from "~/class/redeem_point.class";
import {RewardDataType} from "~/class/reward.class";
import {escapeJsonString} from "~/utils/helper";

export const shopQuery =
    `
    shop {
        id
        name
        url
        myshopifyDomain
        plan {
            displayName
            partnerDevelopment
            shopifyPlus
        }
    }
`

export const collectionQuery =
`
    collections(first: 100) {
        edges {
            node {
               id
               title
            }
            cursor
        }
        pageInfo {
            hasNextPage
        }
    }
`

export const customersQuery =
`
    customers(first: 100, query: "state:ENABLED") {
        nodes {
            displayName
            addresses {
                longitude
                latitude
            }
            email
            id
            phone
            image {
                url
            }
        }
    }
`

export const customerQuery = (id: string) =>
`
    customer(id: "${id}") {
        metafield(key: "reward", namespace: "customer.reward") {
            value
        }
        displayName
        addresses {
            longitude
            latitude
        }
        email
        id
        phone
        image {
            url
        }
    }
`

export const rewardMetafieldGet = (customerId: string) =>
`
    customer(id: "${customerId}") {
        metafield(key: "reward", namespace: "customer.reward") {
            value
        }
    }
`

export const rewardMetafieldCreate = (customerId: string, value: RewardDataType[]) =>
`
    metafieldsSet(
        metafields: {
        ownerId: "${customerId}",
        key: "reward",
        value: "${escapeJsonString(JSON.stringify(value))}",
        namespace: "customer.reward",
        type: "json"
    }) {
        userErrors {
            code
            elementIndex
            field
            message
        }
        metafields {
            createdAt
            id
            key
            namespace
            value
            type
        }
    }

`

export const discountCodeBasicCreate = (query : discountCodeBasicCreateQueryType, code: string, title: string, customerId: string, type : 'DiscountCodeBasicAmount' | 'DiscountCodeBasicPercentage' = 'DiscountCodeBasicAmount' ) =>
`
    discountCodeBasicCreate(
        basicCodeDiscount: {
            appliesOncePerCustomer: true,
            code: "${code}",
            combinesWith: {
                shippingDiscounts: ${query.combinesWith.shippingDiscounts},
                productDiscounts: ${query.combinesWith.productDiscounts},
                orderDiscounts: ${query.combinesWith.orderDiscounts}
            },
            customerGets: {
                appliesOnOneTimePurchase: true,
                items: {
                    ${query.customerGets.all ? `all: true` :
                    `collections: {
                        add: [${query.customerGets.collection?.map(id => `"${id}"`).join(', ')}],
                    }`}
                },
                value: {
                    ${type === 'DiscountCodeBasicPercentage' ? `percentage: ${query.customerGets.value/100}` :
                    `discountAmount: {
                        amount: "${query.customerGets.value}",
                        appliesOnEachItem: false
                    }`}
                }
            },
            customerSelection: {
                all: false,
                customers: {
                    add: "${customerId}"
                }
            },
            ${query.minimumQuantity && query.minimumPercentage?
            `minimumRequirement: {
            ${query.minimumQuantity ?
                `quantity: {
                    greaterThanOrEqualToQuantity: "${query.minimumQuantity}"
                }`:
                `quantity: {
                    greaterThanOrEqualToSubtotal: "${query.minimumPercentage}"
                }`}
            },`
            : ''}
            title: "${title}",
            usageLimit: 1,
            ${query.endsAt? `endsAt: "${query.endsAt.toISOString()}",` : ''}
            startsAt: "${query.startsAt.toISOString()}"
        }
    ) {
        codeDiscountNode {
            codeDiscount {
                ... on DiscountCodeBasic {
                    endsAt
                    createdAt
                    discountClass
                    hasTimelineComment
                    minimumRequirement {
                        ... on DiscountMinimumSubtotal {
                            __typename
                            greaterThanOrEqualToSubtotal {
                                amount
                            }
                        }
                        ... on DiscountMinimumQuantity {
                            __typename
                            greaterThanOrEqualToQuantity
                        }
                    }
                    startsAt
                    status
                    title
                    customerGets {
                        value {
                            ... on DiscountAmount {
                                __typename
                                amount {
                                    amount
                                }
                            }
                             ... on DiscountPercentage {
                                 __typename
                                 percentage
                             }
                        }
                        items {
                            ... on DiscountCollections {
                                __typename
                                collections(first: 100) {
                                    nodes {
                                        id
                                    }
                                }
                            }
                            ... on AllDiscountItems {
                                __typename
                                allItems
                            }
                        }
                    }
                    combinesWith {
                        orderDiscounts
                        productDiscounts
                        shippingDiscounts
                    }
                    codes(first: 1) {
                        nodes {
                            code
                        }
                    }
                }
            }
            id
        }
        userErrors {
            code
            extraInfo
            field
            message
        }
    }
`
