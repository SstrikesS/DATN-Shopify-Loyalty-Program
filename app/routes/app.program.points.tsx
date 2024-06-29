import {
    Badge,
    BlockStack,
    Card,
    Divider,
    Layout,
    Button,
    Page,
    Text,
    ResourceList,
    ResourceItem,
    Icon,
    Modal,
    EmptyState,
    InlineStack,
    TextField,
    RadioButton,
    Select,
    ContextualSaveBar,
    Frame
} from "@shopify/polaris";
import {
    DiscountIcon,
    CashDollarIcon,
    DeliveryIcon,
    ProductIcon,
    GiftCardIcon
} from '@shopify/polaris-icons';
import {authenticate} from "~/shopify.server";
import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {useActionData, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {useCallback, useEffect, useState} from "react";
import type {DefaultIntervalType} from "~/utils/helper";
import {isStringInteger} from "~/utils/helper";
import {shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import {getEarnPointPrograms} from "~/server/server.earn_point";
import {getRedeemPointPrograms} from "~/server/server.redeem_point";
import type {
    discountCodeBasicCreateQueryType,
    RedeemPointType
} from "~/class/redeem_point.class";
import type {PointSetting} from "~/class/store.class";
import Store from "~/class/store.class";


export async function loader({request}: LoaderFunctionArgs) {
    const {admin} = await authenticate.admin(request);

    const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
        }`
    );
    const {data} = await response.json();
    const store = await getStore(data.shop);
    if (store instanceof Store) {
        const earnPointProgramList = await getEarnPointPrograms(store.id);
        const redeemPointProgramList = await getRedeemPointPrograms(store.id);
        // await createEarnPoint()
        return json({
            data: {
                pointProgram: store.pointSetting,
                shopId: store.id,
                earnPointProgramList: earnPointProgramList,
                redeemPointProgramList: redeemPointProgramList,
            }
        })
    } else {
        return json({
            data: null,
        })
    }

}

export async function action({request}: ActionFunctionArgs) {
    const {admin} = await authenticate.admin(request);
    const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
        }`
    );
    const {data} = await response.json();
    const store = await getStore(data.shop);
    if (store instanceof Store) {
        const formData = await request.formData();
        let updateData = {} as PointSetting;
        updateData.currency = {
            plural: formData.get('point_currency_plural') as string,
            singular: formData.get('point_currency_singular') as string,
        }
        if (formData.get('point_expiry_status') === "false") {
            updateData.point_expiry_time = -1;
            updateData.point_expiry_interval = store.pointSetting.point_expiry_interval;
        } else {
            updateData.point_expiry_time = parseInt(formData.get('point_expiry_time') as string)
            updateData.point_expiry_interval = formData.get('point_expiry_interval') as DefaultIntervalType
        }
        updateData.status = formData.get('status') === "true";
        store.pointSetting = updateData;
        await store.saveStore();

        return json({
            success: true,
            message: 'Setting is updated successfully'
        })
    } else {
        return json({
            success: false,
            message: 'Store not found'
        })
    }
}

