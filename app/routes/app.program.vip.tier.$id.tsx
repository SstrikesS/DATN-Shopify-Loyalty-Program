import {
    Autocomplete,
    BlockStack, CalloutCard,
    Card,
    Checkbox,
    ContextualSaveBar,
    DropZone,
    Frame, Icon,
    Layout,
    Page,
    Text,
    Button,
    TextField, Thumbnail, ResourceList, ResourceItem, Modal
} from "@shopify/polaris";
import {useCallback, useEffect, useState} from "react";
import {Form, useActionData, useLoaderData, useNavigate, useSubmit} from "@remix-run/react";
import {isStringInteger, isUnsignedFloat} from "~/utils/helper";
import {authenticate} from "~/shopify.server";
import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {ulid} from "ulid";
import path from "node:path";
import {mkdir, writeFile} from "fs/promises";
import {shopQuery} from "~/utils/shopify_query";
import {getStore} from "~/server/server.store";
import Store from "~/class/store.class";
import {getTier, getTiers, sortNewTier, sortUpdateTier, updateTier} from "~/server/server.tier";
import type {TierType} from "~/class/tier.class";
import {Tier} from "~/class/tier.class";
import type {SectionDescriptor} from "@shopify/polaris/build/ts/src/types";
import {
    CashDollarIcon,
    DeliveryIcon,
    DiscountIcon,
    GiftCardIcon,
    ProductIcon,
    SearchIcon
} from "@shopify/polaris-icons";
import {getRedeemPointPrograms} from "~/server/server.redeem_point";

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
        const vipTierList = await getTiers(store.id);
        const redeemProgramList = await getRedeemPointPrograms(store.id);
        let rewardList: {
            value: string,
            label: string,
        }[]
        if (redeemProgramList !== null && redeemProgramList.length > 0) {
            rewardList = redeemProgramList.map<{ value: string, label: string }>((r) => {
                return {
                    value: r.id,
                    label: r.name,
                }
            })
        } else {
            rewardList = [] as {
                value: string,
                label: string,
            }[];
        }

        if (id && id !== 'new') {
            const vipTierData = await getTier(data.shop.id, id as string);

            return json({
                data: {
                    shopId: id,
                    vipProgram: store.vipSetting,
                    rewards: rewardList,
                    vipTierData: vipTierData,
                    vipTierList: vipTierList,
                }
            })
        } else {

            return json({
                data: {
                    shopId: id,
                    vipProgram: store.vipSetting,
                    rewards: rewardList,
                    vipTierList: vipTierList,
                    vipTierData: null,
                }
            })
        }
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

        const method = request.method;
        const formData = await request.formData();
        const icon = formData.get('icon');
        const id = ulid();
        let fileName = '';
        if (icon && icon instanceof File) {
            const arrayBuffer = await icon.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const publicDir = path.join(process.cwd(), 'public', 'uploads');
            fileName = `${id}${path.extname(icon.name)}`
            const filePath = path.join(publicDir, fileName);

            try {
                await mkdir(publicDir, {recursive: true});
                await writeFile(filePath, buffer);

            } catch (error) {
                console.log('Error: ', error);

                return json({
                    success: false,
                    message: error,
                })
            }
            if (method === "POST" && fileName.length > 0) {
                let newData = {
                    id: id,
                    store_id: store.id,
                    name: formData.get('name') as string,
                    icon: `/uploads/${fileName}`,
                    entryRequirement: parseInt(formData.get('entryRequirement') as string),
                    reward: formData.get('reward') !== null ? JSON.parse(formData.get('reward') as string) : [],
                    bonusPointEarn: parseInt(formData.get('bonusPointEarn') as string),
                    previousTier: formData.get('previousTier') === null ? undefined : formData.get('previousTier'),
                    nextTier: formData.get('nextTier') === null ? undefined : formData.get('nextTier'),
                    customerCount: 0,
                    status: true,
                } as TierType

                const tier = new Tier(newData);
                await tier.saveTier();
                sortNewTier(tier.id, store.id, tier.previousTier, tier.nextTier).then(() =>
                    console.log(`--Update Tier List successfully--`)
                )

                return json({
                    success: true,
                    message: 'Tier is created successfully'
                })

            } else if (method === "PUT") {
                let updateData = {
                    id: formData.get('id') as string,
                    store_id: store.id,
                    name: formData.get('name') === null ? undefined : formData.get('name'),
                    icon: fileName.length > 0 ? `/uploads/${fileName}` : undefined,
                    entryRequirement: formData.get('entryRequirement') === null ? undefined : parseInt(formData.get('name') as string),
                    reward: formData.get('reward') !== null ? JSON.parse(formData.get('reward') as string) : [],
                    bonusPointEarn: formData.get('bonusPointEarn') === null ? undefined : parseInt(formData.get('bonusPointEarn') as string),
                    previousTier: formData.get('previousTier') === null ? undefined : formData.get('previousTier'),
                    nextTier: formData.get('nextTier') === null ? undefined : formData.get('nextTier'),
                    customerCount: formData.get('customerCount') === null ? undefined : parseInt(formData.get('customerCount') as string),
                    status: formData.get('status') === null ? undefined : formData.get('status') === 'true',
                } as TierType;

                const tier = new Tier(updateData);
                await tier.saveTier();
                const oldPreviousTier = formData.get('oldPreviousTier') === null ? undefined : formData.get('oldPreviousTier') as string;
                const oldNextTier = formData.get('oldNextTier') === null ? undefined : formData.get('oldNextTier') as string;

                sortUpdateTier(tier.id, store.id, oldPreviousTier, oldNextTier, tier.previousTier, tier.nextTier).then(() =>
                    console.log(`--Update Tier List successfully--`)
                )

                return json({
                    success: true,
                    message: 'Tier is updated successfully'
                })
            } else {

                return json({
                    success: false,
                    message: 'Image: Invalid image files upload!\nPlease try again'
                })
            }
        } else {
            if (method === "POST") {
                return json({
                    success: false,
                    message: 'Image: Invalid image files upload!\nPlease try again'
                })
            } else {
                let updateData = {
                    id: formData.get('id') as string,
                    store_id: store.id,
                    name: formData.get('name') === null ? undefined : formData.get('name'),
                    icon: undefined,
                    entryRequirement: formData.get('entryRequirement') === null ? undefined : parseInt(formData.get('entryRequirement') as string),
                    reward: formData.get('reward') !== null ? JSON.parse(formData.get('reward') as string) : [],
                    bonusPointEarn: formData.get('bonusPointEarn') === null ? undefined : parseInt(formData.get('bonusPointEarn') as string),
                    previousTier: formData.get('previousTier') === null ? undefined : formData.get('previousTier'),
                    nextTier: formData.get('nextTier') === null ? undefined : formData.get('nextTier'),
                    customerCount: formData.get('customerCount') === null ? undefined : parseInt(formData.get('customerCount') as string),
                    status: formData.get('status') === null ? undefined : formData.get('status') === 'true',
                };

                await updateTier(updateData as unknown as TierType);

                return json({
                    success: true,
                    message: 'Tier is updated successfully'
                })
            }
        }
    } else {
        return json({
            success: false,
            message: 'Store not found'
        })
    }
}


