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
