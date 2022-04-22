import {Switch, Route, Redirect, useLocation} from "react-router-dom";
import Dashboard from "./page/Dashboard/Dashboard";
import TradeQuote from "./page/TradeQuote/TradeQuote";
import Footer from "./component/Footer";
import {useEffect, useState} from "react";
import {addAccountChangeListener, checkDappBrowser} from "./web3";
import notify from "./component/Toast";
import {useTranslation} from "react-i18next";
import ScrollToTop from "./component/ScrollToTop";
import React from "react";
import MSTPanel from "./page/MST/MSTPanel";
import MSTInfo from "./page/MST/MSTInfo";
import MSTReward from "./page/MST/MSTReward";
import MSTReferral from "./page/MST/MSTReferral";
import MSTFriendList from "./page/MST/MSTFriendList";
import MSTLiquidityMining from "./page/MST/MSTLiquidityMining";
import PoolInfos from "./page/Info/PoolInfos";
import VolumeTradingComp from "./page/Event/VolumeTradingComp";
import jwt_decode from "jwt-decode";
import {getToken, setIsMobile, setIsAgent} from "./store";
import {isMobile} from "./utils";
import ContentWrapper from "./layout/ContentWrapper";
import Navbar from "./component/Navbar";
// import { getAnalytics, logEvent } from "firebase/analytics";
import {firebaseConfig} from "./firebase";
import {initializeApp} from "firebase/app";
import {getAnalytics, logEvent} from "firebase/analytics";

const Main = () => {
  const {t} = useTranslation();
  const token = getToken();
  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  const fundingCodeValue = searchParams.get("r");
  const [isAgent, setIsAgentFn] = useState("");
  let isDappbrowser = false;
  if (checkDappBrowser()) {
    isDappbrowser = true;
  }
  useEffect(() => {
    document.title = "MappedSwap";
    setIsMobile(isMobile());

    if (!isDappbrowser) {
      notify("warn", t("notDAppBroswer"));
    }
    if (token) {
      const decoded = jwt_decode(token);
      setIsAgentFn(decoded.isAgent);
      setIsAgent(decoded.isAgent);
    }
  }, [isDappbrowser, t]);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    logEvent(analytics, "enter_mainPage");
  }, []);

  return (
    <ScrollToTop>
      <Switch>
        <Route exact path="/account">
          <Navbar />
          <ContentWrapper>
            <Dashboard />
            <Footer />
          </ContentWrapper>
        </Route>
        <Route exact path="/trade/:selectedTradeToken">
          <Navbar />
          <ContentWrapper>
            <TradeQuote />
            <Footer />
          </ContentWrapper>
        </Route>
        <Route exact path="/info/mst">
          <Navbar />
          <ContentWrapper>
            <MSTPanel selectedTab={"MSTInfo"} />
            <MSTInfo />
            <Footer />
          </ContentWrapper>
        </Route>
        <Route exact path="/info/pool">
          <Navbar />
          <ContentWrapper>
            <MSTPanel selectedTab={"poolInfo"} />
            <PoolInfos />
            <Footer />
          </ContentWrapper>
        </Route>
        <Route exact path="/info/pool/BTCM">
          <Navbar />
          <ContentWrapper>
            <MSTPanel selectedTab={"poolInfo"} />
            <PoolInfos selectedToken="BTCM" />
            <Footer />
          </ContentWrapper>
        </Route>
        <Route exact path="/info/pool/ETHM">
          <Navbar />
          <ContentWrapper>
            <MSTPanel selectedTab={"poolInfo"} />
            <PoolInfos selectedToken="ETHM" />
            <Footer />
          </ContentWrapper>
        </Route>
        <Route exact path="/referral">
          <Navbar />
          <ContentWrapper>
            <MSTPanel selectedTab={"refer"} />
            <MSTReferral isAgent={isAgent} />
            <Footer />
          </ContentWrapper>
        </Route>
        {isAgent && (
          <Route exact path="/referral/reward">
            <Navbar />
            <ContentWrapper>
              <MSTPanel selectedTab={"reward"} />
              <MSTReward />
              <Footer />
            </ContentWrapper>
          </Route>
        )}
        {isAgent && (
          <Route exact path="/referral/friendlist">
            <Navbar />
            <ContentWrapper>
              <MSTPanel selectedTab={"friendlist"} />
              <MSTFriendList />
              <Footer />
            </ContentWrapper>
          </Route>
        )}
        <Route exact path="/stake">
          <Navbar />
          <ContentWrapper>
            <MSTPanel selectedTab={"mining"} />
            <MSTLiquidityMining />
            <Footer />
          </ContentWrapper>
        </Route>
        <Route exact path="/campaign">
          <Navbar />
          <ContentWrapper>
            <VolumeTradingComp />
            <Footer />
          </ContentWrapper>
        </Route>
        <Route exact path="*">
          <Redirect to="/account" />
        </Route>
      </Switch>
    </ScrollToTop>
  );
};

export default Main;
