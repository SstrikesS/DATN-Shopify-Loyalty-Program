import {Button, Flex, theme} from "antd";

export default function LoginPage({shop}) {

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const RegButtonHandler = function () {
        window.location.href = `https://${shop.domain}/account/register`;
    }

    return (
        <Flex gap="middle" vertical>
            <div style={{
                padding: "6px 24px",
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
            }}>
                <p style={{fontWeight: "bold", fontSize: "15px", textAlign: "center"}}>
                    Become our membership
                </p>
                <p style={{fontWeight: "light", fontSize: "12px", textAlign: "center"}}>
                    With more ways to unlock exciting perks, this is your all access pass to exclusive rewards.
                </p>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <Button type="primary" onClick={RegButtonHandler}>Join now</Button>
                </div>
                <p style={{fontWeight: "light", fontSize: "12px", textAlign: "center"}}>
                    Already have an account?
                    <a href={`https://${shop.domain}/account/login`} style={{textDecoration: "none"}}> Sign in</a>
                </p>
            </div>
        </Flex>
    );
}
