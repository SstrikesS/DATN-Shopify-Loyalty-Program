import {Button, Flex, Spin, theme} from "antd";
import {LeftOutlined, LoadingOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {getNextTierReward} from "../utils/apis.js";

export default function Tier({resource, page, setPage}) {
    const [isFetching, setIsFetching] = useState(true);
    const [reward, setReward] = useState(null);
    const [points, setPoints] = useState(0);
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    useEffect(() => {
        if (page === 'tier') {
            if (resource.vipTiers.nextTier !== null && resource.vipTiers.nextTier.reward.length > 0) {
                const selected = resource.vipTiers.nextTier.reward.reduce((acc, item) => {
                    if (item.type === 'Point') {
                        setPoints(parseInt(item.value));
                    }
                    if (item.type === 'Reward') {
                        acc.push(item.value);
                    }
                    return acc;
                }, []);
                getNextTierReward(JSON.stringify(selected)).then((r) => {
                    if (r.data.nextTierReward.length > 0) {
                        setReward(r.data.nextTierReward);
                    }
                    setIsFetching(false);
                })
            } else {
                setIsFetching(false);
            }
        }
    }, [page]);

    return (
        <Flex gap="middle" vertical>
            <div>
                <Flex gap="small" justify="flex-start" align="center">
                    <Button type="text" icon={<LeftOutlined/>} onClick={() => {
                        setIsFetching(true);
                        setPage('main-page');
                    }} style={{display: 'flex'}}></Button>
                    <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Tier</p>
                </Flex>
            </div>
            {isFetching ? (
                <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/>
            ) : (
                <div
                    style={{
                        padding: "6px 24px",
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Flex gap="small" vertical>
                        <p style={{
                            fontWeight: "bold",
                            fontSize: "15px",
                            textAlign: "center",
                            display: 'flex'
                        }}>
                            {resource.vipTiers.currentTier !== null ? resource.vipTiers.currentTier.name : 'No Vip Tier'}
                        </p>
                        {resource.vipTiers.nextTier ?
                            <div style={{
                                maxWidth: '230px',
                            }}>
                                <div className="w3-grey w3-round-large">
                                    <div className="w3-container w3-blue w3-round-large"
                                         style={{width: `${parseFloat((resource.customer._vipPoint[resource.store._vipSetting.milestoneType] / resource.vipTiers.nextTier.entryRequirement * 100).toFixed(2))}%`}}>{parseFloat((resource.customer._vipPoint[resource.store._vipSetting.milestoneType] / resource.vipTiers.nextTier.entryRequirement * 100).toFixed(2))}%
                                    </div>
                                </div>
                                <br/>
                            </div> :
                            <div style={{
                                maxWidth: '230px',
                            }}>
                                <div className="w3-grey w3-round-large">
                                    <div className="w3-container w3-blue w3-round-large"
                                         style={{width: "100%"}}> 100%
                                    </div>
                                </div>
                            </div>

                        }
                        {resource.vipTiers.nextTier ?
                            <p style={{
                                fontWeight: "light",
                                fontSize: "12px",
                                textAlign: "center",
                                display: 'flex'
                            }}>
                                Earn
                                more {resource.vipTiers.nextTier.entryRequirement - resource.customer._vipPoint[resource.store._vipSetting.milestoneType]} {resource.store._vipSetting.milestoneType === 'money_spent' ? '$' : resource.store._pointSetting.currency.plural} to
                                get tier {resource.vipTiers.nextTier.name}
                            </p>
                            : null
                        }
                        <p style={{
                            fontWeight: "bold",
                            fontSize: "15px",
                            textAlign: "center",
                            display: 'flex'
                        }}>
                            {resource.vipTiers.nextTier.name}'s perks
                        </p>
                        {resource.vipTiers.nextTier.bonusPointEarn > 0 ? (
                            <p style={{
                                fontSize: "12px",
                                textAlign: "center",
                                display: 'flex',
                                margin: '0'
                            }}>
                                {`Get more ${resource.vipTiers.nextTier.bonusPointEarn}% ${resource.store._pointSetting.currency.singular} on every order`}
                            </p>
                        ) : null}

                        {points > 0 ? (
                            <p style={{
                                fontSize: "12px",
                                textAlign: "center",
                                display: 'flex',
                                margin: '0'
                            }}>
                                Get more {points} {resource.store._pointSetting.currency.singular}
                            </p>
                        ) : null}

                        {reward !== null && reward.length > 0 ? reward.map((item, index) => {
                                return (
                                    <p key={index} style={{
                                        fontSize: "12px",
                                        textAlign: "center",
                                        display: 'flex',
                                        margin: '0'
                                    }}>
                                        {item.type === 'DiscountCodeBasicAmount' ? `Get ${item.query.customerGets.value}$ off discount` :
                                            item.type === 'DiscountCodeBasicPercentage' ? `Get ${item.query.customerGets.value}% off discount` :
                                                item.type === 'DiscountCodeFreeShipping' ? `Get Free shipping discount`: null
                                        }
                                    </p>
                                )
                            })
                            : null}
                    </Flex>
                </div>
            )}
        </Flex>
    )
}
