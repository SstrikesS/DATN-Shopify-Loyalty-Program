import {Button, Flex, theme, Divider, Spin, Progress} from "antd";
import {LoadingOutlined, RightOutlined} from "@ant-design/icons";

export default function MainPage({resource, page, setPage}) {
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const navigateToRewardList = () => {
        setPage('reward-list');
    }

    const navigateToEarnPoint = () => {
        setPage('earn-point');
    }

    const navigateToRedeemPoint = () => {
        setPage('redeem-point');
    }

    const navigateToReferral = () => {
        setPage('referral-page');
    }

    const navigateToUserActivity = () => {
        // setPage('user-activity');
    }
    if (page === 'main-page') {
        return (
            <div>
                <Flex gap="middle" vertical>
                    <div style={{
                        padding: "6px 24px",
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}>
                        <Flex gap="small" justify="flex-end" align="center">
                            <div style={{
                                width: "15%"
                            }}>
                                <img alt="" src="https://cdn-icons-png.flaticon.com/32/548/548427.png"/>
                            </div>
                            <div style={{
                                width: "75%"
                            }}>
                                <p style={{
                                    fontWeight: "bold",
                                    fontSize: "15px",
                                    textAlign: "center",
                                    display: 'flex'
                                }}>
                                    Your rewards
                                </p>
                                {resource.reward !== null && resource.rewards.length > 0 ? (
                                    <p style={{
                                        fontWeight: "light",
                                        fontSize: "12px",
                                        textAlign: "center",
                                        display: 'flex'
                                    }}>
                                        You have {resource.rewards.length} rewards available!
                                    </p>
                                ) : (
                                    <p style={{
                                        fontWeight: "light",
                                        fontSize: "12px",
                                        textAlign: "center",
                                        display: 'flex'
                                    }}>
                                        You don't have any rewards yet!
                                    </p>
                                )}

                            </div>
                            <div style={{
                                width: "10%"
                            }}>
                                <Button type="text" icon={<RightOutlined/>} onClick={navigateToRewardList}
                                        style={{display: 'flex'}}></Button>
                            </div>
                        </Flex>
                    </div>

                    <div style={{
                        padding: "6px 24px",
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}>
                        <Flex gap="small" justify="flex-end" align="center">
                            <div style={{
                                width: "15%"
                            }}>
                                <img alt="" src="https://cdn-icons-png.flaticon.com/32/8829/8829756.png"/>
                            </div>
                            <div style={{
                                width: "75%"
                            }}>
                                <p style={{
                                    fontWeight: "bold",
                                    fontSize: "15px",
                                    textAlign: "center",
                                    display: 'flex'
                                }}>
                                    Earn {resource.store._pointSetting.currency.singular}
                                </p>
                            </div>
                            <div style={{
                                width: "10%"
                            }}>
                                <Button type="text" icon={<RightOutlined/>} onClick={navigateToEarnPoint}
                                        style={{display: 'flex'}}></Button>
                            </div>
                        </Flex>
                        <Divider style={{
                            display: 'block',
                            margin: '0 0'
                        }}/>
                        <Flex gap="small" justify="flex-end" align="center">
                            <div style={{
                                width: "15%"
                            }}>
                                <img alt="" src="https://cdn-icons-png.flaticon.com/32/4221/4221657.png"/>
                            </div>
                            <div style={{
                                width: "75%"
                            }}>
                                <p style={{
                                    fontWeight: "bold",
                                    fontSize: "15px",
                                    textAlign: "center",
                                    display: 'flex'
                                }}>
                                    Redeem {resource.store._pointSetting.currency.singular}
                                </p>
                            </div>
                            <div style={{
                                width: "10%"
                            }}>
                                <Button type="text" icon={<RightOutlined/>} onClick={navigateToRedeemPoint}
                                        style={{display: 'flex'}}></Button>
                            </div>
                        </Flex>
                        {/*<Divider style={{*/}
                        {/*    display: 'block',*/}
                        {/*    margin: '0 0'*/}
                        {/*}}/>*/}
                        {/*<Flex gap="small" justify="flex-end" align="center">*/}
                        {/*    <div style={{*/}
                        {/*        width: "15%"*/}
                        {/*    }}>*/}
                        {/*        <img alt="" src="https://cdn-icons-png.flaticon.com/32/14806/14806431.png"/>*/}
                        {/*    </div>*/}
                        {/*    <div style={{*/}
                        {/*        width: "75%"*/}
                        {/*    }}>*/}
                        {/*        <p style={{*/}
                        {/*            fontWeight: "bold",*/}
                        {/*            fontSize: "15px",*/}
                        {/*            textAlign: "center",*/}
                        {/*            display: 'flex'*/}
                        {/*        }}>*/}
                        {/*            Referral*/}
                        {/*        </p>*/}
                        {/*    </div>*/}
                        {/*    <div style={{*/}
                        {/*        width: "10%"*/}
                        {/*    }}>*/}
                        {/*        <Button type="text" icon={<RightOutlined/>} onClick={navigateToReferral}*/}
                        {/*                style={{display: 'flex'}}></Button>*/}
                        {/*    </div>*/}
                        {/*</Flex>*/}
                    </div>
                    {resource.store._vipSetting.status === true ? (
                        <div style={{
                            padding: "6px 24px",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}>
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
                                        maxWidth: '250px',
                                    }}>
                                        <Progress
                                            status="active"
                                            percent={parseFloat((resource.customer._vipPoint[resource.store._vipSetting.milestoneType] / resource.vipTiers.nextTier.entryRequirement * 100).toFixed(2))}/>
                                    </div> :
                                    <div style={{
                                        maxWidth: '250px',
                                    }}>
                                        <Progress status="active" percent={100}/>
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
                                        more {resource.vipTiers.nextTier.entryRequirement - resource.customer._vipPoint[resource.store._vipSetting.milestoneType]} {resource.store._vipSetting.milestoneType === 'money_spent' ? '$' : 'Points'} to
                                        get tier {resource.vipTiers.nextTier.name}
                                    </p>
                                    : null
                                }
                            </Flex>
                        </div>
                    ) : null}

                    <div style={{
                        padding: "6px 24px",
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}>

                        <Flex gap="small" justify="flex-end" align="center">
                            <div style={{
                                width: "15%"
                            }}>
                                <img alt="" src="https://cdn-icons-png.flaticon.com/32/2961/2961948.png"/>
                            </div>
                            <div style={{
                                width: "75%"
                            }}>
                                <p style={{
                                    fontWeight: "bold",
                                    fontSize: "15px",
                                    textAlign: "center",
                                    display: 'flex'
                                }}>
                                    Your activity
                                </p>
                            </div>
                            <div style={{
                                width: "10%"
                            }}>
                                <Button type="text" icon={<RightOutlined/>} onClick={navigateToUserActivity}
                                        style={{display: 'flex'}}></Button>
                            </div>
                        </Flex>
                    </div>
                </Flex>
            </div>
        )
    } else {
        return (
            <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/>
        )
    }
}
