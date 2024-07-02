import {useEffect, useState} from "react";
import LoginPage from "../components/LoginPage";
import MainPage from "../components/MainPage";
import LayoutPage from "../components/Layout";
import RewardList from "../components/RewardList";
import EarnPoint from "../components/EarnPoint";
import RedeemPoint from "../components/RedeemPoint";
import Reward from "../components/Reward";
import {LoadingOutlined} from "@ant-design/icons";
import {Spin} from "antd";
import EditDate from "../components/EditDate";
import {AppResourceLoader} from "../utils/loader.js";

export default function App() {
    const modal = document.getElementById("major-popup-parent");
    const [resource, setResource] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState('main-page');

    useEffect(() => {
        if (window.shopifyCustomer.id === "" || window.shopifyCustomer.id === "null" || window.shopifyCustomer.id === "undefined") {
            setPage('login-page');
            setIsLoading(false);
        } else {
            AppResourceLoader(window.shopifyCustomer.id).then((r) => {
                    if (r !== null) {
                        setResource(r);
                        setPage('main-page');
                        setIsLoading(false);
                    }
                }
            )
        }
    }, []);

    const PopupHandler = () => {
        if (modal?.style?.display !== "block") {
            modal.style.display = "block";
        } else {
            modal.style.display = "none";
        }
    };

    const loginPageComponent = <LoginPage shop={window.shop}></LoginPage>;
    const mainPageComponent = <MainPage resource={resource} page={page} setPage={setPage}></MainPage>;
    const rewardListComponent = <RewardList resource={resource} page={page} setPage={setPage}></RewardList>;
    const earnPointComponent = <EarnPoint resource={resource} page={page} setPage={setPage}></EarnPoint>
    const redeemPointComponent = <RedeemPoint resource={resource} setResource={setResource} page={page} setPage={setPage}></RedeemPoint>
    const rewardIDComponent = <Reward resource={resource} page={page} setPage={setPage}></Reward>
    const editDateOfBirth = <EditDate resource={resource} page={page} setPage={setPage}/>

    if (isLoading) {
        return (
            <div className="tw-text-5xl tw-text-red-600">
                <button id="major-popup-button" onClick={PopupHandler}></button>
                <div id="major-popup-parent">
                    <div><Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}/></div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="tw-text-5xl tw-text-red-600">
                <button id="major-popup-button" onClick={PopupHandler}></button>
                <div id="major-popup-parent">
                    {page === 'login-page' ?
                        <div id="login-page" className={`popup-page ${page === 'login-page' ? 'active' : ''}`}>
                            <LayoutPage resource={resource} shop={window.shop} childComponent={loginPageComponent}/>
                        </div> : null
                    }
                    {page === 'main-page' ?
                        <div id="main-page" className={`popup-page ${page === 'main-page' ? 'active' : ''}`}>
                            <LayoutPage resource={resource} shop={window.shop} childComponent={mainPageComponent}/>
                        </div> : null
                    }
                    {page === 'reward-list' ?
                        <div id="reward-list" className={`popup-page ${page === 'reward-list' ? 'active' : ''}`}>
                            <LayoutPage resource={resource} shop={window.shop} childComponent={rewardListComponent}/>
                        </div> : null}
                    {page === 'earn-point' ?
                        <div id="earn-point" className={`popup-page ${page === 'earn-point' ? 'active' : ''}`}>
                            <LayoutPage resource={resource} shop={window.shop} childComponent={earnPointComponent}/>
                        </div> : null
                    }
                    {page === 'redeem-point' ?
                        <div id="redeem-point" className={`popup-page ${page === 'redeem-point' ? 'active' : ''}`}>
                            <LayoutPage resource={resource} shop={window.shop} childComponent={redeemPointComponent}/>
                        </div> : null
                    }
                    {page === 'reward-id' ?
                        <div id="reward-id" className={`popup-page ${page === 'reward-id' ? 'active' : ''}`}>
                            <LayoutPage resource={resource} shop={window.shop} childComponent={rewardIDComponent}/>
                        </div> : null
                    }
                    {page === 'happy-birthday' ?
                        <div id="happy-birthday" className={`popup-page ${page === 'happy-birthday' ? 'active' : ''}`}>
                            <LayoutPage resource={resource} shop={window.shop} childComponent={editDateOfBirth}/>
                        </div> : null
                    }
                </div>
            </div>
        )
    }
}
