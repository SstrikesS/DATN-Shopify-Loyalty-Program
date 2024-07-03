import {Button, Flex, message, Spin, theme} from "antd";
import {LeftOutlined, LoadingOutlined, RightOutlined} from "@ant-design/icons";
import {useState} from "react";
import {createReward} from "../utils/apis.js";

export default function RedeemPoint({resource, setResource, page, setPage}) {
    const [isGetting, setIsGetting] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const redeemPoint = async (id) => {
        setIsGetting(true);
        const response = await createReward(resource.customer._id, id);
        if (response?.success === true) {
            messageApi.open({
                type: 'success',
                content: 'Success',
            });
            setResource((previous) => {
                previous.customer._pointBalance = response.data.customer._pointBalance;
                if(previous.rewards === null) {
                    previous.rewards = [];
                }

                previous.rewards.push(response.data.reward);
                return previous;
            })
        } else {
            messageApi.open({
                type: 'error',
                content: 'Error',
            });
        }
        setIsGetting(false);
    }

    return (
        <Flex gap="middle" vertical>
            {contextHolder}
            <div>
                <Flex gap="small" justify="flex-start" align="center">
                    <Button type="text" icon={<LeftOutlined/>} onClick={() => {
                        setPage('main-page');
                    }} style={{display: 'flex'}}></Button>
                    <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Redeem {resource.store._pointSetting.currency.singular}</p>
                </Flex>
            </div>
            {
                resource.redeemPrograms !== null && resource.redeemPrograms.length > 0 ? (
                    resource.redeemPrograms.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: "6px 24px",
                                    background: colorBgContainer,
                                    borderRadius: borderRadiusLG,
                                }}>
                                <Flex gap="small" justify="flex-start" align="center">
                                    <div style={{
                                        width: "80%"
                                    }}>
                                        <Flex gap="small" justify="flex-start" align="center">
                                            <div style={{
                                                width: "15%"
                                            }}>
                                                <img alt="" src={item.icon}/>
                                            </div>
                                            <div style={{
                                                width: "80%"
                                            }}>
                                                <p style={{
                                                    fontWeight: "bold",
                                                    fontSize: "15px",
                                                    textAlign: "left",
                                                    display: 'flex',
                                                    margin: '0'
                                                }}>{item.name}</p>
                                                <p style={{
                                                    fontSize: "12px",
                                                    textAlign: "left",
                                                    display: 'flex',
                                                    margin: '0'
                                                }}>
                                                    {item.pointValue} {item.pointValue > 1 ? resource.store._pointSetting.currency.plural : resource.store._pointSetting.currency.singular} exchange
                                                    for {item.type === 'DiscountCodeBasicAmount' ? `${item.query.customerGets.value}$ Discount Amount off` :
                                                    item.type === 'DiscountCodeBasicPercentage' ? `${item.query.customerGets.value}% Discount Percentage off` :
                                                        item.type === 'DiscountCodeFreeShipping' ? 'FreeShipping' :
                                                            item.type === 'DiscountCodeBxgy' ? 'Buy X Get Y' :
                                                                item.type === 'GiftCard' ? 'Gift Card' : ''

                                                }
                                                </p>
                                            </div>
                                        </Flex>
                                    </div>
                                    <div style={{
                                        width: "15%"
                                    }}>
                                        <Flex gap="small" justify="flex-end" align="center">
                                            <div style={{
                                                width: "10%"
                                            }}>
                                                {isGetting ?
                                                    <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/> :
                                                    <Button type="text" icon={<RightOutlined/>} onClick={() => {
                                                        redeemPoint(item.id).then()
                                                    }}
                                                            style={{display: 'flex'}}></Button>
                                                }
                                            </div>
                                        </Flex>
                                    </div>
                                </Flex>
                            </div>
                        )
                    )) : (
                    <div
                        style={{
                            padding: "6px 24px",
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <p style={{
                            fontWeight: "bold",
                            fontSize: "15px",
                            textAlign: "center",
                            display: 'flex',
                            margin: '0'
                        }}>There are no programs for you!</p>
                    </div>
                )}
        </Flex>
    );
}
