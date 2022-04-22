import style from "../page/MST/MST.module.scss";
import {useTranslation} from "react-i18next";
import {getTokenList, getToken} from "../store";
import {amountDivideDecimals, claimDistribution, checkDappBrowser, switchEthereumChain, getAccount, getTransaction, checkIsClaimed, floorPrecised} from "../web3";
import moment from "moment";
import {getMiningPoolTokenContract, getMstSmartContractAddress} from "../network";
import {useState, useEffect} from "react";
import notify from "../component/Toast";
import {acquireSuccessForMiningRewards} from "../api";
import axios from "axios";
import {getErrorMsgKey} from "../utils";
import {getAnalytics, logEvent} from "firebase/analytics";

const ClaimRecord = ({id, roundId, jobId, acquiredDate, amount, status, claimStatus, mstExchangeRate, exchangeRate, setAcquireSuccessID}) => {
  const {t} = useTranslation();
  const tokenList = getTokenList();
  const [loading, setLoading] = useState(false);
  const [newTransaction, setNewTransaction] = useState([]);
  const token = getToken();
  const tokenDecimal = tokenList.find((token) => token.tokenName === "MST").decimal;

  function getTokenNameByAddress(object, value) {
    return Object.keys(object).find((key) => object[key].toLowerCase() === value);
  }

  function claimButtonOnClick() {
    logEvent(getAnalytics(), `farm_claim_button`);
    const distributionTokenList = [];
    const distributionAmountList = [];
    distributionTokenList.push(getMstSmartContractAddress());
    distributionAmountList.push(amount);
    if (distributionTokenList && distributionAmountList) {
      claimDistributionFn(jobId, roundId, distributionTokenList, distributionAmountList);
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
              // await acquireSuccess()
              notify("warn", t("claimFailed"));
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
    console.log("getTransactionReceipt txnHash", txnHash);
    try {
      let txnData = await getTransaction(txnHash);
      console.log("getTransactionReceipt txnData", txnData);
      if (txnData && txnData.txn_id) {
        if (txnData.status == false) {
          notify("warn", t("claimFailed"));
        } else {
          await acquireSuccess();
        }
      } else {
        setTimeout(() => {
          getTransactionReceipt(txnHash);
        }, 3000);
      }
    } catch (error) {
      console.error("getTransactionReceipt error", error);
      notify("warn", t(""));
    }
  }

  async function acquireSuccess() {
    let ACQUIRESUCCESSAPI = acquireSuccessForMiningRewards();
    let apiResponse = await axios.post(
      ACQUIRESUCCESSAPI,
      {id: parseInt(id)},
      {
        headers: {
          Authorization: token,
          "content-type": "application/json",
        },
      }
    );
    if (apiResponse && apiResponse.data && apiResponse.data.success) {
      setNewTransaction([]);
      setAcquireSuccessID(roundId);
      notify("primary", t("claimSuccess"));
    } else {
      notify("warn", t("claimFailed"));
      window.location.href = "/stake";
    }
  }

  return (
    <>
      <tr>
        <td className={style["time"]}>{acquiredDate && moment.unix(acquiredDate).format("YYYY-MM-DD HH:mm")}</td>
        <td className={style["blocknumber"]}>{floorPrecised(amountDivideDecimals(amount, tokenDecimal))} MST</td>
        <td className={`${style["status"]} ${style["pending"]}`}>{status === 0 ? t("pending") : t("approved")}</td>
        <td className={style["claim"]}>
          {status !== 0 ? (
            <>
              {claimStatus === 10 && <span onClick={() => claimButtonOnClick()}>{t("claim")}</span>}
              {claimStatus !== 10 && <span className={style["disabled"]}>{t("claimed")}</span>}
            </>
          ) : (
            <span className={style["disabled"]}>{t("claim")}</span>
          )}
        </td>
      </tr>
    </>
  );
};

export default ClaimRecord;