export default function PointProgram() {
    const {data} = useLoaderData<typeof loader>();
    const [isShowModal, setIsShowModal] = useState(false);
    const [isDataChange, setIsDataChange] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate();
    const submit = useSubmit();
    const actionData = useActionData<typeof action>();
    const [currency, setCurrency] = useState(data?.pointProgram?.currency === undefined ? {
        plural: 'Points',
        singular: 'Point',
    } : {
        plural: data?.pointProgram?.currency.plural,
        singular: data?.pointProgram?.currency.singular,
    })
    const [currencyError, setCurrencyError] = useState<{ plural: undefined | string, singular: undefined | string }>({
        plural: undefined,
        singular: undefined
    });
    const [expiryStatus, setExpiryStatus] = useState(data?.pointProgram?.point_expiry_time === -1 ? 'disable' : 'active')
    const [programStatus, setProgramStatus] = useState(data?.pointProgram.status ? 'program-active' : 'program-disable');
    const [periodUnit, setPeriodUnit] = useState(data?.pointProgram.point_expiry_interval ?? 'month');
    const [periodTime, setPeriodTime] = useState(data?.pointProgram?.point_expiry_time !== -1 ? `${data?.pointProgram?.point_expiry_time}` : "1");
    const [periodTimeError, setPeriodTimeError] = useState<undefined | string>(undefined);


    const currencyChangeHandler = useCallback((newValue: string, _id: string) => {
        setCurrency((prevState) => ({
            ...prevState,
            [_id]: newValue
        }));
        setIsDataChange(true);
    }, []);

    const expiryChangeHandler = useCallback((_newValue: boolean, id: string) => {
        setExpiryStatus(id);
        setIsDataChange(true);
    }, [],);

    const periodTimeChangeHandler = useCallback((value: string) => {
        setPeriodTime(value);
        setIsDataChange(true)
    }, [],);

    const programStatusHandler = useCallback((_newValue: boolean, id: string) => {
        setProgramStatus(id);
        setIsDataChange(true);
    }, [],);

    const periodUnitOptions = [
        {label: 'day(s)', value: 'day'},
        {label: 'week(s)', value: 'week'},
        {label: 'month(s)', value: 'month'},
        {label: 'year(s)', value: 'year'},
    ];

    const handlePeriodUnitSelectChange = useCallback((value: DefaultIntervalType) => {
            setPeriodUnit(value)
            setIsDataChange(true);
        },
        [],
    );

    useEffect(() => {
        const errors = {
            plural: currency.plural.length === 0 ? 'Plural cannot be empty' : undefined,
            singular: currency.singular.length === 0 ? 'Singular cannot be empty' : undefined
        };

        setCurrencyError(errors);
    }, [currency]);

    useEffect(() => {
        if (expiryStatus === "active") {
            if (!isStringInteger(periodTime)) {
                setPeriodTimeError("Time must be a number")
            } else {
                setPeriodTimeError(undefined);
            }
        } else {
            setPeriodTimeError(undefined);
        }
    }, [periodTime]);

    useEffect(() => {
        if (actionData) {
            if (actionData.success === true) {
                shopify.toast.show(actionData.message);
                setIsSubmitting(false);
            } else {
                shopify.toast.show('Failed to update\nReason: ' + actionData.message);
                setIsSubmitting(false);
            }
        }
    }, [actionData]);

    const addRedeemPoints = () => {
        setIsShowModal(true);
    }
    const handleSubmit = async () => {
        if (currencyError.plural || currencyError.singular || periodTimeError || data === null) {
            shopify.toast.show("Invalid Input!");
            setIsSubmitting(false);
        } else {
            const formData = new FormData();
            formData.append('point_currency_singular', currency.singular);
            formData.append('point_currency_plural', currency.plural)
            formData.append('point_expiry_interval', periodUnit);
            formData.append('point_expiry_time', periodTime);
            formData.append('point_expiry_status', `${expiryStatus === 'active'}`);
            formData.append('status', `${programStatus === 'program-active'}`);
            submit(formData, {replace: true, method: 'PUT', encType: "multipart/form-data"});
        }
    }
    const activator = <Button size="medium" onClick={addRedeemPoints}>Add new ways</Button>;

    const emptyStateMarkup =
        <EmptyState
            heading="Create new way to get started"
            action={{
                content: 'Add new way',
                onAction: addRedeemPoints
            }}
            image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
        >
        </EmptyState>;

    const RewardInfo = (item: RedeemPointType) => {
        let info = ""
        switch (item.type) {
            case "DiscountCodeBasicAmount":
                const basic = item.query as discountCodeBasicCreateQueryType;
                info = `${basic.customerGets?.value}$ off`;
                break;
            case "DiscountCodeBasicPercentage":
                const percentage = item.query as discountCodeBasicCreateQueryType;
                info = `${percentage.customerGets?.value}% off`;
                break;
            case "DiscountCodeFreeShipping":
                // const freeShipping = item.query as discountCodeFreeShippingCreate;
                info = `Free Shipping`
                break;
            case "DiscountCodeBxgy":
                // const bxgy = item.query as discountCodeBxgyCreate;
                info = 'Buy X Get Y';
                break;
            case "GiftCard":
                // const giftCard = item.query as giftCardCreateQueryType;
                info = 'Gift Card';
                break;
            default:
                break;
        }
        return info;
    }

    return (
        <div style={{
            marginBottom: "20px"
        }}>
            <Frame>
                <ContextualSaveBar
                    message="Unsaved changes"
                    saveAction={{
                        onAction: () => {
                            setIsSubmitting(true);
                            handleSubmit().then(() => {
                            })
                        },
                        loading: isSubmitting,
                        disabled: !isDataChange,
                    }}
                    discardAction={{
                        onAction: () => {
                            navigate("../programs");
                        },
                    }}
                ></ContextualSaveBar>
                <div style={{marginTop: "55px"}}>
                    <Page
                        title="Points"
                        backAction={{content: "Programs", url: "../programs"}}
                        titleMetadata={programStatus === 'program-active' ? <Badge tone="success">Active</Badge> :
                            <Badge tone="critical">Inactive</Badge>}
                    >
                        <BlockStack gap="600">
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <BlockStack gap="300">
                                        <Text variant="headingMd" as="h6">
                                            Earn Points
                                        </Text>
                                        <p>Set up how your customers can earn points when they interact with your
                                            brand</p>
                                        {/*<div>*/}
                                        {/*    <Button size="medium">Add new ways</Button>*/}
                                        {/*</div>*/}
                                    </BlockStack>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack gap="200">
                                        <Text variant="headingMd" as="h6">
                                            WAY TO EARN
                                        </Text>
                                        <Divider borderColor="border"/>
                                        <Card>
                                            <ResourceList
                                                items={data?.earnPointProgramList ? data?.earnPointProgramList : []}
                                                renderItem={(item) => {
                                                    const {id, name, icon, pointValue, status, type} = item;
                                                    const media = <img
                                                        src={icon}
                                                        alt=""/>

                                                    return (
                                                        <ResourceItem
                                                            id={id}
                                                            url={`../program/point/earn/${id}`}
                                                            media={media}
                                                            accessibilityLabel={`View details for ${name}`}
                                                        >
                                                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                                {name}
                                                            </Text>
                                                            <div>
                                                                <InlineStack gap="400" wrap={false}>
                                                                    <div style={{
                                                                        width: '80%'
                                                                    }}> {type === 'place_an_order/money_spent' ? `${pointValue} points for each 1$ spent`: `${pointValue} points`}
                                                                    </div>
                                                                    <div style={{
                                                                        float: "right",
                                                                        width: '20%'
                                                                    }}>{status ? <Badge tone="success">Active</Badge> :
                                                                        <Badge tone="critical">Inactive</Badge>}</div>
                                                                </InlineStack>
                                                            </div>
                                                        </ResourceItem>
                                                    );
                                                }}
                                            />
                                        </Card>
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <BlockStack gap="300">
                                        <Text variant="headingMd" as="h6">
                                            Redeem Points
                                        </Text>
                                        <p>Set up how your customers can get rewards with points they've earned</p>
                                        <div>
                                            <Modal
                                                open={isShowModal}
                                                onClose={() => setIsShowModal(false)}
                                                activator={activator} title='Add new ways'
                                                secondaryActions={[
                                                    {
                                                        content: 'Cancel',
                                                        onAction: () => setIsShowModal(false),
                                                    },
                                                ]}
                                            >
                                                <ResourceList items={[
                                                    {
                                                        id: '1',
                                                        url: '../program/DiscountCodeBasicAmount/new',
                                                        name: 'Amount discount',
                                                        icon: CashDollarIcon,
                                                    },
                                                    {
                                                        id: '2',
                                                        url: '../program/DiscountCodeBasicPercentage/new',
                                                        name: 'Percentage off',
                                                        icon: DiscountIcon,
                                                    },
                                                    {
                                                        id: '3',
                                                        url: '../program/DiscountCodeFreeShipping/new',
                                                        name: 'Free Shipping',
                                                        icon: DeliveryIcon,
                                                    },
                                                    {
                                                        id: '4',
                                                        url: '../program/DiscountCodeBxgy/new',
                                                        name: 'Free Product',
                                                        icon: ProductIcon,
                                                    },
                                                    {
                                                        id: '5',
                                                        url: '../program/GiftCard/new',
                                                        name: 'Gift Card',
                                                        icon: GiftCardIcon,
                                                    },
                                                ]}
                                                              renderItem={(item) => {
                                                                  const {id, url, name, icon} = item;
                                                                  const media = <Icon source={icon} tone='base'/>

                                                                  return (
                                                                      <ResourceItem
                                                                          id={id}
                                                                          url={url}
                                                                          media={media}
                                                                          accessibilityLabel={`View details for ${name}`}
                                                                      >
                                                                          <Text variant="bodyMd" fontWeight="bold"
                                                                                as="h3">
                                                                              {name}
                                                                          </Text>
                                                                      </ResourceItem>
                                                                  );
                                                              }}
                                                />
                                            </Modal>
                                        </div>
                                    </BlockStack>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack gap="200">
                                        <Text variant="headingMd" as="h6">
                                            WAY TO REDEEM
                                        </Text>
                                        <Divider borderColor="border"/>
                                        <Card>
                                            {data?.redeemPointProgramList && data?.redeemPointProgramList.length > 0 ? (
                                                <ResourceList
                                                    items={data?.redeemPointProgramList}
                                                    renderItem={(item) => {
                                                        const {
                                                            id,
                                                            icon,
                                                            type,
                                                            name,
                                                            pointValue,
                                                            status
                                                        } = item;
                                                        const media = <img
                                                            src={icon}
                                                            alt=""/>
                                                        // const media = <Icon source={DiscountIcon}/>

                                                        return (
                                                            <ResourceItem
                                                                id={id}
                                                                url={`../reward/${id}?type=${type}`}
                                                                media={media}
                                                                accessibilityLabel={`View details for ${name}`}
                                                            >
                                                                <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                                    {name}
                                                                </Text>
                                                                <div>
                                                                    <InlineStack gap="400" wrap={false}>
                                                                        <div style={{
                                                                            width: '80%'
                                                                        }}>
                                                                            {pointValue} points exchange
                                                                            for {RewardInfo(item as RedeemPointType)}
                                                                        </div>
                                                                        <div style={{
                                                                            float: "right",
                                                                            width: '20%'
                                                                        }}>{status}</div>
                                                                    </InlineStack>
                                                                </div>
                                                            </ResourceItem>
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <ResourceList
                                                    emptyState={emptyStateMarkup}
                                                    items={data?.redeemPointProgramList ? data?.redeemPointProgramList : []}
                                                    renderItem={() => <></>}
                                                    resourceName={{singular: 'program', plural: 'programs'}}
                                                >
                                                </ResourceList>
                                            )}
                                        </Card>
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <Text variant="headingMd" as="h6">
                                        Point Currency
                                    </Text>
                                    <p>Name your points currency to match your brand</p>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack gap="500">
                                        <Card>
                                            <TextField
                                                label="Plural"
                                                id="plural"
                                                placeholder="Example: Points"
                                                autoComplete="off"
                                                value={currency.plural}
                                                onChange={currencyChangeHandler}
                                                error={currencyError.plural}
                                            >
                                            </TextField>
                                            <TextField
                                                label="Singular"
                                                id="singular"
                                                placeholder="Example: Point"
                                                autoComplete="off"
                                                value={currency.singular}
                                                onChange={currencyChangeHandler}
                                                error={currencyError.singular}
                                            >
                                            </TextField>
                                        </Card>
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <Text variant="headingMd" as="h6">
                                        Point Expiry
                                    </Text>
                                    <p>Set an expiry for your points program. Member will lose their balance if they
                                        have not
                                        earned or spent points in one period of time</p>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack gap="500">
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Status
                                                </Text>
                                                <RadioButton
                                                    label="Active"
                                                    id="active"
                                                    onChange={expiryChangeHandler}
                                                    checked={expiryStatus === 'active'}
                                                >
                                                </RadioButton>
                                                <RadioButton
                                                    label="Disable"
                                                    id="disable"
                                                    onChange={expiryChangeHandler}
                                                    checked={expiryStatus === 'disable'}
                                                >
                                                </RadioButton>
                                            </BlockStack>
                                        </Card>
                                        {expiryStatus === 'active' ?
                                            <div>
                                                <BlockStack gap="500">
                                                    <Card>
                                                        <BlockStack gap="500">
                                                            <InlineStack gap="400" wrap={false}>
                                                                <div style={{
                                                                    width: '80%'
                                                                }}>
                                                                    <TextField
                                                                        label="Expiration period"
                                                                        autoComplete="off"
                                                                        value={periodTime}
                                                                        onChange={periodTimeChangeHandler}
                                                                        type="number"
                                                                        error={periodTimeError}
                                                                    >
                                                                    </TextField>
                                                                </div>
                                                                <div style={{
                                                                    width: '20%'
                                                                }}>
                                                                    <Select
                                                                        label="Unit"
                                                                        options={periodUnitOptions}
                                                                        onChange={handlePeriodUnitSelectChange}
                                                                        value={periodUnit}
                                                                    >
                                                                    </Select>
                                                                </div>
                                                            </InlineStack>
                                                        </BlockStack>

                                                    </Card>
                                                    <Card>
                                                        <BlockStack gap="500">
                                                            <Text as="h6" variant="headingMd">
                                                                Reactivation Email
                                                            </Text>
                                                            <p>Reactivation emails are your members' first reminder that
                                                                their points will be expiring soon.</p>
                                                        </BlockStack>
                                                    </Card>
                                                    <Card>
                                                        <BlockStack gap="500">
                                                            <Text as="h6" variant="headingMd">
                                                                Last Chance Email
                                                            </Text>
                                                            <p>Last chance emails give your members a final reminder
                                                                that the points they've earned are about to expire</p>
                                                        </BlockStack>
                                                    </Card>
                                                </BlockStack>
                                            </div>
                                            :
                                            null}
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <BlockStack gap="300">
                                        <Text variant="headingMd" as="h6">
                                            Program Status
                                        </Text>
                                    </BlockStack>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Status
                                                </Text>
                                                <RadioButton
                                                    label="Active"
                                                    id="program-active"
                                                    onChange={programStatusHandler}
                                                    checked={programStatus === 'program-active'}
                                                ></RadioButton>
                                                <RadioButton
                                                    label="Disable"
                                                    id="program-disable"
                                                    onChange={programStatusHandler}
                                                    checked={programStatus === 'program-disable'}
                                                ></RadioButton>
                                            </BlockStack>
                                        </Card>
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                        </BlockStack>
                    </Page>
                </div>
            </Frame>
        </div>
    );
}
