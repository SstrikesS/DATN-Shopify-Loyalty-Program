import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {authenticate} from "~/shopify.server";
import {Form, useActionData, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {
    Autocomplete,
    BlockStack,
    Box, CalloutCard,
    Card,
    Checkbox,
    ContextualSaveBar,
    DatePicker,
    Frame,
    Icon,
    InlineGrid,
    Layout,
    List,
    Page,
    RadioButton,
    Text,
    TextField
} from "@shopify/polaris";
import {convertSnakeString, convertToTitleCase, isPositiveFloat, isStringInteger} from "~/utils/helper";
import {useCallback, useEffect, useState} from "react";
import {CalendarIcon, SearchIcon} from "@shopify/polaris-icons";
import {startOfToday} from "date-fns";
import {collectionQuery, shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import Store from "~/class/store.class";
import {getRedeemPointProgram} from "~/server/server.redeem_point";
import type {
    CombineWithType,
    CustomerGetsType,
    discountCodeBasicCreateQueryType,
    RedeemPointType
} from "~/class/redeem_point.class";
import {
    RedeemPoint
} from "~/class/redeem_point.class";
import type {SectionDescriptor} from "@shopify/polaris/build/ts/src/types";
import {ulid} from "ulid";

export async function loader({request, params}: LoaderFunctionArgs) {
    const {admin} = await authenticate.admin(request);
    const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
            ${collectionQuery}
        }`
    );
    const {data} = await response.json();
    const store = await getStore(data.shop);
    const collections = data.collections.edges.map((edge: any) => {
        return {
            value: edge.node.id,
            label: edge.node.title,
        };
    }) as { value: string, label: string }[];
    if (store instanceof Store) {
        const type = "DiscountCodeBasicAmount";
        const icon = 'https://cdn-icons-png.flaticon.com/32/1611/1611179.png';
        const id = params.id;
        let query = {} as discountCodeBasicCreateQueryType
        if (id && id !== "new") {
            const redeemPointData = await getRedeemPointProgram(store.id, id);
            query = redeemPointData?.query as discountCodeBasicCreateQueryType

            return json({
                data: {
                    shopId: store.id,
                    collections: collections,
                    redeemPointData: redeemPointData,
                    query: query,
                    type: redeemPointData?.type,
                    icon: redeemPointData?.icon,
                }
            })
        } else {
            return json({
                data: {
                    shopId: store.id,
                    collections: collections,
                    redeemPointData: null,
                    query: query,
                    type: type,
                    icon: icon,
                }
            });
        }
    } else {
        return json({data: null});
    }
}

export async function action({request}: ActionFunctionArgs) {
    const {admin} = await authenticate.admin(request);
    const method = request.method;
    const response = await admin.graphql(`
        query MyQuery {
            ${shopQuery}
            ${collectionQuery}
        }`
    );
    const {data} = await response.json();
    const store = await getStore(data.shop);
    if (store instanceof Store) {
        const type = "DiscountCodeBasicAmount";
        const icon = 'https://cdn-icons-png.flaticon.com/32/1611/1611179.png';
        const formData = await request.formData();
        if (formData.get('id') !== null && method === 'PUT') {
            const redeemPointData = await getRedeemPointProgram(store.id, formData.get('id') as string);
            const query = redeemPointData?.query as discountCodeBasicCreateQueryType
            let updateRedeemPointData = {
                id: redeemPointData?.id,
                store_id: store.id,
                name: formData.get('name') !== null ? formData.get('name') as string : redeemPointData?.name,
                status: formData.get('status') !== null ? formData.get('status') as string === 'true' : redeemPointData?.status,
                limitUsage: -1,
                limitResetInterval: 'day',
                limitResetValue: 1,
                customerEligibility: 'null',
                pointValue: formData.get('pointValue')!== null ?parseInt(formData.get('pointValue') as string) : redeemPointData?.pointValue,
                icon: icon,
                type: type,
                prefix: formData.get('prefix') !== null ? formData.get('prefix') as string : redeemPointData?.prefix ? redeemPointData?.prefix as string : undefined,
                query: {
                    combinesWith: {
                        shippingDiscounts: formData.get('combinesWithShippingDiscounts') === 'true',
                        productDiscounts: formData.get('combinesWithProductDiscounts') === 'true',
                        orderDiscounts: formData.get('combinesWithOrderDiscounts') === 'true',
                    } as CombineWithType,
                    customerGets: {
                        all: formData.get('customerGetsAll') === 'true',
                        collection: formData.get('collections') !== null ? JSON.parse(formData.get('collections') as string) as string[] : query.customerGets.collection ? query.customerGets.collection : undefined ,
                        value: parseInt(formData.get('value') as string),
                    } as CustomerGetsType,
                    minimumQuantity: formData.get('minimumQuantity') !== null ? parseInt(formData.get('minimumQuantity') as string) : null,
                    minimumPercentage: formData.get('minimumPercentage') !== null ? parseInt(formData.get('minimumPercentage') as string) : null,
                    startsAt: new Date(formData.get('startsAt') as string),
                    endsAt: formData.get('endsAt') !== 'null' ? new Date(formData.get('endsAt') as string) : null,
                } as discountCodeBasicCreateQueryType
            } as RedeemPointType;
            const redeemPointProgram = new RedeemPoint(updateRedeemPointData);
            await redeemPointProgram.save();

            return json({
                success: true,
                message: 'Redeem Point Program is updated successfully',
            })
        } else {
            let newRedeemPoint = {
                id: ulid(),
                store_id: store.id,
                name: formData.get('name') as string,
                status: true,
                limitUsage: -1,
                limitResetInterval: 'day',
                limitResetValue: 1,
                customerEligibility: 'null',
                pointValue: parseInt(formData.get('pointValue') as string),
                icon: icon,
                type: type,
                prefix: formData.get('prefix') !== null ? formData.get('prefix') as string : undefined,
                query: {
                    combinesWith: {
                        shippingDiscounts: formData.get('combinesWithShippingDiscounts') === 'true',
                        productDiscounts: formData.get('combinesWithProductDiscounts') === 'true',
                        orderDiscounts: formData.get('combinesWithOrderDiscounts') === 'true',
                    } as CombineWithType,
                    customerGets: {
                        all: formData.get('customerGetsAll') === 'true',
                        collection: formData.get('collections') !== null ? JSON.parse(formData.get('collections') as string) as string[] : undefined,
                        value: parseInt(formData.get('value') as string),
                    } as CustomerGetsType,
                    minimumQuantity: formData.get('minimumQuantity') !== null ? parseInt(formData.get('minimumQuantity') as string) : null,
                    minimumPercentage: formData.get('minimumPercentage') !== null ? parseInt(formData.get('minimumPercentage') as string) : null,
                    startsAt: new Date(formData.get('startsAt') as string),
                    endsAt: formData.get('endsAt') !== null ? new Date(formData.get('endsAt') as string) : undefined,
                } as discountCodeBasicCreateQueryType
            } as RedeemPointType;
            const redeemPointProgram = new RedeemPoint(newRedeemPoint);
            await redeemPointProgram.save();

            return json({
                success: true,
                message: 'Redeem Point Program is created successfully',
            })
        }
    } else {
        return json({
            success: false,
            message: 'Store not found',
        })
    }
}

export default function NewReward() {
    const {data} = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const [isDataChange, setIsDataChange] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const submit = useSubmit();
    const [programName, setProgramName] = useState(data?.redeemPointData ? data?.redeemPointData.name : '');
    const [nameError, setNameError] = useState<string | undefined>(undefined);
    const [pointCost, setPointCost] = useState(data?.redeemPointData ? `${data?.redeemPointData.pointValue}` : "500");
    const [pointCostError, setPointCostError] = useState<string | undefined>(undefined);
    const [discountValue, setDiscountValue] = useState(data?.redeemPointData ? `${data?.query.customerGets.value}` : "5");
    const [discountValueError, setDiscountValueError] = useState<string | undefined>(undefined);
    const [isAddPrefixCode, setsIsAddPrefixCode] = useState(data?.redeemPointData ? !!data?.redeemPointData.prefix : false);
    const [prefixCode, setPrefixCode] = useState(data?.redeemPointData?.prefix ? data?.redeemPointData?.prefix : "");
    const [combinationCheckbox, setCombinationCheckbox] = useState(data?.redeemPointData ? data?.query.combinesWith : {
        shippingDiscounts: false,
        productDiscounts: false,
        orderDiscounts: false,
    });
    const [isSetMinimumRequirement, setIsSetMinimumRequirement] = useState(data?.redeemPointData ? data?.query.minimumQuantity ? 'minimum_quantity' : data?.query.minimumPercentage ? 'minimum_purchase' : 'no_required' : 'no_required');
    const [minimumRequire, setMinimumRequire] = useState(data?.redeemPointData ? data?.query.minimumQuantity ? `${data?.query.minimumQuantity}` : data?.query.minimumPercentage ? `${data?.query.minimumPercentage}` : "5" : "5");
    const [minimumRequireError, setMinimumRequireError] = useState<string | undefined>(undefined);
    const [isRewardExpiry, setIsRewardExpiry] = useState(data?.redeemPointData ? data.query.endsAt ? "set_expired" : "no_expired" : "no_expired");
    const [selectedDate, setSelectedDate] = useState(data?.redeemPointData ? {
        start: new Date(data?.query.startsAt),
        end: data?.query.endsAt ? new Date(data?.query.endsAt) : new Date(data?.query.startsAt),
    } : {
        start: startOfToday(),
        end: startOfToday(),
    });
    const [{month, year}, setDate] = useState({month: startOfToday().getMonth(), year: startOfToday().getFullYear()})
    const [programApply, setProgramApply] = useState(data?.redeemPointData ? data?.query.customerGets.all === true ? 'entire_order' : 'specific_collections' : 'entire_order');
    const [selectedCollection, setSelectedCollection] = useState<string[] | undefined>(data?.redeemPointData ? data?.query.customerGets.collection ? data.query.customerGets.collection : undefined : undefined);
    const [programStatus, setProgramStatus] = useState(data?.redeemPointData ? data?.redeemPointData?.status ? 'active' : 'disable' : 'disable');
    const [collectionOptions, setCollectionOptions] = useState<{ value: string, label: string }[]>(data?.collections as { value: string, label: string }[]);
    const [inputCollectionValue, setInputCollectionValue] = useState('');

    const handleSubmit = async () => {
        if (nameError || pointCostError || discountValueError || minimumRequireError || data === null) {
            if (programApply === 'specific_collections' && (selectedCollection === undefined || selectedCollection?.length === 0)) {
                shopify.toast.show("Collections can not be empty");
            } else {
                console.log(nameError, pointCostError, discountValueError, minimumRequireError)
                shopify.toast.show("Invalid Input!");
            }
            setIsSubmitting(false);
        } else {
            const formData = new FormData();
            formData.append('pointValue', pointCost);
            if (isAddPrefixCode) {
                formData.append('prefix', prefixCode);
            }
            formData.append('name', programName);
            formData.append('combinesWithShippingDiscounts', `${combinationCheckbox.shippingDiscounts}`);
            formData.append('combinesWithProductDiscounts', `${combinationCheckbox.productDiscounts}`);
            formData.append('combinesWithOrderDiscounts', `${combinationCheckbox.orderDiscounts}`);

            formData.append('customerGetsAll', `${programApply === 'entire_order'}`);
            if (programApply === 'specific_collections') {
                formData.append('collections', JSON.stringify(selectedCollection));
            }
            formData.append('value', discountValue);
            if (isSetMinimumRequirement === 'minimum_quantity') {
                formData.append('minimumQuantity', minimumRequire)
            } else if (isSetMinimumRequirement === 'minimum_purchase') {
                formData.append('minimumPercentage', minimumRequire)
            }
            formData.append('startsAt', selectedDate.start.toISOString());
            if (isRewardExpiry === 'set_expired') {
                formData.append('endsAt', selectedDate.end.toISOString());
            } else {
                formData.append('endsAt', 'null');
            }
            if(data?.redeemPointData) {
                formData.append('id', data?.redeemPointData.id);
                submit(formData, {replace: true, method: 'PUT', encType: "multipart/form-data"})
            }else {
                submit(formData, {replace: true, method: 'POST', encType: "multipart/form-data"})
            }

        }
    }

    const updateText = useCallback((value: string) => {
            setInputCollectionValue(value);

            if (value === '') {
                setCollectionOptions(data?.collections as { value: string, label: string }[]);
                return;
            }

            const filterRegex = new RegExp(value, 'i');
            const resultOptions = data?.collections.filter((collectionOptions: any) =>
                collectionOptions.title.match(filterRegex),
            ) as { value: string, label: string }[];
            setCollectionOptions(resultOptions);
        },
        [data?.collections],
    );

    const textField = (
        <Autocomplete.TextField
            onChange={updateText}
            label="Collection"
            value={inputCollectionValue}
            prefix={<Icon source={SearchIcon} tone="base"/>}
            placeholder="Search"
            autoComplete="off"
        />
    );

    const handleNameChange = useCallback((value: string) => {
        setProgramName(value)
        setIsDataChange(true)
    }, [],);
    const handlePointCostChange = useCallback((value: string) => {
        setPointCost(value);
        setIsDataChange(true)
    }, [],);
    const handleDiscountValueChange = useCallback((value: string) => {
        setDiscountValue(value);
        setIsDataChange(true)
    }, [],);
    const handlePrefixDiscountChange = useCallback((value: string) => {
        setPrefixCode(value);
        setIsDataChange(true)
    }, [],);
    const handleCombinationCheckboxChange = useCallback((_newChecked: boolean, id: string) => setCombinationCheckbox((prevState) => {
            const newState = {...prevState};

            switch (id) {
                case 'shippingDiscounts':

                    newState.shippingDiscounts = !newState.shippingDiscounts;
                    break;
                case 'productDiscounts':

                    newState.productDiscounts = !newState.productDiscounts;
                    break;
                case 'orderDiscounts' :

                    newState.orderDiscounts = !newState.orderDiscounts;
                    break;
                default:
                    break;
            }
            setIsDataChange(true);
            return newState;
        }),
        [],
    );
    const handleChangeIsMinimumRequirementChange = useCallback((_newValue: boolean, id: string) => {
        setIsSetMinimumRequirement(id);
        setMinimumRequire('');
        setIsDataChange(true);
    }, [],)
    const handleMinimumRequireChange = useCallback((value: string) => {
        setMinimumRequire(value);
        setIsDataChange(true)
    }, [],);
    const handleIsRewardExpiryChange = useCallback((_newValue: boolean, id: string) => {
        setIsRewardExpiry(id);
        if(id === 'no_expired') {
            setSelectedDate((previous) => {
                return {
                    start: previous.start,
                    end: previous.start,
                }
            })
        }
        setIsDataChange(true);
    }, [],);
    const handleMonthChange = useCallback(
        (month: number, year: number) => {
            setDate({month, year});
            setIsDataChange(true)
        },
        [],
    );
    const handleProgramApplyChange = useCallback((_newValue: boolean, id: string) => {
        setProgramApply(id);
        if(id === 'entire_order') {
            setSelectedCollection(undefined);
        }
        setIsDataChange(true);
    }, [],);

    const programStatusHandler = useCallback((_newValue: boolean, id: string) => {
        setProgramStatus(id);
        setIsDataChange(true);
    }, [],);

    const updateSelection = useCallback((selected: any) => {
            setSelectedCollection(selected);
        },
        [],
    );

    const removeFromSelectedCollection = (indexToRemove: number) => {
        if (selectedCollection) {
            const updatedCollection = [...selectedCollection];
            updatedCollection.splice(indexToRemove, 1);
            setSelectedCollection(updatedCollection as string[]);
        }
    };

    useEffect(() => {
        if (actionData) {
            if (actionData.success === true) {
                if (data?.redeemPointData !== null) {
                    shopify.toast.show(actionData.message as string);
                    setIsSubmitting(false);
                } else {
                    shopify.toast.show(actionData.message as string);
                    setTimeout(() => {
                        navigate('../program/points');
                    }, 500);
                }
            } else {
                shopify.toast.show(actionData.message as string);
                setIsSubmitting(false);
            }
        }
    }, [actionData]);

    useEffect(() => {
        if (programName.length === 0) {
            setNameError('Program Name can not be empty')
        } else {
            setNameError(undefined);
        }
    }, [programName])

    useEffect(() => {
        if (!isStringInteger(pointCost)) {
            setPointCostError('Point must be a number')

        } else {
            setPointCostError(undefined);
        }
    }, [pointCost])

    useEffect(() => {
        if (!isPositiveFloat(discountValue)) {
            setDiscountValueError('Discount value must be a number')
        } else {
            setDiscountValueError(undefined);
        }
    }, [discountValue])
    useEffect(() => {
        if (isSetMinimumRequirement === 'minimum_purchase') {
            if (!isPositiveFloat(minimumRequire)) {
                setMinimumRequireError('Minimum purchase must be a number')

            } else {
                setMinimumRequireError(undefined);
            }
        } else if (isSetMinimumRequirement === 'minimum_quantity') {
            if (!isStringInteger(minimumRequire)) {
                setMinimumRequireError('Minimum quantity must be a number')

            } else {
                setMinimumRequireError(undefined);
            }
        } else {
            setMinimumRequireError(undefined);
        }
    }, [minimumRequire, isSetMinimumRequirement])

    // useEffect(() => {
    //     if(data?.redeemPointData && data?.query.customerGets.collection !== undefined && data?.query.customerGets.collection?.length > 0) {
    //         const collections = data.collections.filter(c => data?.query.customerGets.collection?.includes(c.value));
    //         console.log(collections);
    //     }
    // }, []);

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
                        title={convertToTitleCase(data?.type as string)}
                        backAction={{content: "Points", url: "../program/points"}}
                    >
                        <Layout>
                            <Layout.Section variant="oneHalf">
                                <Form onSubmit={handleSubmit}>
                                    <BlockStack gap="500">
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Title
                                                </Text>
                                                <TextField
                                                    value={programName}
                                                    onChange={handleNameChange}
                                                    error={nameError}
                                                    placeholder={`Example: 5$OFF Discount`}
                                                    autoComplete="off"
                                                    label="">
                                                </TextField>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Reward value
                                                </Text>
                                                <InlineGrid gap="500" columns="2">
                                                    <TextField
                                                        label="Points cost"
                                                        autoComplete="off"
                                                        value={pointCost}
                                                        onChange={handlePointCostChange}
                                                        type="number"
                                                        error={pointCostError}
                                                        suffix="points"
                                                    >
                                                    </TextField>
                                                    <TextField
                                                        label="Discount value"
                                                        autoComplete="off"
                                                        value={discountValue}
                                                        onChange={handleDiscountValueChange}
                                                        error={discountValueError}
                                                        suffix={"$"}
                                                    >
                                                    </TextField>
                                                </InlineGrid>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Applies to
                                                </Text>
                                                <RadioButton
                                                    label="Entire order"
                                                    id='entire_order'
                                                    onChange={handleProgramApplyChange}
                                                    checked={programApply === 'entire_order'}
                                                >
                                                </RadioButton>
                                                <RadioButton
                                                    label="Specific collection"
                                                    id='specific_collections'
                                                    onChange={handleProgramApplyChange}
                                                    checked={programApply === 'specific_collections'}
                                                >
                                                </RadioButton>
                                                {programApply === 'specific_collections' ? (
                                                    <Autocomplete
                                                        allowMultiple
                                                        options={collectionOptions as unknown as SectionDescriptor[]}
                                                        selected={selectedCollection ? selectedCollection : []}
                                                        textField={textField}
                                                        onSelect={updateSelection}
                                                    >
                                                    </Autocomplete>
                                                ) : null
                                                }
                                                <div>
                                                    {selectedCollection?.map((selectedItem, index) => {
                                                        const matchedOption = collectionOptions.find((collectionOptions) => {
                                                            return collectionOptions.value.match(selectedItem);
                                                        });
                                                        return (
                                                            <CalloutCard
                                                                key={index}
                                                                title={matchedOption?.label}
                                                                primaryAction={{
                                                                    content: 'Remove',
                                                                    onAction: () => removeFromSelectedCollection(index),
                                                                }}
                                                                illustration=""
                                                                onDismiss={() => removeFromSelectedCollection(index)
                                                                }
                                                            ></CalloutCard>
                                                        );
                                                    })
                                                    }
                                                </div>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Discount code
                                                </Text>
                                                <Checkbox
                                                    label="Add a prefix to discount code"
                                                    checked={isAddPrefixCode}
                                                    onChange={setsIsAddPrefixCode}
                                                >
                                                </Checkbox>
                                                <TextField
                                                    disabled={!isAddPrefixCode}
                                                    label="Add a prefix to discount code"
                                                    labelHidden
                                                    autoComplete="off"
                                                    placeholder="Example: 5$OFF-"
                                                    value={prefixCode}
                                                    onChange={handlePrefixDiscountChange}
                                                >
                                                </TextField>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Combination
                                                </Text>
                                                <Text variant="bodyMd" as="h6">
                                                    This discount can be combined with:
                                                </Text>
                                                <Checkbox
                                                    id="orderDiscounts"
                                                    label="Order Discounts"
                                                    checked={combinationCheckbox.orderDiscounts}
                                                    onChange={handleCombinationCheckboxChange}
                                                >
                                                </Checkbox>
                                                <Checkbox
                                                    id="productDiscounts"
                                                    label="Product Discounts"
                                                    checked={combinationCheckbox.productDiscounts}
                                                    onChange={handleCombinationCheckboxChange}
                                                >
                                                </Checkbox>
                                                <Checkbox
                                                    id="shippingDiscounts"
                                                    label="Shipping Discounts"
                                                    checked={combinationCheckbox.shippingDiscounts}
                                                    onChange={handleCombinationCheckboxChange}
                                                >
                                                </Checkbox>
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Minimum Requirement
                                                </Text>
                                                <RadioButton
                                                    label="No minimum requirement"
                                                    id="no_required"
                                                    checked={isSetMinimumRequirement === 'no_required'}
                                                    onChange={handleChangeIsMinimumRequirementChange}
                                                >
                                                </RadioButton>
                                                <RadioButton
                                                    label="Minimum quantity of items"
                                                    id="minimum_quantity"
                                                    checked={isSetMinimumRequirement === 'minimum_quantity'}
                                                    onChange={handleChangeIsMinimumRequirementChange}
                                                >
                                                </RadioButton>
                                                {isSetMinimumRequirement === 'minimum_quantity' ?
                                                    <TextField
                                                        label="Minium"
                                                        labelHidden
                                                        autoComplete="off"
                                                        value={minimumRequire}
                                                        onChange={handleMinimumRequireChange}
                                                        type='number'
                                                        error={minimumRequireError}
                                                        helpText="Applies only to selected collections."
                                                    ></TextField> : null}
                                                <RadioButton
                                                    label="Minimum purchase amount ($)"
                                                    id="minimum_purchase"
                                                    checked={isSetMinimumRequirement === 'minimum_purchase'}
                                                    onChange={handleChangeIsMinimumRequirementChange}
                                                >
                                                </RadioButton>
                                                {isSetMinimumRequirement === 'minimum_purchase' ?
                                                    <TextField
                                                        label="Minium"
                                                        labelHidden
                                                        autoComplete="off"
                                                        value={minimumRequire}
                                                        onChange={handleMinimumRequireChange}
                                                        error={minimumRequireError}
                                                        prefix="$"
                                                        helpText="Applies only to selected collections."
                                                    ></TextField> : null}
                                            </BlockStack>
                                        </Card>
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Active dates
                                                </Text>
                                                <RadioButton
                                                    label="Set reward expiry"
                                                    id="set_expired"
                                                    checked={isRewardExpiry === 'set_expired'}
                                                    onChange={handleIsRewardExpiryChange}>
                                                </RadioButton>
                                                <RadioButton
                                                    label="No expired"
                                                    id="no_expired"
                                                    checked={isRewardExpiry === 'no_expired'}
                                                    onChange={handleIsRewardExpiryChange}>
                                                </RadioButton>
                                                <div>
                                                    <InlineGrid columns={2} gap="500">
                                                        <TextField
                                                            label="Start at"
                                                            autoComplete="off"
                                                            prefix={<Icon source={CalendarIcon}/>}
                                                            role="combobox"
                                                            value={selectedDate.start.toLocaleDateString()}
                                                            readOnly
                                                        >
                                                        </TextField>
                                                        {isRewardExpiry === 'set_expired' ?
                                                            <TextField
                                                                label="End at"
                                                                autoComplete="off"
                                                                prefix={<Icon source={CalendarIcon}/>}
                                                                role="combobox"
                                                                value={selectedDate.end.toLocaleDateString()}
                                                                readOnly
                                                            >
                                                            </TextField> : null}
                                                    </InlineGrid>
                                                    <DatePicker
                                                        month={month}
                                                        year={year}
                                                        selected={selectedDate}
                                                        onMonthChange={handleMonthChange}
                                                        onChange={setSelectedDate}
                                                        disableDatesBefore={startOfToday()}
                                                        allowRange={isRewardExpiry === 'set_expired'}
                                                    ></DatePicker>
                                                </div>
                                            </BlockStack>
                                        </Card>
                                    </BlockStack>
                                </Form>
                            </Layout.Section>
                            <Layout.Section variant="oneThird">
                                <BlockStack gap='500'>
                                    <Card>
                                        <BlockStack gap="500">
                                            <Text variant="headingMd" as="h6">
                                                Summary
                                            </Text>
                                            <Text variant="headingMd" as="h6">
                                                Title
                                            </Text>
                                            <Box paddingInlineStart="400">
                                                {programName.length === 0 ? (
                                                    <Text variant="bodyMd" as="h5">
                                                        No title set
                                                    </Text>
                                                ) : (
                                                    <Text variant="headingMd" as="h6" truncate>
                                                        {programName}
                                                    </Text>
                                                )}
                                            </Box>
                                            <Text variant="headingMd" as="h6">
                                                Detail
                                            </Text>
                                            <List>
                                                <List.Item><strong>{parseFloat(discountValue).toFixed(2)}</strong>$ off
                                                    apply
                                                    to <strong>{programApply === 'specific_collections' ? selectedCollection?.length : null} {convertSnakeString(programApply)} </strong>
                                                </List.Item>

                                                <List.Item>
                                                    {!combinationCheckbox.shippingDiscounts && !combinationCheckbox.productDiscounts && !combinationCheckbox.orderDiscounts ?
                                                        'Can’t combine with other discounts' : 'Can combine with'
                                                    }
                                                    <List>
                                                        {combinationCheckbox.orderDiscounts ?
                                                            <List.Item><strong>Order
                                                                Discounts</strong></List.Item> : null}
                                                        {combinationCheckbox.productDiscounts ? <List.Item><strong>Product
                                                            Discounts</strong></List.Item> : null}
                                                        {combinationCheckbox.shippingDiscounts ? <List.Item><strong>Shipping
                                                            Discounts</strong></List.Item> : null}
                                                    </List>
                                                </List.Item>
                                                <List.Item>
                                                    {isSetMinimumRequirement === 'no_required' ? 'No minimum purchase requirement' :
                                                        isSetMinimumRequirement === 'minimum_purchase' ? `Minimum purchase of ${parseFloat(minimumRequire).toFixed(2)}$` :
                                                            isSetMinimumRequirement === 'minimum_quantity' ? `Minimum quantity of ${minimumRequire} item(s)` : null
                                                    }
                                                </List.Item>
                                                <List.Item>
                                                    Active
                                                    from <strong>{selectedDate.start.valueOf() === startOfToday().valueOf() ? 'Today' :
                                                    selectedDate.start.toDateString()}</strong> {isRewardExpiry === 'set_expired' && selectedDate.end.getTime() > selectedDate.start.getTime() ? 'until ' : null}
                                                    <strong>{isRewardExpiry === 'set_expired' && selectedDate.end.getTime() > selectedDate.start.getTime() ? selectedDate.end.toDateString() : null}</strong>
                                                </List.Item>
                                            </List>
                                        </BlockStack>
                                    </Card>
                                    {data?.redeemPointData !== null ? (
                                        <Card>
                                            <BlockStack gap="500">
                                                <Text variant="headingMd" as="h6">
                                                    Status
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
                                    ) : null}
                                </BlockStack>
                            </Layout.Section>
                        </Layout>
                    </Page>
                </div>
            </Frame>
        </div>
    )
}

