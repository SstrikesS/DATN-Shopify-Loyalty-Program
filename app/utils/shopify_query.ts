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
