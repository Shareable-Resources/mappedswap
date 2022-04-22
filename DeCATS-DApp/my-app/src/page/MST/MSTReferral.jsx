import style from "./MST.module.scss";
import { useTranslation } from "react-i18next";
import icon_usdm from "../../asset/icon_usdm.svg";
import icon_ethm from "../../asset/icon_ethm.svg";
import icon_btcm from "../../asset/icon_btcm.svg";
import icon_mst from "../../asset/icon_mst.svg";
import icon_copy from "../../asset/icon_copy.svg";
import icon_decats from "../../asset/icon_decats.svg";
import "react-circular-progressbar/dist/styles.css";
import notify from "../../component/Toast";
import { allFundingCode, expectedCommission } from "../../api";
import axios from "axios";
import { useState, useEffect } from "react";
import { getIsAgent, getToken, getTokenList, getIsMobile, getUserState, setUserState } from "../../store";
import QRCode from "qrcode.react";
import { amountDivideDecimals, floorPrecised, getUserStake, getUserStaking } from "../../web3";
import ReferralStakingModal from "../../component/ReferralStakingModal";
import Staking from "../../contracts/Staking.json";
import { getMstSmartContractAddress, getStakingContractAddress } from "../../network";
import RebateDescription from "../../component/RebateDescription";
import GetfundingModal from "../../component/GetfundingModal";
import PictureZoom from "../../component/PictureZoom";
import { getAnalytics, logEvent } from "firebase/analytics";

