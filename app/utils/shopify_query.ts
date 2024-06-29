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
