import {
    InlineGrid,
    Page, MediaCard
} from "@shopify/polaris";
import {useNavigate} from "@remix-run/react";
import {useEffect, useState} from "react";


export default function Programs() {
    const [publicPath, setPublicPath] = useState('');

    useEffect( () => {
        setPublicPath(window.location.protocol + "//" + window.location.host)
    }, [])

    const navigate = useNavigate();

    return (
        <Page title="Programs">
            <InlineGrid gap="400" columns={2}>
                <div>
                    <MediaCard
                        title="Points"
                        primaryAction={{
                            content: "Setup",
                            onAction: () => {
                                navigate('../program/points');
                            },
                        }}
                        description="Create ways your customers can earn points and use points"
                    >
                        <img
                            alt=""
                            width="100%"
                            height="100%"
                            style={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                            }}
                            src={publicPath + "/points_program.jpg"}
                        />
                    </MediaCard>
                </div>
                {/*<div>*/}
                {/*    <MediaCard*/}
                {/*        title="Referral"*/}
                {/*        primaryAction={{*/}
                {/*            content: "Setup",*/}
                {/*            onAction: () => {*/}
                {/*            },*/}
                {/*        }}*/}
                {/*        description="Grow your customer list and instantly increase sales and reward them for referring their friends and encouraging them to try out your brand."*/}
                {/*    >*/}
                {/*        <img*/}
                {/*            alt=""*/}
                {/*            width="100%"*/}
                {/*            height="100%"*/}
                {/*            style={{*/}
                {/*                objectFit: 'cover',*/}
                {/*                objectPosition: 'center',*/}
                {/*            }}*/}
                {/*            src={publicPath + "/referral_program.jpg"}*/}
                {/*        />*/}
                {/*    </MediaCard>*/}
                {/*</div>*/}
                <div>
                    <MediaCard
                        title="VIP Tiers"
                        primaryAction={{
                            content: "Setup",
                            onAction: () => {
                                navigate('../program/vips');
                            },
                        }}
                        description="Offer exclusive rewards for your loyal customers. VIP is a great option to reward your best customers through increasing rewards, statuses, and perks."
                    >
                        <img
                            alt=""
                            width="100%"
                            height="100%"
                            style={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                            }}
                            src={publicPath + "/vip_program.jpg"}
                        />
                    </MediaCard>
                </div>
            </InlineGrid>
        </Page>
    );
}

