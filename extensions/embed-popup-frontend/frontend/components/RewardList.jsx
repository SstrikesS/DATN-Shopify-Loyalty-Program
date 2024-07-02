import {Button, Flex, theme} from "antd";
import {LeftOutlined, RightOutlined} from "@ant-design/icons";

export default function RewardList({resource, page, setPage}) {

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    return (
        <Flex gap="middle" vertical>
            <div>
                <Flex gap="small" justify="flex-start" align="center">
                    <Button
                        type="text"
                        icon={<LeftOutlined/>}
                        onClick={() => {
                            setPage('main-page')
                        }}
                        style={{display: 'flex'}}>
                    </Button>
                    <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Rewards</p>
                </Flex>
            </div>
            {
                resource.rewards !== null && resource.rewards.length > 0 ?
                    resource.rewards.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                padding: "6px 24px",
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            <Flex gap="small" justify="flex-start" align="center">
                                <div style={{
                                    width: "80%"
                                }}>
                                    <Flex gap="small" justify="flex-start" align="center">
                                        <div style={{
                                            width: "15%"
                                        }}>
                                            <img src="https://cdn-icons-png.flaticon.com/32/1288/1288575.png" alt=""/>
                                        </div>
                                        <div style={{
                                            width: "80%"
                                        }}>
                                            <p style={{
                                                fontWeight: "bold",
                                                fontSize: "15px",
                                                textAlign: "center",
                                                display: 'flex',
                                                margin: '0'
                                            }}>{item.title}</p>
                                            <p style={{
                                                fontSize: "12px",
                                                textAlign: "center",
                                                display: 'flex',
                                                margin: '0'
                                            }}>
                                                {item.type === `DiscountCodeBasicAmount` ? `$${item.value} off discount` :
                                                    item.type === 'DiscountCodeBasicPercentage' ? `${item.value * 100}% off discount` :
                                                        item.type === 'DiscountCodeFreeShipping' ? `FreeShipping` :
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
                                            <Button type="text" icon={<RightOutlined/>} onClick={() => {
                                                setPage('reward-id');
                                                window.customer_reward_id = item.id
                                            }} style={{display: 'flex'}}></Button>
                                        </div>
                                    </Flex>
                                </div>
                            </Flex>
                        </div>
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
                            }}>You don't have any rewards yet!</p>
                        </div>
                    )}
        </Flex>
    );
}
