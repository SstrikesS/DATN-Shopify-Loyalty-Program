import {authenticate} from "~/shopify.server";
import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {Form, useActionData, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {
    Badge,
    Card,
    Page,
    Text,
    TextField,
    BlockStack,
    RadioButton,
    Frame,
    ContextualSaveBar, Layout, Checkbox, InlineStack, Select, Tooltip
} from "@shopify/polaris";
import {useCallback, useEffect, useState} from "react";
import {isStringInteger} from "~/utils/helper";
import {shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import Store from "~/class/store.class";
import {getEarnPointProgram} from "~/server/server.earn_point";
import {getTiers} from "~/server/server.tier";
import type {EarnPointType} from "~/class/earn_point.class";
import EarnPoint from "~/class/earn_point.class";

export async function loader({request, params}: LoaderFunctionArgs) {
    const {admin} = await authenticate.admin(request);
    const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
        }`
    );
    const {data} = await response.json();
    const store = await getStore(data.shop);
    if (store instanceof Store) {
        const id = params.id;
        if (id) {
            const earnPointProgramData = await getEarnPointProgram(store.id, id)
            const vipTierList = await getTiers(store.id)
            return json({
                data: {
                    shopId: store.id,
                    vipProgram: store.vipSetting,
                    earnPointProgramData: earnPointProgramData,
                    vipTierList: vipTierList,
                }
            })
        } else {
            return json({
                data: null
            })
        }
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
        const earnPointData = await getEarnPointProgram(store.id, formData.get('id') as string);

        let updateData = {
            id: formData.get('id') as string,
            store_id: store.id,
            name: formData.get('name') as string,
            status: formData.get('status') !== null ? formData.get('status') === 'true' : earnPointData.status ,
            limitUsage: formData.get('limitUsage') !== null  ? parseInt(formData.get('limitUsage') as string) : -1,
            limitResetInterval: formData.get('limitResetInterval') !== null ? formData.get('limitResetInterval') as string : earnPointData.limitResetInterval,
            limitResetValue: 1,
            customerEligibility: formData.get('customerEligibility') !== null ? formData.get('customerEligibility') as string: earnPointData.customerEligibility,
            type: earnPointData.type,
            icon: earnPointData.icon,
            pointValue: formData.get('pointValue') !== null ? parseInt(formData.get('pointValue') as string) : earnPointData.pointValue
        } as EarnPointType

        const earnPoint = new EarnPoint(updateData);
        await earnPoint.saveEarnPoint();

        return({
            success: true,
            message: 'Earn Point Program is updated successfully'
        })

    }
    return json({
        success: true,
        message: 'Store not found'
    })
}

export default function EarnSingular() {
    const {data} = useLoaderData<typeof loader>();
    const submit = useSubmit();
    const actionData = useActionData<typeof action>();
    const [rewardPoint, setRewardPoint] = useState(0);
    const [rewardPointError, setRewardPointError] = useState<string | undefined>(undefined);
    const [nameError, setNameError] = useState<string | undefined>(undefined);
    const [programStatus, setProgramStatus] = useState('disable');
    const [programType, setProgramType] = useState("");
    const [programName, setProgramName] = useState('Program');
    const [programShareLink, setProgramShareLink] = useState('https://');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDataChange, setIsDataChange] = useState(false);
    const [isLimitTimesUse, setIsLimitTimesUse] = useState(false);
    const [limitTimesUse, setLimitTimesUse] = useState("0");
    const [limitTimesUseError, setLimitTimesUseError] = useState<string | undefined>(undefined);
    const [limitTimeUnit, setLimitTimeUnit] = useState("day");
    const [isVipLimit, setIsVipLimit] = useState(false);
    const [vipLimit, setVipLimit] = useState('include');
    const [tierLimit, setTierLimit] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async () => {
        if (rewardPointError || nameError || limitTimesUseError || data === null) {
            shopify.toast.show("Invalid Input!");
            setIsSubmitting(false);
        } else {
            const formData = new FormData();
            formData.append('id', data?.earnPointProgramData.id as string);
            formData.append('name', programName);
            formData.append('pointValue', `${rewardPoint}`);
            formData.append('status', `${programStatus !== 'disable'}`);

            if (isLimitTimesUse) {
                formData.append('limitUsage', limitTimesUse);
                formData.append('limitResetInterval', limitTimeUnit);
            }
            if(isVipLimit) {
                formData.append('customerEligibility', `${vipLimit}/${tierLimit}`);
            }
            submit(formData, {replace: true, method: 'PUT', encType: "multipart/form-data"});
        }

    }
    const programStatusHandler = useCallback((newValue: boolean, id: string) => {
        setProgramStatus(id);
        setIsDataChange(true);
    }, [],);

    const programTypeHandler = useCallback((newValue: boolean, id: string) => {
        setProgramType(id);
        setIsDataChange(true);
    }, [],)

    const handleRewardPointChange = useCallback((value: string) => {
        setRewardPoint(Number(value));
        setIsDataChange(true);

    }, [],)

    const handleNameChange = useCallback((value: string) => {
        setProgramName(value);
        setIsDataChange(true);
    }, [],);

    const handleProgramShareLinkChange = useCallback((value: string) => {
        setProgramShareLink(value);
        setIsDataChange(true);
    }, [],);

    const handleIsLimitTimeUseChange = useCallback((value: boolean, id: string) => {
        setIsLimitTimesUse(prevState => !prevState);
        setIsDataChange(true);
    }, [])

    const handleLimitTimesUseChange = useCallback((value: string) => {
        setLimitTimesUse(value);
        setIsDataChange(true);
    }, []);

    const handleLimitTimeUnitChange = useCallback((value: string) => {
        setLimitTimeUnit(value);
        setIsDataChange(true);
    }, []);

    const handleIsVipLimitChange = useCallback((value: boolean, id: string) => {
        setIsVipLimit(prevState => !prevState);
        setIsDataChange(true);
    }, []);

    const handleVipLimitChange = useCallback((value: boolean, id: string) => {
        setVipLimit(id);
        setIsDataChange(true);
    }, []);

    const handleTierLimitChange = useCallback((value: string) => {
        setTierLimit(value);
        setIsDataChange(true);
    }, [])

    useEffect(() => {
        if (isLimitTimesUse) {
            if (!isStringInteger(limitTimesUse)) {
                setLimitTimesUseError('Value must be a number');
            } else {
                setLimitTimesUseError(undefined);
            }
        } else {
            setLimitTimesUseError(undefined);
        }
    }, [isLimitTimesUse, limitTimesUse]);

    useEffect(() => {
        if (!Number.isInteger(rewardPoint) || rewardPoint <= 0) {
            setRewardPointError('Point must be a number')

        } else {
            setRewardPointError(undefined);
        }
    }, [rewardPoint])

    useEffect(() => {
        if (programName.length === 0) {
            setNameError('Program Name cannot be empty')
        } else {
            setNameError(undefined);
        }
    }, [programName])

    useEffect(() => {
        if (data !== null) {
            if (data?.earnPointProgramData.status) {
                setProgramStatus('active')
            } else {
                setProgramStatus('disable')
            }
            setRewardPoint(data?.earnPointProgramData.pointValue)
            setProgramName(data?.earnPointProgramData.name)
            setProgramType(data?.earnPointProgramData.type.split('/')[1]);
            // setProgramShareLink(data?.earnPointProgramData.link ?? null);
            if (data?.earnPointProgramData.limitUsage !== -1) {
                setIsLimitTimesUse(true)
                setLimitTimesUse(`${data?.earnPointProgramData.limitUsage}`);
                setLimitTimeUnit(data?.earnPointProgramData.limitResetInterval)
            }
            if (data?.earnPointProgramData.customerEligibility && data?.earnPointProgramData.customerEligibility !== "null") {
                const requirement = data?.earnPointProgramData.customerEligibility.split('/');
                setIsVipLimit(data.vipProgram.status);
                setTierLimit(requirement[1])
                setVipLimit(requirement[0])
            } else {
                setIsVipLimit(false)
            }
        }
    }, []);

    useEffect(() => {
        if (actionData) {
            if (actionData.success === true) {
                shopify.toast.show(actionData.message);
                setIsSubmitting(false);
            } else {
                shopify.toast.show(actionData.message);
                setIsSubmitting(false);
            }
        }
    }, [actionData]);

    const timesLimitUnit = [
        {label: 'lifetime', value: 'lifetime'},
        {label: 'day', value: 'day'},
        {label: 'month', value: 'month'},
        {label: 'year', value: 'year'},
    ];

    const tierTierOption = data?.vipTierList.map((item) => {
        return {
            label: item.name,
            value: item.id,
        }
    });
    tierTierOption?.push({
        label: 'None',
        value: ''
    })

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
                            navigate("../program/points");
                        },
                    }}
                ></ContextualSaveBar>
                <div style={{marginTop: "55px"}}>
                    <Page
                        title={programName}
                        backAction={{content: "Program", url: "../program/points"}}
                        titleMetadata={programStatus === 'active' ? <Badge tone="success">Active</Badge> :
                            <Badge tone="critical">Inactive</Badge>}
                    >
                        <Layout>
                            <Layout.Section variant="oneHalf">
                                <Form onSubmit={handleSubmit}>
                                    {data?.earnPointProgramData.type.split('/')[0] === 'place_an_order' ? (
                                        <BlockStack gap="500">
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Name
                                                    </Text>
                                                    <TextField
                                                        value={programName}
                                                        onChange={handleNameChange}
                                                        error={nameError}
                                                        autoComplete="off"
                                                        label="">
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Earning Value
                                                    </Text>
                                                    <RadioButton
                                                        label="Increments of points"
                                                        id="money_spent"
                                                        onChange={programTypeHandler}
                                                        checked={programType === "money_spent"}
                                                    >
                                                    </RadioButton>
                                                    <RadioButton
                                                        label="Fixed amount of points"
                                                        id="fixed_point"
                                                        onChange={programTypeHandler}
                                                        checked={programType === "fixed_point"}
                                                    >
                                                    </RadioButton>
                                                    {programType === "fixed_point" ? (
                                                        <TextField
                                                            label="Point earned when complete an order"
                                                            type="number"
                                                            value={`${rewardPoint}`}
                                                            suffix="points"
                                                            onChange={handleRewardPointChange}
                                                            error={rewardPointError}
                                                            autoComplete="off"
                                                        >
                                                        </TextField>
                                                    ) : (
                                                        <TextField
                                                            label="Points earned for every $1 spent"
                                                            type="number"
                                                            value={`${rewardPoint}`}
                                                            suffix="points"
                                                            onChange={handleRewardPointChange}
                                                            error={rewardPointError}
                                                            autoComplete="off"
                                                        >
                                                        </TextField>
                                                    )}
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Customer Eligibility
                                                    </Text>
                                                    <Checkbox
                                                        label="Limit the number of times customer can use this earn program"
                                                        onChange={handleIsLimitTimeUseChange}
                                                        checked={isLimitTimesUse}
                                                    >
                                                    </Checkbox>
                                                    {isLimitTimesUse ? (
                                                        <InlineStack gap="400" wrap={false}>
                                                            <div style={{
                                                                width: '80%'
                                                            }}>
                                                                <TextField
                                                                    label='Limit time use'
                                                                    labelHidden
                                                                    autoComplete='off'
                                                                    value={limitTimesUse}
                                                                    onChange={handleLimitTimesUseChange}
                                                                    error={limitTimesUseError}
                                                                    type='number'
                                                                    suffix="per"
                                                                >
                                                                </TextField>
                                                            </div>
                                                            <div style={{
                                                                width: '20%'
                                                            }}>
                                                                <Select
                                                                    label="Unit"
                                                                    labelHidden
                                                                    options={timesLimitUnit}
                                                                    onChange={handleLimitTimeUnitChange}
                                                                    value={limitTimeUnit}
                                                                >
                                                                </Select>
                                                            </div>
                                                        </InlineStack>
                                                    ) : null}
                                                    <Tooltip active
                                                             content="To enable this setting, please ACTIVE VIP program">
                                                        <Checkbox
                                                            label="Limit to customers base on VIP tiers"
                                                            onChange={handleIsVipLimitChange}
                                                            checked={isVipLimit}
                                                            disabled={!data?.vipProgram.status}
                                                        >
                                                        </Checkbox>
                                                    </Tooltip>
                                                    {isVipLimit ? (
                                                        <div>
                                                            <RadioButton
                                                                label="Include specific VIP tier"
                                                                id="include"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'include'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'include' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                            <RadioButton
                                                                label="Exclude specific VIP tier"
                                                                id="exclude"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'exclude'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'exclude' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                        </div>
                                                    ) : null}
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Status
                                                    </Text>
                                                    <RadioButton
                                                        label="Active"
                                                        id="active"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'active'}
                                                    ></RadioButton>
                                                    <RadioButton
                                                        label="Disable"
                                                        id="disable"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'disable'}
                                                    ></RadioButton>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    ) : data?.earnPointProgramData.type === 'happy_birthday' ? (
                                        <BlockStack gap="500">
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Name
                                                    </Text>
                                                    <TextField
                                                        value={programName}
                                                        onChange={handleNameChange}
                                                        error={nameError}
                                                        autoComplete="off"
                                                        label="">
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Earning Value
                                                    </Text>
                                                    <TextField
                                                        label="Point earned"
                                                        type="number"
                                                        value={`${rewardPoint}`}
                                                        suffix="points"
                                                        onChange={handleRewardPointChange}
                                                        error={rewardPointError}
                                                        autoComplete="off"
                                                    >
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Customer Eligibility
                                                    </Text>
                                                    <Tooltip active
                                                             content="To enable this setting, please ACTIVE VIP program">
                                                        <Checkbox
                                                            label="Limit to customers base on VIP tiers"
                                                            onChange={handleIsVipLimitChange}
                                                            checked={isVipLimit}
                                                            disabled={!data?.vipProgram.status}
                                                        >
                                                        </Checkbox>
                                                    </Tooltip>
                                                    {isVipLimit ? (
                                                        <div>
                                                            <RadioButton
                                                                label="Include specific VIP tier"
                                                                id="include"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'include'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'include' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                            <RadioButton
                                                                label="Exclude specific VIP tier"
                                                                id="exclude"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'exclude'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'exclude' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                        </div>
                                                    ) : null}
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Status
                                                    </Text>
                                                    <RadioButton
                                                        label="Active"
                                                        id="active"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'active'}
                                                    ></RadioButton>
                                                    <RadioButton
                                                        label="Disable"
                                                        id="disable"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'disable'}
                                                    ></RadioButton>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    ) : data?.earnPointProgramData.type === 'share_on_facebook' ? (
                                        <BlockStack gap="500">
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Name
                                                    </Text>
                                                    <TextField
                                                        value={programName}
                                                        onChange={handleNameChange}
                                                        error={nameError}
                                                        autoComplete="off"
                                                        label="">
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Social Link
                                                    </Text>
                                                    <TextField
                                                        value={programShareLink}
                                                        onChange={handleProgramShareLinkChange}
                                                        error={nameError}
                                                        autoComplete="off"
                                                        label="Facebook page URL "
                                                    >
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Earning Value
                                                    </Text>
                                                    <TextField
                                                        label="Point earned when complete an action"
                                                        type="number"
                                                        value={`${rewardPoint}`}
                                                        suffix="points"
                                                        onChange={handleRewardPointChange}
                                                        error={rewardPointError}
                                                        autoComplete="off"
                                                    >
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Customer Eligibility
                                                    </Text>
                                                    <Checkbox
                                                        label="Limit the number of times customer can use this earn program"
                                                        onChange={handleIsLimitTimeUseChange}
                                                        checked={isLimitTimesUse}
                                                    >
                                                    </Checkbox>
                                                    {isLimitTimesUse ? (
                                                        <InlineStack gap="400" wrap={false}>
                                                            <div style={{
                                                                width: '80%'
                                                            }}>
                                                                <TextField
                                                                    label='Limit time use'
                                                                    labelHidden
                                                                    autoComplete='off'
                                                                    value={limitTimesUse}
                                                                    onChange={handleLimitTimesUseChange}
                                                                    error={limitTimesUseError}
                                                                    type='number'
                                                                    suffix="per"
                                                                >
                                                                </TextField>
                                                            </div>
                                                            <div style={{
                                                                width: '20%'
                                                            }}>
                                                                <Select
                                                                    label="Unit"
                                                                    labelHidden
                                                                    options={timesLimitUnit}
                                                                    onChange={handleLimitTimeUnitChange}
                                                                    value={limitTimeUnit}
                                                                >
                                                                </Select>
                                                            </div>
                                                        </InlineStack>
                                                    ) : null}
                                                    <Tooltip active
                                                             content="To enable this setting, please ACTIVE VIP program">
                                                        <Checkbox
                                                            label="Limit to customers base on VIP tiers"
                                                            onChange={handleIsVipLimitChange}
                                                            checked={isVipLimit}
                                                            disabled={!data?.vipProgram.status}
                                                        >
                                                        </Checkbox>
                                                    </Tooltip>
                                                    {isVipLimit ? (
                                                        <div>
                                                            <RadioButton
                                                                label="Include specific VIP tier"
                                                                id="include"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'include'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'include' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                            <RadioButton
                                                                label="Exclude specific VIP tier"
                                                                id="exclude"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'exclude'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'exclude' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                        </div>
                                                    ) : null}
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Status
                                                    </Text>
                                                    <RadioButton
                                                        label="Active"
                                                        id="active"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'active'}
                                                    ></RadioButton>
                                                    <RadioButton
                                                        label="Disable"
                                                        id="disable"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'disable'}
                                                    ></RadioButton>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    ) : data?.earnPointProgramData.type === 'sign_in' ? (
                                        <BlockStack gap="500">
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Name
                                                    </Text>
                                                    <TextField
                                                        value={programName}
                                                        onChange={handleNameChange}
                                                        error={nameError}
                                                        autoComplete="off"
                                                        label="">
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Earning Value
                                                    </Text>
                                                    <TextField
                                                        label="Point earned"
                                                        type="number"
                                                        value={`${rewardPoint}`}
                                                        suffix="points"
                                                        onChange={handleRewardPointChange}
                                                        error={rewardPointError}
                                                        autoComplete="off"
                                                    >
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Customer Eligibility
                                                    </Text>
                                                    <Tooltip active
                                                             content="To enable this setting, please ACTIVE VIP program">
                                                        <Checkbox
                                                            label="Limit to customers base on VIP tiers"
                                                            onChange={handleIsVipLimitChange}
                                                            checked={isVipLimit}
                                                            disabled={!data?.vipProgram.status}
                                                        >
                                                        </Checkbox>
                                                    </Tooltip>
                                                    {isVipLimit ? (
                                                        <div>
                                                            <RadioButton
                                                                label="Include specific VIP tier"
                                                                id="include"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'include'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'include' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                            <RadioButton
                                                                label="Exclude specific VIP tier"
                                                                id="exclude"
                                                                onChange={handleVipLimitChange}
                                                                checked={vipLimit === 'exclude'}
                                                            >
                                                            </RadioButton>
                                                            {
                                                                vipLimit === 'exclude' ? (
                                                                    <Select
                                                                        label='Tier'
                                                                        labelHidden
                                                                        options={tierTierOption}
                                                                        onChange={handleTierLimitChange}
                                                                        value={tierLimit}
                                                                    ></Select>
                                                                ) : null
                                                            }
                                                        </div>
                                                    ) : null}
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Program Status
                                                    </Text>
                                                    <RadioButton
                                                        label="Active"
                                                        id="active"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'active'}
                                                    ></RadioButton>
                                                    <RadioButton
                                                        label="Disable"
                                                        id="disable"
                                                        onChange={programStatusHandler}
                                                        checked={programStatus === 'disable'}
                                                    ></RadioButton>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    ) : null}
                                </Form>
                            </Layout.Section>
                            <Layout.Section variant="oneThird">
                            </Layout.Section>
                        </Layout>
                    </Page>
                </div>
            </Frame>
        </div>
    )
}