const MSTReferral = () => {
  // console.log("isAgent", isAgent);
  const { t } = useTranslation();
  const token = getToken();
  const tokenList = getTokenList();
  const [fundingCode, setFundingCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [weeklyVolume, setWeeklyVolume] = useState(0);
  const [fundingModal, setFundingModal] = useState(false);
  const [expectedComissionData, setExpectedComissionData] = useState("");
  const [modal, setModal] = useState(false);
  const [myStakingValue, setMyStakingValue] = useState(0);
  const [myGradeValue, setMyGradeValue] = useState("N/A");
  const [commisionRate, setCommisionRate] = useState("");
  const [newTransactionFromParent, setNewTransactionFromParent] = useState("");
  const [selectedTab, setSelectedTab] = useState(token ? "invitationLink" : "programDetails");
  const isMobile = getIsMobile();
  const isAgent = getIsAgent();
  const { ClipboardItem } = window;
  const [qrCodeModal, setQrCodeModal] = useState(false);

  function toggleFundingModal() {
    logEvent(getAnalytics(), `referral_toggle_funding_code`);
    setFundingModal(!fundingModal);
  }

  function toggleQrCodeModal() {
    logEvent(getAnalytics(), `referral_toggle_qrcode_zoom`);
    setQrCodeModal(!qrCodeModal);
  }

  function toggleStakingModal() {
    logEvent(getAnalytics(), `referral_toggle_staking`);
    setModal(!modal);
  }

  async function getFundingCode() {
    try {
      let FUNDINGCODEAPI = allFundingCode(1, 0);
      let response = await axios.get(FUNDINGCODEAPI, {
        headers: {
          Authorization: token,
        },
      });
      if (response && response.data && response.data.data && response.data.data && response.data.data.rows) {
        setFundingCode(response.data.data.rows[0].fundingCode);
        setReferralLink(`${process.env.REACT_APP_DECATS_DAPP_URL}/account?r=${response.data.data.rows[0].fundingCode}`);
      }
    } catch (error) {
      console.error("getInterestList error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getExpectedCommission(value) {
    try {
      let EXPECTEDCOMMISSIONAPI = expectedCommission(value);
      let response = await axios.get(EXPECTEDCOMMISSIONAPI, {
        headers: {
          Authorization: token,
        },
      });
      if (response && response.data && response.data.data) {
        console.log(response.data.data)
        setWeeklyVolume(response.data.data.detail.weeklyVolume);
        setExpectedComissionData(response.data.data.data);
        setCommisionRate(response.data.data.detail.commissionRate);
        setMyGradeValue(response.data.data.detail.grade);
      }
    } catch (error) {
      console.error("getInterestList error", error);
      notify("warn", t("networkError"));
    }
  }

  useEffect(() => {
    let isUnmount = false;
    try {
      async function initiateInfo() {
        await getFundingCode();
        const userStaking = await getUserStaking(getStakingContractAddress(), getMstSmartContractAddress(), Staking);
        const myStakingValue = userStaking.totalStaked;
        if (myStakingValue) {
          setMyStakingValue(myStakingValue);
          await getExpectedCommission(myStakingValue);
        }
      }
      if (isAgent) {
        initiateInfo();
      }
      return () => (isUnmount = true);
    } catch (error) {
      console.log("getList err", error);
    }
  }, [modal, newTransactionFromParent, isAgent]);

  async function copyQRCodeButtonOnClick() {
    try {
      if (!isMobile) {
        await copyQRCode();
      } else {
        const qrCodeImg = await qrCodeToURL();
        toggleQrCodeModal(!qrCodeModal);
      }
    } catch (error) {
      console.error("copyQRCodeButtonOnClick error", error);
      notify("warn", t("networkError"));
    }
  }

  function copy(message) {
    logEvent(getAnalytics(), `referral_copy_funding_code`);
    var input = document.createElement("input");
    input.value = message;
    console.log(input);
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, input.value.length);
    document.execCommand("Copy");
    document.body.removeChild(input);
    notify("primary", t("copySuccess"));
  }

  async function copyQRCode() {
    try {
      logEvent(getAnalytics(), `referral_copy_qr_code`);
      const pngUrl = await qrCodeToURL();
      const blob = await imageToBlob(pngUrl);
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
      notify("primary", t("copySuccess"));
    } catch (error) {
      console.error("copyQRCode error", error);
      notify("warn", t("networkError"));
    }
  }

  async function qrCodeToURL() {
    const canvas = document.getElementById("qr-gen");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    return pngUrl;
  }

  function imageToBlob(pngUrl) {
    const img = new Image();
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    img.crossOrigin = "";
    img.src = pngUrl;
    return new Promise((resolve) => {
      img.onload = function () {
        c.width = this.naturalWidth;
        c.height = this.naturalHeight;
        ctx.drawImage(this, 0, 0);
        c.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/png",
          0.75
        );
      };
    });
  }

  function switchTabToInvitationLink() {
    logEvent(getAnalytics(), `referral_mobile_switch_to_invitation_link`);
    setSelectedTab("invitationLink");
  }

  function switchTabToProgramDetails() {
    logEvent(getAnalytics(), `referral_mobile_switch_to_program_details`);
    setSelectedTab("programDetails");
  }

  return (
    <>
      <div id={style["mst-referral-wrap"]}>
        <div className={style["mst-panel"]}>
          {token && (
            <div className={selectedTab === "invitationLink" ? style["active"] : ""} onClick={switchTabToInvitationLink}>
              {t("invitationLink")}
            </div>
          )}
          <div className={selectedTab === "programDetails" ? style["active"] : ""} onClick={switchTabToProgramDetails}>
            {t("programDetails")}
          </div>
        </div>
        {!isMobile && (
          <div className={`${style["large-card-container"]}`}>
            <div className={style["left-container"]}>
              <div className={style["introduction-container"]}>
                <div className={style["title"]}>{t("howReferralWork")}</div>
                <div className={style["body"]}>
                  <span className={style["first"]}> {t("referralDescriptionOne")}</span>
                  <span> {t("referralDescriptionTwo")}</span>
                </div>
              </div>
              <RebateDescription />
            </div>
            {
              <div className={style["right-container"]}>
                {isAgent && (
                  <div className={`${style["right-container-wrap"]}`}>
                    <div className={style["top-container"]}>
                      <div className={style["header"]}>{t("inviteFriend")}</div>
                      <div className={style["container-body"]}>
                        <div className={style["li-container"]}>
                          <div className={style["li-title"]}>{t("yourFundingCode")}</div>
                          <div className={style["li-body"]}>
                            <span>{fundingCode && fundingCode}</span>
                            <div className={style["li-icons"]}>
                              <div className={style["card-icon"]} onClick={() => copy(fundingCode)}>
                                <img src={icon_copy} alt="decats" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={style["li-container"]}>
                          <div className={style["li-title"]}>{t("URL")}</div>
                          <div className={style["li-body"]}>
                            <span>{referralLink && referralLink}</span>
                            <div className={style["li-icons"]}>
                              <div className={style["card-icon"]} onClick={() => copy(referralLink)}>
                                <img src={icon_copy} alt="decats" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={style["li-container"]}>
                          <div className={style["li-title"]}>
                            <div className={style["qr-code"]}>
                              <QRCode id="qr-gen" value={referralLink} size={60} level={"H"} includeMargin={true} />
                            </div>
                          </div>
                          <div className={`${style["li-body"]} ${style["li-body-footer"]}`}>
                            <div className={style["button"]}>
                              <span onClick={copyQRCodeButtonOnClick}> {t("copyFundingCode")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={style["bottom-container"]}>
                      <div className={style["header"]}>
                        <span>{t("rebateOverview")}</span>
                      </div>
                      <div className={style["container-body"]}>
                        <div className={style["rebate-top"]}>
                          <div className={style["li-container"]}>
                            <span>{t("grade")}</span>
                            {myGradeValue && myGradeValue}
                          </div>
                          <div className={style["li-container"]}>
                            <span>{t("commissionRate")}</span>
                            {commisionRate ? `${commisionRate}%` : "N/A"}
                          </div>
                        </div>
                        <div className={style["rebate-middle"]}>
                          <div className={style["li-container"]}>
                            <span>{t("weeklyVolume")}</span>${weeklyVolume && floorPrecised(amountDivideDecimals(weeklyVolume, tokenList.find((token) => token.tokenName === "USDM").decimal), 2)}
                          </div>
                          <div className={style["li-container"]}>
                            <span>{t("yourMSTStaking")}</span>
                            {myStakingValue && floorPrecised(amountDivideDecimals(myStakingValue, tokenList.find((token) => token.tokenName === "MST").decimal), 2)}
                          </div>
                        </div>
                        <div className={style["rebate-bottom"]}>
                          <span onClick={toggleStakingModal}>{t("boostReturn")}</span>
                        </div>
                      </div>
                      <div className={style["tokens-container"]}>
                        <div className={style["token-title"]}>{t("expectedCommission")}</div>
                        <div className={`${style["token-container"]}`}>
                          <div className={style["li-label"]}>
                            <div className={style["card-icon"]}>
                              <img src={icon_btcm} alt="ethm" />
                            </div>
                            BTC
                          </div>
                          <div className={style["li-value"]}>
                            {expectedComissionData &&
                              tokenList &&
                              floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "BTCM")].income), tokenList.find((token) => token.tokenName === "BTCM").decimal), 6)}
                          </div>
                        </div>
                        <div className={`${style["token-container"]}`}>
                          <div className={style["li-label"]}>
                            <div className={style["card-icon"]}>
                              <img src={icon_ethm} alt="usdm" />
                            </div>
                            ETH
                          </div>
                          <div className={style["li-value"]}>
                            {expectedComissionData &&
                              tokenList &&
                              floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "ETHM")].income), tokenList.find((token) => token.tokenName === "ETHM").decimal), 6)}
                          </div>
                        </div>
                        <div className={style["token-container"]}>
                          <div className={style["li-label"]}>
                            <div className={style["card-icon"]}>
                              <img src={icon_usdm} alt="usdm" />
                            </div>
                            USD
                          </div>
                          <div className={style["li-value"]}>
                            {expectedComissionData &&
                              tokenList &&
                              floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "USDM")].income), tokenList.find((token) => token.tokenName === "USDM").decimal), 6)}
                          </div>
                        </div>
                        <div className={style["token-container"]}>
                          <div className={style["li-label"]}>
                            <div className={style["card-icon"]}>
                              <img src={icon_mst} alt="usdm" />
                            </div>
                            MST
                          </div>
                          <div className={style["li-value"]}>
                            {expectedComissionData && tokenList
                              ? `$${floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "MST")].income), tokenList.find((token) => token.tokenName === "USDM").decimal), 6)}`
                              : `$${0}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {!isAgent && (
                  <div className={`${style["right-container-wrap"]}`}>
                    <div className={`${style["referral-intro"]}`}>
                      <div className={style["title"]}>{t("inviteYourFriendNow")}</div>
                      <div className={style["body"]}>{t("enterReferralCodeDescription")}</div>
                      <div className={style["bottom"]}>
                        <div className={style["get-funding-container"]}>
                          <span onClick={toggleFundingModal}> {t("enterReferralCode")}</span>
                          <GetfundingModal modal={fundingModal} toggle={toggleFundingModal} />
                        </div>
                        <div className={style["card-icon"]}>
                          <img src={icon_decats} alt="decats" />
                        </div>
                      </div>
                    </div>
                    <div className={`${style["bottom-container"]} ${style["bottom-container-with-border"]}`}>
                      <div className={style["header"]}>
                        <span>{t("rebateOverview")}</span>
                      </div>
                      <div className={style["container-body"]}>
                        <div className={style["rebate-top"]}>
                          <div className={style["li-container"]}>
                            <span>{t("grade")}</span>
                            {myGradeValue && myGradeValue}
                          </div>
                          <div className={style["li-container"]}>
                            <span>{t("commissionRate")}</span>
                            {commisionRate ? `${commisionRate}%` : "N/A"}
                          </div>
                        </div>
                        <div className={style["rebate-middle"]}>
                          <div className={style["li-container"]}>
                            <span>{t("weeklyVolume")}</span>${weeklyVolume && floorPrecised(amountDivideDecimals(weeklyVolume, tokenList.find((token) => token.tokenName === "USDM").decimal), 2)}
                          </div>
                          <div className={style["li-container"]}>
                            <span>{t("yourMSTStaking")}</span>
                            {myStakingValue && floorPrecised(amountDivideDecimals(myStakingValue, tokenList.find((token) => token.tokenName === "MST").decimal), 2)}
                          </div>
                        </div>
                        <div className={style["rebate-bottom"]}>
                          <span onClick={toggleStakingModal}>{t("boostReturn")}</span>
                        </div>
                      </div>
                      <div className={style["tokens-container"]}>
                        <div className={style["token-title"]}>{t("expectedCommission")}</div>
                        <div className={`${style["token-container"]}`}>
                          <div className={style["li-label"]}>
                            <div className={style["card-icon"]}>
                              <img src={icon_btcm} alt="ethm" />
                            </div>
                            BTC
                          </div>
                          <div className={style["li-value"]}>
                            {expectedComissionData && tokenList
                              ? floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "BTCM")].income), tokenList.find((token) => token.tokenName === "BTCM").decimal), 6)
                              : 0}
                          </div>
                        </div>
                        <div className={`${style["token-container"]}`}>
                          <div className={style["li-label"]}>
                            <div className={style["card-icon"]}>
                              <img src={icon_ethm} alt="usdm" />
                            </div>
                            ETH
                          </div>
                          <div className={style["li-value"]}>
                            {expectedComissionData && tokenList
                              ? floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "ETHM")].income), tokenList.find((token) => token.tokenName === "ETHM").decimal), 6)
                              : 0}
                          </div>
                        </div>
                        <div className={style["token-container"]}>
                          <div className={style["li-label"]}>
                            <div className={style["card-icon"]}>
                              <img src={icon_usdm} alt="usdm" />
                            </div>
                            USD
                          </div>
                          <div className={style["li-value"]}>
                            {expectedComissionData && tokenList
                              ? floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "USDM")].income), tokenList.find((token) => token.tokenName === "USDM").decimal), 6)
                              : 0}
                          </div>
                        </div>
                        <div className={style["token-container"]}>
                          <div className={style["li-label"]}>
                            <div className={style["card-icon"]}>
                              <img src={icon_mst} alt="usdm" />
                            </div>
                            MST
                          </div>
                          <div className={style["li-value"]}>
                            {expectedComissionData && tokenList
                              ? `$${floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "MST")].income), tokenList.find((token) => token.tokenName === "USDM").decimal), 6)}`
                              : `$${0}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            }
          </div>
        )}
        {isMobile && (
          <>
            {selectedTab === "programDetails" && (
              <>
                <div className={style["left-container"]}>
                  <div className={style["title"]}>{t("howReferralWork")}</div>
                  <div className={style["body"]}>
                    <span className={style["first"]}> {t("referralDescriptionOne")}</span>
                    <span> {t("referralDescriptionTwo")}</span>
                  </div>
                </div>
                <RebateDescription />
              </>
            )}
            {selectedTab === "invitationLink" && (
              <div className={`${style["large-card-container"]} ${isMobile && style["large-card-container-mobile"]}`}>
                <div className={style["right-container"]}>
                  {isAgent && (
                    <div className={`${style["right-container-wrap"]}`}>
                      <div className={style["top-container"]}>
                        <div className={style["header"]}>{t("inviteFriend")}</div>
                        <div className={style["container-body"]}>
                          <div className={style["li-container"]}>
                            <div className={style["li-title"]}>{t("yourFundingCode")}</div>
                            <div className={style["li-body"]}>
                              <span>{fundingCode && fundingCode}</span>
                              <div className={style["li-icons"]}>
                                <div className={style["card-icon"]} onClick={() => copy(fundingCode)}>
                                  <img src={icon_copy} alt="decats" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={style["li-container"]}>
                            <div className={style["li-title"]}>{t("URL")}</div>
                            <div className={style["li-body"]}>
                              <span>{referralLink && referralLink}</span>
                              <div className={style["li-icons"]}>
                                <div className={style["card-icon"]} onClick={() => copy(referralLink)}>
                                  <img src={icon_copy} alt="decats" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={style["li-container"]}>
                            <div className={style["li-title"]}>
                              <div className={style["qr-code"]}>
                                <QRCode id="qr-gen" value={referralLink} size={60} level={"H"} includeMargin={true} />
                              </div>
                            </div>
                            <div className={`${style["li-body"]} ${style["li-body-footer"]}`}>
                              <div className={style["button"]}>
                                <span onClick={copyQRCodeButtonOnClick}> {t("copyFundingCode")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* <div className={style["footer"]}>
                      <div className={style["button"]}>
                        <span onClick={copyQRCodeButtonOnClick}> {t("copyFundingCode")}</span>
                      </div>
                    </div> */}
                      </div>
                      <div className={style["bottom-container"]}>
                        <div className={style["header"]}>
                          <span>{t("rebateOverview")}</span>
                        </div>
                        <div className={style["container-body"]}>
                          <div className={style["rebate-top"]}>
                            <div className={style["li-container"]}>
                              <span>{t("grade")}</span>
                              {myGradeValue && myGradeValue}
                            </div>
                            <div className={style["li-container"]}>
                              <span>{t("commissionRate")}</span>
                              {commisionRate ? `${commisionRate}%` : "N/A"}
                            </div>
                          </div>
                          <div className={style["rebate-middle"]}>
                            <div className={style["li-container"]}>
                              <span>{t("weeklyVolume")}</span>${weeklyVolume && floorPrecised(amountDivideDecimals(weeklyVolume, tokenList.find((token) => token.tokenName === "USDM").decimal), 2)}
                            </div>
                            <div className={style["li-container"]}>
                              <span>{t("yourMSTStaking")}</span>
                              {myStakingValue && floorPrecised(amountDivideDecimals(myStakingValue, tokenList.find((token) => token.tokenName === "MST").decimal), 2)}
                            </div>
                          </div>
                          <div className={style["rebate-bottom"]}>
                            <span onClick={toggleStakingModal}>{t("boostReturn")}</span>
                          </div>
                        </div>
                        <div className={style["tokens-container"]}>
                          <div className={style["token-title"]}>{t("expectedCommission")}</div>
                          <div className={`${style["token-container"]}`}>
                            <div className={style["li-label"]}>
                              <div className={style["card-icon"]}>
                                <img src={icon_btcm} alt="ethm" />
                              </div>
                              BTC
                            </div>
                            <div className={style["li-value"]}>
                              {expectedComissionData && tokenList
                                ? floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "BTCM")].income), tokenList.find((token) => token.tokenName === "BTCM").decimal), 6)
                                : 0}
                            </div>
                          </div>
                          <div className={`${style["token-container"]}`}>
                            <div className={style["li-label"]}>
                              <div className={style["card-icon"]}>
                                <img src={icon_ethm} alt="usdm" />
                              </div>
                              ETH
                            </div>
                            <div className={style["li-value"]}>
                              {expectedComissionData && tokenList
                                ? floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "ETHM")].income), tokenList.find((token) => token.tokenName === "ETHM").decimal), 6)
                                : 0}
                            </div>
                          </div>
                          <div className={style["token-container"]}>
                            <div className={style["li-label"]}>
                              <div className={style["card-icon"]}>
                                <img src={icon_usdm} alt="usdm" />
                              </div>
                              USD
                            </div>
                            <div className={style["li-value"]}>
                              {expectedComissionData && tokenList
                                ? floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "USDM")].income), tokenList.find((token) => token.tokenName === "USDM").decimal), 6)
                                : 0}
                            </div>
                          </div>
                          <div className={style["token-container"]}>
                            <div className={style["li-label"]}>
                              <div className={style["card-icon"]}>
                                <img src={icon_mst} alt="usdm" />
                              </div>
                              MST
                            </div>
                            <div className={style["li-value"]}>
                              {expectedComissionData && tokenList
                                ? `$${floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "MST")].income), tokenList.find((token) => token.tokenName === "USDM").decimal), 6)}`
                                : `$${0}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isAgent && (
                    <div className={`${style["right-container-wrap"]}`}>
                      <div className={`${style["referral-intro"]}`}>
                        <div className={style["title"]}>{t("inviteYourFriendNow")}</div>
                        <div className={style["body"]}>{t("enterReferralCodeDescription")}</div>
                        <div className={style["bottom"]}>
                          <div className={style["get-funding-container"]}>
                            <span onClick={toggleFundingModal}> {t("enterReferralCode")}</span>
                            <GetfundingModal modal={fundingModal} toggle={toggleFundingModal} />
                          </div>
                          <div className={style["card-icon"]}>
                            <img src={icon_decats} alt="decats" />
                          </div>
                        </div>
                      </div>
                      <div className={`${style["bottom-container"]} ${style["bottom-container-with-border"]}`}>
                        <div className={style["header"]}>
                          <span>{t("rebateOverview")}</span>
                        </div>
                        <div className={style["container-body"]}>
                          <div className={style["rebate-top"]}>
                            <div className={style["li-container"]}>
                              <span>{t("grade")}</span>
                              {myGradeValue && myGradeValue}
                            </div>
                            <div className={style["li-container"]}>
                              <span>{t("commissionRate")}</span>
                              {commisionRate ? `${commisionRate}%` : "N/A"}
                            </div>
                          </div>
                          <div className={style["rebate-middle"]}>
                            <div className={style["li-container"]}>
                              <span>{t("weeklyVolume")}</span>${weeklyVolume && floorPrecised(amountDivideDecimals(weeklyVolume, tokenList.find((token) => token.tokenName === "USDM").decimal), 2)}
                            </div>
                            <div className={style["li-container"]}>
                              <span>{t("yourMSTStaking")}</span>
                              {myStakingValue && floorPrecised(amountDivideDecimals(myStakingValue, tokenList.find((token) => token.tokenName === "MST").decimal), 2)}
                            </div>
                          </div>
                          <div className={style["rebate-bottom"]}>
                            <span onClick={toggleStakingModal}>{t("boostReturn")}</span>
                          </div>
                        </div>
                        <div className={style["tokens-container"]}>
                          <div className={style["token-title"]}>{t("expectedCommission")}</div>
                          <div className={`${style["token-container"]}`}>
                            <div className={style["li-label"]}>
                              <div className={style["card-icon"]}>
                                <img src={icon_btcm} alt="ethm" />
                              </div>
                              BTC
                            </div>
                            <div className={style["li-value"]}>
                              {expectedComissionData && tokenList
                                ? floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "BTCM")].income), tokenList.find((token) => token.tokenName === "BTCM").decimal), 6)
                                : 0}
                            </div>
                          </div>
                          <div className={`${style["token-container"]}`}>
                            <div className={style["li-label"]}>
                              <div className={style["card-icon"]}>
                                <img src={icon_ethm} alt="usdm" />
                              </div>
                              ETH
                            </div>
                            <div className={style["li-value"]}>
                              {expectedComissionData && tokenList
                                ? floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "ETHM")].income), tokenList.find((token) => token.tokenName === "ETHM").decimal), 6)
                                : 0}
                            </div>
                          </div>
                          <div className={style["token-container"]}>
                            <div className={style["li-label"]}>
                              <div className={style["card-icon"]}>
                                <img src={icon_usdm} alt="usdm" />
                              </div>
                              USD
                            </div>
                            <div className={style["li-value"]}>
                              {expectedComissionData && tokenList
                                ? floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "USDM")].income), tokenList.find((token) => token.tokenName === "USDM").decimal), 6)
                                : 0}
                            </div>
                          </div>
                          <div className={style["token-container"]}>
                            <div className={style["li-label"]}>
                              <div className={style["card-icon"]}>
                                <img src={icon_mst} alt="usdm" />
                              </div>
                              MST
                            </div>
                            <div className={style["li-value"]}>
                              {expectedComissionData && tokenList
                                ? `$${floorPrecised(amountDivideDecimals(Number(expectedComissionData[expectedComissionData.findIndex((expectedComissionData) => expectedComissionData.token === "MST")].income), tokenList.find((token) => token.tokenName === "MST").decimal), 6)}`
                                : `$${0}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ReferralStakingModal modal={modal} setMyGradeValue={setMyGradeValue} myGradeValue={myGradeValue} commisionRate={commisionRate} setCommisionRate={setCommisionRate} toggle={toggleStakingModal} setNewTransactionFromParent={setNewTransactionFromParent} />
      <PictureZoom modal={qrCodeModal} toggle={toggleQrCodeModal} link={referralLink} />
    </>
  );
};

export default MSTReferral;