export default function AddNewTier() {
    const {data} = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const submit = useSubmit();
    const actionData = useActionData<typeof action>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDataChange, setIsDataChange] = useState(false);

    const [tierName, setTierName] = useState(data?.vipTierData !== null && data?.vipTierData !== undefined ? data?.vipTierData.name : "");
    const [nameError, setNameError] = useState<string | undefined>(undefined);

    const [milestoneRequire, setMilestoneRequire] = useState(data?.vipTierData !== null && data?.vipTierData !== undefined ? `${data?.vipTierData.entryRequirement}` : "0");
    const [milestoneRequireError, setMilestoneRequireError] = useState<string | undefined>(undefined);

    const [tierIcon, setTierIcon] = useState<File | undefined>(undefined);

    const [tierIconLink, setTierIconLink] = useState("");
    const [nextTier, setNextTier] = useState<{
        id: string,
        name: string,
        entryRequirement: number
    } | undefined>(undefined);
    const [previousTier, setPreviousTier] = useState<{
        id: string,
        name: string,
        entryRequirement: number
    } | undefined>(undefined);


    const [milestoneRewardCheckbox, setMilestoneRewardCheckbox] = useState({
        add_points: false,
        add_discounts: false
    });

    const [milestoneRewardPoints, setMilestoneRewardPoints] = useState("100");
    const [milestoneRewardPointsError, setMilestoneRewardPointsError] = useState<string | undefined>(undefined);

    const [milestonePerk, setMilestonePerk] = useState("0");
    const [milestonePerkError, setMilestonePerkError] = useState<string | undefined>(undefined);

    const [rewardOptions, setRewardOptions] = useState<{ value: string, label: string }[]>(data?.rewards as {
        value: string,
        label: string
    }[]);
    const [selectedReward, setSelectedReward] = useState<string[] | undefined>(undefined);
    const [inputRewardValue, setInputRewardValue] = useState('');
    const [isShowModal, setIsShowModal] = useState(false);

    const updateText = useCallback((value: string) => {
            setInputRewardValue(value);

            if (value === '') {
                setRewardOptions(data?.rewards as { value: string, label: string }[]);
                return;
            }

            const filterRegex = new RegExp(value, 'i');
            const resultOptions = data?.rewards.filter((collectionOptions: any) =>
                collectionOptions.title.match(filterRegex),
            ) as { value: string, label: string }[];
            setRewardOptions(resultOptions);
        },
        [data?.rewards],
    );
    const addRedeemPoints = () => {
        setIsShowModal(true);
    }

    const activator = <Button size="medium" onClick={addRedeemPoints}>Add new ways</Button>;
    const modal = <Modal
        open={isShowModal}
        onClose={() => setIsShowModal(false)}
        activator={activator} title='Add new rewards'
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

    const textField = (
        <Autocomplete.TextField
            onChange={updateText}
            label="Rewards"
            value={inputRewardValue}
            prefix={<Icon source={SearchIcon} tone="base"/>}
            placeholder="Search"
            autoComplete="off"
            connectedRight={modal}
        />
    );

    const removeFromSelectedReward = (indexToRemove: number) => {
        if (selectedReward) {
            const updatedCollection = [...selectedReward];
            updatedCollection.splice(indexToRemove, 1);
            setSelectedReward(updatedCollection as string[]);
        }
    };


    const handleNameChange = useCallback((value: string) => {
        setTierName(value)
        setIsDataChange(true)
    }, [],);

    const handleMilestoneRequireChange = useCallback((value: string) => {
        setMilestoneRequire(value);
        setIsDataChange(true);
    }, []);

    const handleMilestoneCheckboxChange = useCallback((_newCheck: boolean, id: string) => {
        setMilestoneRewardCheckbox(((prevState) => {
            const newState = {...prevState};
            // @ts-ignore
            newState[id] = !newState[id];
            return newState;
        }));
        if (!milestoneRewardCheckbox.add_discounts) {
            setSelectedReward(undefined);
        }
        setIsDataChange(true);
    }, []);

    const handleMilestoneRewardPointsChange = useCallback((value: string) => {
        setMilestoneRewardPoints(value);
        setIsDataChange(true);
    }, [])

    const handleMilestonePerkChange = useCallback((value: string) => {
        setMilestonePerk(value);
        setIsDataChange(true);
    }, [])

    const handleDropZoneChange = useCallback(
        (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
            setTierIcon(acceptedFiles[0]);
            setIsDataChange(true);
        },
        [],);

    const updateSelection = useCallback((selected: any) => {
            setSelectedReward(selected);
        },
        [],
    );

    useEffect(() => {
        if (data?.vipTierData !== null && data?.vipTierData !== undefined) {
            setTierIconLink(data?.vipTierData?.icon);
            if (data?.vipTierData?.reward.length > 0) {
                const selected: string[] = data?.vipTierData?.reward.reduce<string[]>((acc, item) => {
                    if (item.type === 'Point') {
                        setMilestoneRewardCheckbox((previous) => ({
                            ...previous,
                            add_points: true,
                        }));
                        setMilestoneRewardPoints(item.value as string);
                    } else if (item.type === 'Reward') {
                        acc.push(item.value as string);
                    }
                    return acc;
                }, []);
                if(selected.length > 0) {
                    setMilestoneRewardCheckbox((previous) => ({
                        ...previous,
                        add_discounts: true,
                    }));
                }
                setSelectedReward(selected);
            }
            setMilestonePerk(`${data?.vipTierData.bonusPointEarn}`);
        }
    }, []);

    useEffect(() => {
        if (actionData) {
            if (actionData.success === true) {
                if (data?.vipTierData !== null) {
                    shopify.toast.show('Update vip tier successfully');
                    setIsSubmitting(false);
                } else {
                    shopify.toast.show('Create new tier successfully');
                    setTimeout(() => {
                        navigate('../program/vips');
                    }, 500);
                }
            } else {
                shopify.toast.show(actionData.message as string);
                setIsSubmitting(false);
            }
        }
    }, [actionData]);

    useEffect(() => {
        if (!isStringInteger(milestoneRequire)) {
            setMilestoneRequireError(`Points must be a number`)
        } else {
            setMilestoneRequireError(undefined);
            if (data?.vipTierList !== null && data?.vipTierList !== undefined && data?.vipTierList.length > 0) {
                findTierIndex(parseInt(milestoneRequire), data?.vipTierList as TierType[]);
            }
        }

    }, [milestoneRequire]);

    useEffect(() => {
        if (!isUnsignedFloat(milestonePerk)) {
            setMilestonePerkError('Value must be a number');
        } else if (parseFloat(milestonePerk) > 100) {
            setMilestonePerkError('Value can\'t be greater than 100');
        } else {
            setMilestonePerkError(undefined);
        }
    }, [milestonePerk]);

    useEffect(() => {
        if (!isStringInteger(milestoneRewardPoints) && milestoneRewardCheckbox.add_points) {
            setMilestoneRewardPointsError('Points must be a number');
        } else {
            setMilestoneRewardPointsError(undefined);
        }
    }, [milestoneRewardPoints, milestoneRewardCheckbox.add_points])

    useEffect(() => {
        if (tierName.length === 0) {
            setNameError('Tier Name cannot be empty')
        } else {
            setNameError(undefined);
        }
    }, [tierName])


    const handleSubmit = async () => {
        if (nameError || milestoneRequireError || milestoneRewardPointsError || milestonePerkError || data === null) {
            shopify.toast.show("Invalid Input!");
            setIsSubmitting(false);
        } else {
            let reward :{
                type: string,
                value: string | number,
            }[] = [];
            if (!tierIcon && tierIconLink.length === 0) {
                shopify.toast.show("Tier image is not found");
                setIsSubmitting(false);
            } else {
                const formData = new FormData();
                formData.append('name', tierName);
                if (tierIcon) {
                    formData.append('icon', tierIcon);
                }
                formData.append('entryRequirement', milestoneRequire);
                if (milestoneRewardCheckbox.add_discounts) {
                    if (selectedReward !== undefined && selectedReward !== null && selectedReward.length > 0) {
                         reward = selectedReward.map((item) => {
                            return {
                                type: 'Reward',
                                value: item,
                            }
                        })
                    }
                }
                if (milestoneRewardCheckbox.add_points) {
                    reward.push({
                        type: 'Point',
                        value: milestoneRewardPoints,
                    })
                }
                if (reward.length > 0) {
                    formData.append('reward', JSON.stringify(reward));
                }
                formData.append('bonusPointEarn', milestonePerk);
                if (previousTier) {
                    formData.append('previousTier', previousTier.id)
                }
                if (nextTier) {
                    formData.append('nextTier', nextTier.id);
                }

                if (data?.vipTierData !== null && data?.vipTierData !== undefined) {
                    formData.append('id', data?.vipTierData.id);
                    if (data?.vipTierData.previousTier) {
                        formData.append('oldPreviousTier', data?.vipTierData.previousTier);
                    }
                    if (data?.vipTierData.nextTier) {
                        formData.append('oldNextTier', data?.vipTierData.nextTier);
                    }
                    submit(formData, {replace: true, method: "PUT", encType: "multipart/form-data"});
                    return;
                } else {
                    submit(formData, {replace: true, method: "POST", encType: "multipart/form-data"});
                    return;
                }
            }
        }
    }

    const findTierIndex = (entryRequirement: number, tiers: TierType[]) => {

        if (entryRequirement < tiers[0].entryRequirement) {

            setPreviousTier(undefined);
            setNextTier({
                id: tiers[0].id,
                name: tiers[0].name,
                entryRequirement: tiers[0].entryRequirement,
            });

            return null;
        }
        for (let i = 0; i < tiers.length; i++) {
            if (entryRequirement < tiers[i].entryRequirement) {
                if (data?.vipTierData !== null && data?.vipTierData !== undefined && tiers[i - 1].id === data?.vipTierData.id) {
                    if (data?.vipTierData?.previousTier) {
                        setPreviousTier({
                            id: tiers[i - 2].id,
                            name: tiers[i - 2].name,
                            entryRequirement: tiers[i - 2].entryRequirement,
                        });
                    } else {
                        setPreviousTier(undefined);
                    }
                } else {
                    setPreviousTier({
                        id: tiers[i - 1].id,
                        name: tiers[i - 1].name,
                        entryRequirement: tiers[i - 1].entryRequirement,
                    });
                }

                if (tiers[i].id === data?.vipTierData?.id) {
                    if (data?.vipTierData?.nextTier) {
                        setNextTier({
                            id: tiers[i + 1].id,
                            name: tiers[i + 1].name,
                            entryRequirement: tiers[i].entryRequirement,
                        })
                    } else {
                        setNextTier(undefined);
                    }
                } else {
                    setNextTier({
                        id: tiers[i].id,
                        name: tiers[i].name,
                        entryRequirement: tiers[i].entryRequirement,
                    })
                }


                return null;
            } else if (entryRequirement === tiers[i].entryRequirement) {
                if (entryRequirement === data?.vipTierData?.entryRequirement) {
                    setMilestoneRequireError(undefined);
                } else {
                    setMilestoneRequireError(`This requirement points has been set to tier ${tiers[i].name}`);
                }


                if (tiers[i].previousTier) {
                    if (tiers[i].previousTier === data?.vipTierData?.id) {
                        if (tiers[i - 1].previousTier) {
                            setPreviousTier({
                                id: tiers[i - 2].id,
                                name: tiers[i - 2].name,
                                entryRequirement: tiers[i - 2].entryRequirement,
                            });
                        } else {
                            setPreviousTier(undefined);
                        }

                    } else {
                        setPreviousTier({
                            id: tiers[i - 1].id,
                            name: tiers[i - 1].name,
                            entryRequirement: tiers[i - 1].entryRequirement,
                        });
                    }

                } else {
                    setPreviousTier(undefined);
                }

                if (tiers[i].nextTier) {
                    if (tiers[i].nextTier === data?.vipTierData?.id) {
                        if (tiers[i + 1].nextTier) {
                            setNextTier({
                                id: tiers[i + 2].id,
                                name: tiers[i + 2].name,
                                entryRequirement: tiers[i + 2].entryRequirement,
                            });
                        } else {
                            setNextTier(undefined);
                        }
                    } else {
                        setNextTier({
                            id: tiers[i + 1].id,
                            name: tiers[i + 1].name,
                            entryRequirement: tiers[i + 1].entryRequirement,
                        });
                    }

                } else {
                    setNextTier(undefined);
                }

                return null;
            }
        }
        if (tiers[tiers.length - 1].id === data?.vipTierData?.id) {
            if (tiers[tiers.length - 1].previousTier) {
                setPreviousTier({
                    id: tiers[tiers.length - 2].id,
                    name: tiers[tiers.length - 2].name,
                    entryRequirement: tiers[tiers.length - 2].entryRequirement,
                });
                setNextTier(undefined);
            } else {
                setPreviousTier(undefined);
                setNextTier(undefined);
            }
        } else {
            setPreviousTier({
                id: tiers[tiers.length - 1].id,
                name: tiers[tiers.length - 1].name,
                entryRequirement: tiers[tiers.length - 1].entryRequirement,
            });
            setNextTier(undefined);
        }

        return null;
    }

    if (data !== null) {
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
                                navigate("../program/vips");
                            },
                        }}
                    ></ContextualSaveBar>
                    <div style={{marginTop: "55px"}}>
                        <Page
                            title="VIP Tier"
                            backAction={{content: "Points", url: "../program/vips"}}
                        >
                            <Layout>
                                <Layout.Section variant="oneHalf">
                                    <Form onSubmit={handleSubmit}>
                                        <BlockStack gap="500">
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text variant="headingMd" as="h6">
                                                        Tier Name
                                                    </Text>
                                                    <TextField
                                                        value={tierName}
                                                        onChange={handleNameChange}
                                                        error={nameError}
                                                        placeholder={`Example: Gold`}
                                                        autoComplete="off"
                                                        label="">
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text as="h6" variant="headingMd">
                                                        Icon
                                                    </Text>
                                                    <DropZone
                                                        accept="image/*"
                                                        type="image"
                                                        allowMultiple={false}
                                                        onDrop={handleDropZoneChange}
                                                    >
                                                        {tierIcon ? (
                                                            <BlockStack gap="500">
                                                                <Thumbnail
                                                                    source={window.URL.createObjectURL(tierIcon as unknown as MediaSource)}
                                                                    alt=""
                                                                    size="small"
                                                                />
                                                                <div>
                                                                    {tierIcon.name}
                                                                    <Text variant="bodySm" as="p">
                                                                        {tierIcon.size} bytes
                                                                    </Text>
                                                                </div>
                                                            </BlockStack>
                                                        ) : (
                                                            tierIconLink.length > 0 ? (
                                                                <BlockStack gap="500">
                                                                    <Thumbnail
                                                                        source={`${window.location.protocol}//${window.location.host}/${tierIconLink}`}
                                                                        alt=""
                                                                        size="small"
                                                                    />
                                                                </BlockStack>
                                                            ) : null
                                                        )}
                                                        {tierIcon ? null : <DropZone.FileUpload/>}
                                                    </DropZone>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text as="h6" variant="headingMd">
                                                        Milestone to achieve tier
                                                    </Text>
                                                    <TextField
                                                        label={data?.vipProgram?.milestoneType === 'point' ? `Points earned since` + data?.vipProgram?.program_start : `Customer total spent since` + data?.vipProgram?.program_start}
                                                        autoComplete="off"
                                                        value={milestoneRequire}
                                                        onChange={handleMilestoneRequireChange}
                                                        error={milestoneRequireError}
                                                        type="number"
                                                        suffix={data?.vipProgram?.milestoneType === 'point' ? 'Points' : '$'}
                                                        placeholder={'Example: 200'}
                                                        helpText={`${previousTier ? `Previous Tier: ${previousTier.name} - Milestone Requirement: ${previousTier.entryRequirement} ${data?.vipProgram?.milestoneType === 'point' ? 'Points' : '$'}` : 'Previous Tier: No Tier'}/${nextTier ? `Next Tier: ${nextTier.name} - Milestone Requirement: ${nextTier.entryRequirement} ${data?.vipProgram?.milestoneType === 'point' ? 'Points' : '$'}` : 'Next Tier: No Tier'}`}
                                                    >
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                            <Card>
                                                <BlockStack gap="500">
                                                    <Text as="h6" variant="headingMd">
                                                        Entry Reward
                                                    </Text>
                                                    <Checkbox
                                                        id="add_points"
                                                        label="Add points"
                                                        onChange={handleMilestoneCheckboxChange}
                                                        checked={milestoneRewardCheckbox.add_points}>
                                                    </Checkbox>
                                                    <TextField
                                                        disabled={!milestoneRewardCheckbox.add_points}
                                                        label="Points"
                                                        autoComplete="off"
                                                        value={milestoneRewardPoints}
                                                        onChange={handleMilestoneRewardPointsChange}
                                                        error={milestoneRewardPointsError}
                                                        type="number"
                                                        suffix="Points"
                                                        placeholder="Example: 300"
                                                    >
                                                    </TextField>
                                                    <Checkbox
                                                        id="add_discounts"
                                                        label="Add discounts"
                                                        onChange={handleMilestoneCheckboxChange}
                                                        checked={milestoneRewardCheckbox.add_discounts}
                                                    >
                                                    </Checkbox>
                                                    {milestoneRewardCheckbox.add_discounts ? (
                                                            <Autocomplete
                                                                allowMultiple
                                                                options={rewardOptions as unknown as SectionDescriptor[]}
                                                                selected={selectedReward ? selectedReward : []}
                                                                textField={textField}
                                                                onSelect={updateSelection}
                                                            >
                                                            </Autocomplete>
                                                        )
                                                        : null
                                                    }
                                                    <div>
                                                        {selectedReward?.map((selectedItem, index) => {
                                                            const matchedOption = rewardOptions.find((rewardOption) => {
                                                                return rewardOption.value.match(selectedItem);
                                                            });
                                                            return (
                                                                <CalloutCard
                                                                    key={index}
                                                                    title={matchedOption?.label}
                                                                    primaryAction={{
                                                                        content: 'Remove',
                                                                        onAction: () => removeFromSelectedReward(index),
                                                                    }}
                                                                    illustration=""
                                                                    onDismiss={() => removeFromSelectedReward(index)
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
                                                    <Text as="h6" variant="headingMd">
                                                        Perk
                                                    </Text>
                                                    <TextField
                                                        label="Customer get bonus when they earns points"
                                                        autoComplete="off"
                                                        value={milestonePerk}
                                                        onChange={handleMilestonePerkChange}
                                                        error={milestonePerkError}
                                                        suffix="%"
                                                    >
                                                    </TextField>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    </Form>
                                </Layout.Section>
                                <Layout.Section variant="oneThird">
                                    <Card>
                                        <Text as="h3" variant="headingMd">Summary</Text>
                                    </Card>
                                </Layout.Section>
                            </Layout>
                        </Page>
                    </div>
                </Frame>
            </div>
        )
    }
}
