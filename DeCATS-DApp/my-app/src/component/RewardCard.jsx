import style from "../page/MST/MST.module.scss";
import icon_usdm from "../asset/icon_usdm.svg";
import icon_ethm from "../asset/icon_ethm.svg";
import icon_btcm from "../asset/icon_btcm.svg";
import icon_mst from "../asset/icon_mst.svg";
import icon_close from "../asset/icon_close.png";
import {useTranslation} from "react-i18next";
import {Modal, ModalBody} from "reactstrap";
import {useState, useEffect} from "react";
import RewardCardBottomDetail from "./RewardCardBottomDetail";
import RewardCardTopDetail from "./RewardCardTopDetail";
import {getTokenList, getToken} from "../store";
import {amountDivideDecimals, claimDistribution, checkDappBrowser, switchEthereumChain, getAccount, getTransaction, checkIsClaimed, floorPrecised, getUserStake, tokenFormater} from "../web3";
import {LedgerDetail, acquireSuccessForDistributions} from "../api";
import notify from "./Toast";
import axios from "axios";
import {getMappedSwapToken} from "../network";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import {getErrorMsgKey} from "../utils";
import {getAnalytics, logEvent} from "firebase/analytics";

const RewardCard = ({id, roundId, cronJobId, dateFrom, dateTo, status, ledgers, distributions, setAcquireSuccessID}) => {
  const {t} = useTranslation();
  const [modal, setModal] = useState(false);
  const [ledgerDetails, setLedgerDetails] = useState([]);
  // const [totalMSTToken, setTotalMSTToken] = useState(0);
  const [loading, setLoading] = useState(false);
  const tokenList = getTokenList();
  const token = getToken();
  const [selectedToken, setSelectedToken] = useState(tokenList.find((token) => token.tokenName === "USDM"));

  function getBTCMCommission(){
    let btcmCommission = 0;
    if (ledgers[ledgers.findIndex((ledgers) => ledgers.token === "BTCM")]){
      btcmCommission = amountDivideDecimals(Number(ledgers[ledgers.findIndex((ledgers) => ledgers.token === "BTCM")].distCommission), tokenList.find((token) => token.tokenName === "BTCM").decimal)
    }
    return btcmCommission
  }

  function getETHMCommission(){
    let ethmCommission = 0;
    if (ledgers[ledgers.findIndex((ledgers) => ledgers.token === "ETHM")]){
      ethmCommission = amountDivideDecimals(Number(ledgers[ledgers.findIndex((ledgers) => ledgers.token === "ETHM")].distCommission), tokenList.find((token) => token.tokenName === "ETHM").decimal)
    }
    return ethmCommission
  }

  function getUSDMCommission(){
    let usdmCommission = 0;
    if (ledgers[ledgers.findIndex((ledgers) => ledgers.token === "USDM")]){
      usdmCommission = amountDivideDecimals(Number(ledgers[ledgers.findIndex((ledgers) => ledgers.token === "USDM")].distCommission), tokenList.find((token) => token.tokenName === "USDM").decimal)
    }
    return usdmCommission
  }

  function getMSTCommission(){
    let mstCommission = 0;
    if (ledgers[ledgers.findIndex((ledgers) => ledgers.token === "MST")]){
      mstCommission = amountDivideDecimals(Number(ledgers[ledgers.findIndex((ledgers) => ledgers.token === "MST")].distCommission), tokenList.find((token) => token.tokenName === "MST").decimal)
    }
    return mstCommission
  }

  function toggleRecord() {
    logEvent(getAnalytics(), `reward_toggle_reward_detail`);
    setModal(!modal);
  }

  function claimButtonOnClick() {
    const distributionTokenList = [];
    const distributionAmountList = [];
    if (ledgers) {
      for (let index = 0; index < ledgers.length; index++) {
        const ledgerElement = ledgers[index];
        const ledgerToken = ledgerElement.token;
        // console.log(getMappedSwapToken()[ledgerToken])
        distributionTokenList.push(getMappedSwapToken()[ledgerToken]);
        distributionAmountList.push(ledgerElement.distCommission);
      }
      if (distributionTokenList && distributionAmountList) {
        claimDistributionFn(id, roundId, distributionTokenList, distributionAmountList);
      }
    }
  }

  async function claimDistributionFn(jobId, roundId, tokenList, amountList) {
    try {
      setLoading(true);
      let isDappbrowser = false;
      if (checkDappBrowser()) {
        isDappbrowser = true;
      }
      if (isDappbrowser) {
        const switchResult = await switchEthereumChain();
        if (switchResult) {
          const accounts = await getAccount();
          const accountAddress = accounts[0];
          if (accountAddress && roundId && tokenList && amountList) {
            const isClaimed = await checkIsClaimed(roundId, accountAddress);
            if (isClaimed) {
              await acquireSuccess("no txnhash");
            } else {
              const txnHash = await claimDistribution(roundId, tokenList, amountList);
              console.log("claimDistribution txnHash:", txnHash);
              let txnData = {};
              if (txnHash) {
                await getTransactionReceipt(txnHash);
              }
              console.log("claimDistribution txnData:", txnData);
            }
          }
        } else {
          notify("warn", t("networkError"));
        }
      } else {
        notify("warn", t("noDAppBrowser"));
      }
    } catch (error) {
      console.error("claimDistribution error:", error);
      // notify("warn", t("claimFailed"));
      notify("warn", t(getErrorMsgKey(error, "claimFailed")));
    }
    setLoading(false);
  }

  async function getTransactionReceipt(txnHash) {
    try {
      let txnData = await getTransaction(txnHash);
      console.log("getTransactionReceipt txnData", txnData);
      if (txnData && txnData.txn_id) {
        if (txnData.status == false) {
          notify("warn", t("claimFailed"));
        } else {
          await acquireSuccess(txnHash);
        }
      } else {
        setTimeout(() => {
          getTransactionReceipt(txnHash);
        }, 3000);
      }
    } catch (error) {
      console.error("getTransactionReceipt error", error);
      notify("warn", t("networkError"));
    }
  }

  async function acquireSuccess(txnHash) {
    if (txnHash && id) {
      const fromDate = new Date();
      const fromDateStr = `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-${fromDate.getDate()}`;
      let ACQUIRESUCCESSAPI = acquireSuccessForDistributions();
      const data = {
        jobId: id,
        txHash: txnHash,
        txDate: fromDateStr,
      };
      let apiResponse = await axios.post(ACQUIRESUCCESSAPI, data, {
        headers: {
          authorization: token,
          "content-type": "application/json",
        },
      });
      if (apiResponse && apiResponse.status === 200) {
        // setNewTransaction([]);
        setAcquireSuccessID(roundId);
        notify("primary", t("claimSuccess"));
        // window.location.href = "/referral/reward"
      } else {
        notify("warn", t("claimFailed"));
      }
    }
  }

  async function getLedgerDetail() {
    if (cronJobId) {
      try {
        let LEDGERDETAIL = LedgerDetail(cronJobId);
        let response = await axios.get(LEDGERDETAIL, {
          headers: {
            Authorization: token,
          },
        });
        if (response && response.data && response.data.data) {
          const ledgerDetails = response.data.data;
          ledgerDetails.sort(function (a, b) {
            return a.distType - b.distType;
          });

          setLedgerDetails(ledgerDetails.filter((ledgerDetail) => ledgerDetail.token === selectedToken.tokenName));
          // setTotalMSTToken(Number(ledgerDetails[0].distMSTToken) + Number(ledgerDetails[1].distMSTToken) + Number(ledgerDetails[2].distMSTToken));
        }
      } catch (error) {
        console.error("getInterestList error", error);
        notify("warn", t("networkError"));
      }
    }
  }

  function handleSelectToken(event) {
    const selected = tokenList.find(({tokenName}) => tokenName === event.target.value);
    setSelectedToken(selected);
  }

  useEffect(() => {
    try {
      if (modal) {
        getLedgerDetail();
      }
    } catch (error) {
      console.log("getList err", error);
    }
  }, [modal, selectedToken]);

  return (
    <>
      <div className={`${style["reward-container"]} ${status === 30 && distributions && distributions.status === 20 && style["reward-container-claimed"]}`}>
        <div className={style["card-header"]}>
          <div className={style["header-left"]}>
            <div>#{id && id}</div>
            <span>
              {dateFrom && dateFrom} - {(dateTo, dateTo)}
            </span>
          </div>
          <div className={style["header-right"]}>
            {status === 0 && <span className={style["pending"]}>{t("pending")}</span>}
            {status === 30 && <span className={style["approved"]}>{t("approved")}</span>}
          </div>
        </div>
        <div className={style["tokens-container"]}>
          <div className={style["tokens-container-wrap"]}>
            <div className={`${style["token-container"]} ${style["top-container"]}`}>
              <div className={style["li-label"]}>
                <div className={style["card-icon"]}>
                  <img src={icon_btcm} alt="ethm" />
                </div>
                BTC
              </div>
              <div className={style["li-value"]}>{ledgers && tokenList && floorPrecised(getBTCMCommission(), 2)}</div>
            </div>
            <div className={`${style["token-container"]} ${style["top-container"]}`}>
              <div className={style["li-label"]}>
                <div className={style["card-icon"]}>
                  <img src={icon_ethm} alt="usdm" />
                </div>
                ETH
              </div>
              <div className={style["li-value"]}>{ledgers && tokenList && floorPrecised(getETHMCommission(), 2)}</div>
            </div>
          </div>
          <div className={style["tokens-container-wrap"]}>
            <div className={style["token-container"]}>
              <div className={style["li-label"]}>
                <div className={style["card-icon"]}>
                  <img src={icon_usdm} alt="usdm" />
                </div>
                USD
              </div>
              <div className={style["li-value"]}>{ledgers && tokenList && floorPrecised(getUSDMCommission(), 2)}</div>
            </div>
            <div className={style["token-container"]}>
              <div className={style["li-label"]}>
                <div className={style["card-icon"]}>
                  <img src={icon_mst} alt="usdm" />
                </div>
                MST
              </div>
              <div className={style["li-value"]}>{ledgers && tokenList && floorPrecised(getMSTCommission(), 2)}</div>
            </div>
          </div>
        </div>
        {distributions && (status !== 30 || distributions.status === 10) && (
          <div className={style["card-footer"]}>
            <span className={style["pending"]}>{t("claim")}</span>
            <span onClick={toggleRecord}>{t("details")}</span>
          </div>
        )}
        {status === 30 && distributions && distributions.status !== 20 && (
          <div className={style["card-footer"]}>
            <span onClick={claimButtonOnClick} className={style["approved"]}>
              {t("claim")}
            </span>
            <span onClick={toggleRecord}>{t("details")}</span>
          </div>
        )}
        {status === 30 && distributions && distributions.status === 20 && (
          <div className={style["card-footer"]}>
            <span className={style["claimed"]}>{t("claimed")}</span>
          </div>
        )}
        {!distributions && (
          <div className={style["card-footer"]}>
            <span className={style["received"]}>{t("claim")}</span>
          </div>
        )}
      </div>
      <Modal isOpen={modal} toggle={toggleRecord} style={{maxWidth: "800px"}}>
        <ModalBody style={{padding: 0}}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggleRecord}>
                <img src={icon_close} alt="close" />
              </div>
            </div>
            <div className={style["rows-container"]}>
              <div className={`${style["row-container"]} ${style["topic-row"]}`}>
                <span className={style["title-container"]}>{t("details")}</span>
              </div>
            </div>
            <div className={style["rows-container"]}>
              <div className={style["date"]}>
                {dateFrom && dateFrom} - {dateTo && dateTo}
              </div>
            </div>
            <div className={style["rows-container"]}>
              <div className={style["top-reward-container"]}>
                <div className={style["table-label"]}>
                  <span></span>
                  <span>{t("amount")}</span>
                  <span>{t("usdValue")}</span>
                </div>
                {ledgers &&
                  ledgers.map((ledger) => {
                    return (
                      <div className={style["table-values"]}>
                        <span className={style["card-icon-wrap"]}>
                          <div className={style["card-icon"]}>
                            <img src={ledger && tokenList.find((token) => token.tokenName === ledger.token).tokenIcon} alt="selected-token" />
                          </div>
                          <div>{ledger && tokenFormater(ledger.token)}</div>
                        </span>
                        <span>{ledger && floorPrecised(amountDivideDecimals(ledger.distCommission, tokenList.find((token) => token.tokenName === ledger.token).decimal))}</span>
                        <span>{ledger && floorPrecised(amountDivideDecimals(ledger.distCommissionInUSDM, tokenList.find((token) => token.tokenName === "USDM").decimal))}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className={style["rows-container"]}>
              <div className={`${style["bottom-reward-container"]} ${style["large-reward-income-container"]}`}>
                <div className={style["reward-income-container-bottom"]}>
                  <div className={style["table-labels"]}>
                    <span>
                      <div className={style["token-container"]}>
                        <div className={style["card-icon"]}>
                          <img src={selectedToken && selectedToken.tokenIcon} alt="selected-token" />
                        </div>
                        <FormControl>
                          <Select value={selectedToken ? selectedToken.tokenName : ""} onChange={handleSelectToken} displayEmpty inputProps={{"aria-label": "Without label"}}>
                            <MenuItem value={"BTCM"}>BTC/MST</MenuItem>
                            <MenuItem value={"ETHM"}>ETH/MST</MenuItem>
                            <MenuItem value={"USDM"}>USD/MST</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </span>
                    <span>{t("commissionRate")}</span>
                    <span>{t("directFeeIncome")}</span>
                    <span>{t("directInterestIncome")}</span>
                    <span>{t("allSubAgentFeeIncome")}</span>
                    <span>{t("allSubAgentInterestIncome")}</span>
                    <span>{t("allChildAgentFeeIncomes")}</span>
                    <span>{t("allChildAgentInterestIncome")}</span>
                    <span>{t("netAgentFeeIncome")}</span>
                    <span className={style["border-bottom"]}>{t("netAgentInterestIncome")}</span>
                    <span>{t("totalIncome")}</span>
                  </div>
                  <>
                    {ledgerDetails &&
                      ledgerDetails.map((ledgerDetail) => {
                        return <RewardCardBottomDetail key={ledgerDetail.id} ledgerDetail={ledgerDetail} />;
                      })}
                  </>
                </div>
              </div>
            </div>
            <div className={style["button-container"]} onClick={toggleRecord}>
              <div className={style["card-button"]}>
                <span>{t("close")}</span>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default RewardCard;
