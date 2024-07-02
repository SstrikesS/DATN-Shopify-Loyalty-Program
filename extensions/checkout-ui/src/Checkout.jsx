import {
    reactExtension,
    BlockStack,
    SkeletonText,
    Heading,
    Divider,
    InlineLayout,
    SkeletonImage,
    Button, Image,
    useAppMetafields,
    Text,
    useApplyDiscountCodeChange,
} from '@shopify/ui-extensions-react/checkout';
import {useEffect, useState} from "react";
import {parseISO} from "date-fns";

export default reactExtension(
    'purchase.checkout.reductions.render-after',
    () => <Extension/>,
);

function Extension() {
    const [isFetching, setIsFetching] = useState(true);
    const [reward, setReward] = useState([]);
    const [adding, setAdding] = useState(false);
    const appMetafields = useAppMetafields();
    const applyDiscountCodeChange = useApplyDiscountCodeChange()

    const handleDiscountCodeAdd = async (code) => {
        setAdding(true);
        const result = await applyDiscountCodeChange({
            type: "addDiscountCode",
            code: code,
        })
        setAdding(false);
        if (result.type === 'error') {
            console.log(result.message);
        }
    }

    useEffect(() => {
        if (appMetafields.length > 0) {
            const today = new Date().valueOf();
            const array1 = JSON.parse(appMetafields[0].metafield.value);
            const array2 = array1.filter((item) => {
                const endsAt = item.expiry_at ? parseISO(item.expiry_at).valueOf() : 0;

                return (endsAt > today || endsAt === 0) && item.used === false
            })
            console.log(array2);
            setReward(array2);
            // console.log(JSON.parse(appMetafields[0].metafield.value));
        }
        setIsFetching(false);
    }, [appMetafields]);

    if (isFetching) {
        return (
            <BlockStack spacing='loose'>
                <Divider/>
                <Heading level={2}>You might also like</Heading>
                <BlockStack spacing='loose'>
                    <InlineLayout
                        spacing='base'
                        columns={[64, 'fill', 'auto']}
                        blockAlignment='center'
                    >
                        <SkeletonImage aspectRatio={1}/>
                        <BlockStack spacing='none'>
                            <SkeletonText inlineSize='large'/>
                            <SkeletonText inlineSize='small'/>
                        </BlockStack>
                        <Button kind='secondary' disabled={true}
                        >
                            Apply
                        </Button>
                    </InlineLayout>
                </BlockStack>
            </BlockStack>
        )
    } else {
        return (
            <BlockStack spacing='loose'>
                <Divider/>
                <Heading
                    level={2}>{reward.length > 0 ? 'Your available coupons' : 'You don\'t have any coupons yet!'}</Heading>
                {reward.map((item, index) => (
                    <BlockStack spacing='loose' key={index}>
                        <BlockStack spacing='loose'>
                            <InlineLayout
                                spacing='base'
                                columns={[64, 'fill', 'auto']}
                                blockAlignment='center'
                            >
                                <Image
                                    fit
                                    border='base'
                                    borderWidth='base'
                                    borderRadius='loose'
                                    source='https://cdn-icons-png.flaticon.com/128/1288/1288575.png'
                                    description={item.title}
                                    aspectRatio={1}/>
                                <BlockStack spacing='none'>
                                    <Text size='medium' emphasis='strong'>
                                        {item.title}
                                    </Text>
                                    <Text appearance='subdued'>
                                        {item.code}
                                    </Text>
                                </BlockStack>
                                <Button
                                    kind='secondary'
                                    loading={adding}
                                    onPress={() => handleDiscountCodeAdd(item.code)}
                                >
                                    Apply
                                </Button>
                            </InlineLayout>
                        </BlockStack>
                    </BlockStack>
                ))}
            </BlockStack>
        )
    }
}
