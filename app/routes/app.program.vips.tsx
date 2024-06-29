import {
    Badge,
    BlockStack,
    Button,
    Card, ContextualSaveBar, DatePicker,
    Divider,
    EmptyState, Frame, Icon, InlineStack,
    Layout,
    Page, RadioButton,
    ResourceItem,
    ResourceList, Select,
    Text, TextField
} from "@shopify/polaris";
import {useActionData, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {authenticate} from "~/shopify.server";
import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {useCallback, useEffect, useState} from "react";
import {parseISO, startOfToday} from "date-fns";
import {CalendarIcon} from "@shopify/polaris-icons";
import type {DefaultIntervalType} from "~/utils/helper";
import {isStringInteger} from "~/utils/helper";
import {shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import type {VIPSetting} from "~/class/store.class";
import Store from "~/class/store.class";
import {getTiers} from "~/server/server.tier";

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
        const vipTierList = await getTiers(data.shop.id);
        return json({
            data: {
                shopId: store.id,
                vipProgram: store.vipSetting,
                vipTierList: vipTierList,
            }
        })
    } else {
        return json({
            data: null
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
        let updateData = {} as VIPSetting;
        updateData.milestoneType = formData.get('milestoneType') as string;
        if (formData.get('program_reset_status') === 'false') {
            updateData.program_reset_time = -1;
            updateData.program_reset_interval = store.vipSetting.program_reset_interval
        } else {
            updateData.program_reset_time = parseInt(formData.get('program_reset_time') as string)
            updateData.program_reset_interval = formData.get('program_reset_interval') as DefaultIntervalType
        }
        if(formData.get('program_start') !== null) {
            updateData.program_start = parseISO(formData.get('program_start') as string);
        } else {
            updateData.program_start = store.vipSetting.program_start;
        }

        updateData.status = formData.get('status') === "true";
        store.vipSetting = updateData;
        await store.saveStore();

        return {
            success: true,
            message: 'Setting is updated successfully'
        }
    } else {
        return json({
            success: false,
            message: 'Store not found'
        })
    }
}

export default function VipProgram() {
    const {data} = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const submit = useSubmit();
    const actionData = useActionData<typeof action>();
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [milestoneType, setMilestoneType] = useState(data?.vipProgram?.milestoneType ? data?.vipProgram?.milestoneType : 'point');
    const [milestoneLifetime, setMilestoneLifetime] = useState(data?.vipProgram?.program_reset_time === -1 ? 'infinity' : 'period');
    const [periodTime, setPeriodTime] = useState(data?.vipProgram.program_reset_time !== -1 ? `${data?.vipProgram.program_reset_time}` : "1");
    const [periodTimeError, setPeriodTimeError] = useState<string | undefined>(undefined);
    const [periodUnit, setPeriodUnit] = useState(data?.vipProgram.program_reset_interval ? data?.vipProgram.program_reset_interval : 'year');
    const [programStatus, setProgramStatus] = useState(data?.vipProgram.status ? 'active1' : 'disable1');
    const [isDataChange, setIsDataChange] = useState(false);
    const [{month, year}, setDate] = useState({
        month: data?.vipProgram?.program_start ? parseISO(data.vipProgram.program_start).getMonth() : startOfToday().getMonth(),
        year: data?.vipProgram?.program_start ? parseISO(data?.vipProgram?.program_start).getFullYear() : startOfToday().getFullYear()
    })
    const [selectedDate, setSelectedDate] = useState({
        start: data?.vipProgram?.program_start ? parseISO(data?.vipProgram?.program_start) : startOfToday(),
        end: data?.vipProgram?.program_start ? parseISO(data?.vipProgram?.program_start) : startOfToday(),
    });

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
    const handleMonthChange = useCallback(
        (month: number, year: number) => {
            setDate({month, year});
        },
        [],
    );

    const milestoneTypeChangeHandler = useCallback((_newValue: boolean, id: string) => {
        setMilestoneType(id);
        setIsDataChange(true);
    }, [],);

    const milestoneLifetimeChangeHandler = useCallback((_newValue: boolean, id: string) => {
        setMilestoneLifetime(id);
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
    const addNewTier = () => {
        navigate('../program/vip/tier/new')
    }

    const handleSubmit = async () => {
        if (periodTimeError || data === null) {
            shopify.toast.show("Invalid Input!");
            setIsSubmitting(false);
        } else {
            const formData = new FormData();
            formData.append('milestoneType', milestoneType);
            formData.append('program_reset_status', `${milestoneLifetime === 'period'}`);
            formData.append('program_reset_time', periodTime);
            formData.append('program_reset_interval', periodUnit);
            formData.append('status', `${programStatus === 'active1'}`);
            formData.append('program_start', selectedDate.start.toISOString())
            submit(formData, {replace: true, method: 'PUT', encType: "multipart/form-data"})
        }
    }

    useEffect(() => {
        if (milestoneLifetime === "period") {
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

    const emptyStateMarkup =
        <EmptyState
            heading="Create new tier to get started"
            action={{
                content: 'Add new tier',
                onAction: addNewTier
            }}
            image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
        >
        </EmptyState>;

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
                        title="VIP Program"
                        backAction={{content: "Programs", url: "../programs"}}
                        titleMetadata={programStatus === 'active1' ? <Badge tone="success">Active</Badge> :
                            <Badge tone="critical">Inactive</Badge>}
                    >
                        <BlockStack gap="600">
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <BlockStack gap="300">
                                        <Text variant="headingMd" as="h6">
                                            VIP tiers
                                        </Text>
                                        <p>Create VIP tiers to reward your most loyal customers, and increase their
                                            lifetime
                                            value
                                            in your brand</p>
                                        <div>
                                            <Button size="medium" onClick={addNewTier}>Add new tier</Button>
                                        </div>
                                    </BlockStack>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack gap="200">
                                        <Text variant="headingMd" as="h6">
                                            VIP TIERS
                                        </Text>
                                        <Divider borderColor="border"/>
                                        {data?.vipTierList && data?.vipTierList.length > 0 ?
                                            <ResourceList items={data?.vipTierList} renderItem={(item) => {
                                                const {id, name, icon, entryRequirement, customerCount} = item;
                                                const media = <img style={{
                                                    width: "32px", height: "32px"
                                                }} src={icon} alt=""/>;
                                                return (
                                                    <ResourceItem
                                                        id={id}
                                                        url={`../program/vip/tier/${id}`}
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
                                                                    {data?.vipProgram.milestoneType === 'point' ?
                                                                        `Earn ${entryRequirement} points to achieve` :
                                                                        data?.vipProgram.milestoneType === 'money_spent' ?
                                                                            `Spent ${entryRequirement} $ to achieve` : null
                                                                    }
                                                                </div>
                                                                <div style={{
                                                                    float: "right",
                                                                    width: '20%'
                                                                }}>{customerCount} customers
                                                                </div>
                                                            </InlineStack>
                                                        </div>
                                                    </ResourceItem>
                                                )
                                            }}>
                                            </ResourceList>
                                            :
                                            <Card>
                                                <ResourceList
                                                    emptyState={emptyStateMarkup}
                                                    items={data?.vipTierList ? data?.vipTierList : []}
                                                    renderItem={() => <></>}
                                                    resourceName={{singular: 'program', plural: 'programs'}}
                                                >
                                                </ResourceList>
                                            </Card>
                                        }
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>
                            <Divider borderColor="border-inverse"/>
                            <Layout>
                                <Layout.Section variant="oneThird">
                                    <BlockStack gap="300">
                                        <Text variant="headingMd" as="h6">
                                            VIP milestone
                                        </Text>
                                        <p>Set up what a customer has to do before they can join a specific tier of your
                                            rewards
                                            program</p>
                                    </BlockStack>
                                </Layout.Section>
                                <Layout.Section>
                                    <BlockStack gap="300">
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Members enters a VIP tier based on their
                                                </Text>
                                                <RadioButton
                                                    label="Points earn"
                                                    id="point"
                                                    onChange={milestoneTypeChangeHandler}
                                                    checked={milestoneType === 'point'}
                                                >
                                                </RadioButton>
                                                <RadioButton
                                                    label="Amount spent"
                                                    id="money_spent"
                                                    onChange={milestoneTypeChangeHandler}
                                                    checked={milestoneType === 'money_spent'}
                                                >
                                                </RadioButton>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Program start date
                                                </Text>
                                                <TextField
                                                    label="Start at"
                                                    labelHidden
                                                    autoComplete="off"
                                                    prefix={<Icon source={CalendarIcon}/>}
                                                    value={selectedDate.start.toLocaleDateString()}
                                                    readOnly
                                                ></TextField>
                                                <DatePicker
                                                    month={month}
                                                    year={year}
                                                    selected={selectedDate}
                                                    onMonthChange={handleMonthChange}
                                                    onChange={setSelectedDate}
                                                    disableDatesAfter={startOfToday()}
                                                >
                                                </DatePicker>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text as="h6" variant="headingMd">
                                                    Members has the following amount of time to achieve a VIP tier
                                                </Text>
                                                <RadioButton
                                                    label="Their lifetime as member"
                                                    helpText="Once members achieve a tier, they will keep their status forever"
                                                    id="infinity"
                                                    onChange={milestoneLifetimeChangeHandler}
                                                    checked={milestoneLifetime === "infinity"}
                                                >
                                                </RadioButton>
                                                <RadioButton
                                                    label="Period"
                                                    helpText="A member achieve a vip tier will get the remainder of the period time and the next full period time"
                                                    id="period"
                                                    onChange={milestoneLifetimeChangeHandler}
                                                    checked={milestoneLifetime === "period"}
                                                >
                                                </RadioButton>
                                                <InlineStack gap="400" wrap={false}>
                                                    <div style={{
                                                        width: '80%'
                                                    }}>
                                                        <TextField
                                                            disabled={milestoneLifetime !== "period"}
                                                            autoComplete="off"
                                                            label="Period time"
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
                                                            disabled={milestoneLifetime !== "period"}
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
                                                    id="active1"
                                                    onChange={programStatusHandler}
                                                    checked={programStatus === 'active1'}
                                                ></RadioButton>
                                                <RadioButton
                                                    label="Disable"
                                                    id="disable1"
                                                    onChange={programStatusHandler}
                                                    checked={programStatus === 'disable1'}
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
    )
}
