import {Button, Flex, theme} from "antd";
import {LeftOutlined} from "@ant-design/icons";

export default function EarnPoint({resource, page, setPage}) {

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    return (
        <Flex gap="middle" vertical>
            <div>
                <Flex gap="small" justify="flex-start" align="center">
                    <Button type="text" icon={<LeftOutlined/>} onClick={() => {
                        setPage('main-page');
                    }} style={{display: 'flex'}}></Button>
                    <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center", display: 'flex'}}>Earn {resource.store._pointSetting.currency.singular}</p>

                </Flex>
            </div>
            {resource.earnPointPrograms !== null && resource.earnPointPrograms.length > 0 ? (
                resource.earnPointPrograms.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                padding: "6px 24px",
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            {item.key === 'happy_birthday' ? (
                                <Flex gap="small" justify="flex-start" align="center">
                                    <div style={{
                                        width: "15%"
                                    }}>
                                        <img alt="" src={item.icon}/>
                                    </div>
                                    <div style={{
                                        width: "65%"
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
                                            {`Get ${item.pointValue} ${item.pointValue > 1 ? resource.store._pointSetting.currency.plural : resource.store._pointSetting.currency.singular}`}
                                        </p>
                                    </div>
                                    {resource.customer._dob === undefined || resource.customer._dob === null ? (
                                        <div style={{
                                            width: "15%"
                                        }}>
                                            <Flex gap="small" justify="flex-end" align="center">
                                                <Button type="primary" onClick={() => {
                                                    setPage('happy-birthday')
                                                }} style={{display: 'flex'}}>Edit Date</Button>
                                            </Flex>
                                        </div>
                                    ) : null}
                                </Flex>
                            ) : (
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
                                            textAlign: "center",
                                            display: 'flex',
                                            margin: '0'
                                        }}>{item.name}</p>
                                        <p style={{
                                            fontSize: "12px",
                                            textAlign: "center",
                                            display: 'flex',
                                            margin: '0'
                                        }}>{item.type.split('/')[1] === 'money_spent' ? `Get ${item.pointValue} points every 1$ spent` :
                                            `Get ${item.pointValue} points`}
                                        </p>
                                        {/*{item.limit !== -1 && item.limit ? (*/}
                                        {/*    <p style={{*/}
                                        {/*        fontSize: "12px",*/}
                                        {/*        textAlign: "center",*/}
                                        {/*        display: 'flex',*/}
                                        {/*        margin: '0'*/}
                                        {/*    }}>*/}
                                        {/*        {`${(() => {*/}
                                        {/*            const value = resource.customer._program_limit.find(value => value.program_type === item.key);*/}
                                        {/*            return value ? item.limit - value.used : 0;*/}
                                        {/*        })()} time(s) left. Reset in next ${item.limit_reset_loop}`}*/}
                                        {/*    </p>*/}
                                        {/*): null}*/}
                                    </div>
                                </Flex>
                            )}
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
