import {Modal, ModalBody} from "reactstrap";
import icon_close from "../asset/icon_close.png";
import icon_mst from "../asset/icon_mst.svg";
import {useTranslation} from "react-i18next";
import style from "../page/MST/MST.module.scss";
import {useState, useEffect} from "react";
import {floorPrecised, getUserRedemptionDetails, getTransaction, getUserStake, getUserStaking, toFixed, amountDivideDecimals, redeemRequest, getRedeemWaitPeriod, redeemUnlock, transferToken, getUserStakingDetails, getUserLockedStaking} from "../web3";
import notify from "./Toast";
import {getWalletAddress, getTokenList} from "../store";
import StakeRecord from "./StakeRecord";
import NumberFormat from "react-number-format";
import ProgressBar from "./Progressbar";
import {getMstSmartContractAddress, getStakingContractAddress} from "../network";
import moment from "moment";
import Staking from "../contracts/Staking.json";
import {getErrorMsgKey} from "../utils";
import {getAnalytics, logEvent} from "firebase/analytics";
import RewardStakingRecord from "./RewardStakingRecord";
import {containerClasses} from "@mui/material";


const ReferralStakingModal = ({modal, toggle, myGradeValue, commisionRate, setNewTransactionFromParent}) => {
  const {t} = useTranslation();
  const tokenList = getTokenList();
  const stakeTypeConst = {STAKE: "stake", UNSTAKE: "unstake"};
  const [stakeAmount, setStakeAmount] = useState(0);
  const [userTotalStake, setMyStakingValue] = useState(0);
  const [tokenName, setTokenName] = useState("MST");
  const [newTransaction, setNewTransaction] = useState([]);
  const [redemptionDetails, setRedemptionDetails] = useState([]);
  const [redeemWaitPeriod, setRedeemWaitPeriod] = useState(0);
  const [unlockedSum, setUnlockedSum] = useState(0);
  const [pendingSum, setPendingSum] = useState(0);
  const [stakeTypeIndicator, setStakeTypeIndicator] = useState(stakeTypeConst.STAKE);
  const [isStakeLoading, setStakeLoading] = useState(false);
  const [isRedeemUnlockLoading, setRedeemUnlockLoading] = useState(false);
  const [userStakingDetails, setUserStakingDetails] = useState([]);
  const [userStaking, setUserStaking] = useState({});
  const tokenDecimal = tokenList.find((token) => token.tokenName === tokenName).decimal;

  async function handleStakeTypeChange(stakeTypeIndicator) {
    setStakeTypeIndicator(stakeTypeIndicator);
    setStakeAmount("");
  }

  async function handleStakeAmountInputChange(event) {
    event.preventDefault();
    setStakeAmount(event.target.value.replace(/,/g, ""));
  }

  function stakeMaxOnClick() {
    if (userStaking && userStaking.lockedStakingRedeemable && userStaking.freeStaking) {
      const stakeMaxNum = toFixed(amountDivideDecimals(Number(userStaking.lockedStakingRedeemable) + Number(userStaking.freeStaking), tokenDecimal), 2);
      console.log(stakeMaxNum.replace(/,/g, ""));
      setStakeAmount(stakeMaxNum.replace(/,/g, ""));
    }
  }

  async function getStakeTokenTransactionReceipt(txnHash) {
    if (txnHash) {
      let txnData = await getTransaction(txnHash);
      if (txnData && txnData.txn_id) {
        if (txnData.status == false) {
          notify("primary", t("transactionFailed"));
        } else {
          notify("primary", t("transactionSuccess"));
          setNewTransaction([]);
          setNewTransactionFromParent([]);
        }
        setStakeLoading(false);
        setRedeemUnlockLoading(false);
      } else {
        setTimeout(() => {
          getStakeTokenTransactionReceipt(txnHash);
        }, 3000);
      }
    } else {
      setStakeLoading(false);
      setRedeemUnlockLoading(false);
      notify("warn", t("transactionFailed"));
    }
  }

  async function stakeButtonOnClick() {
    console.log(Number(stakeAmount));
    if (Number(stakeAmount) > 0) {
      logEvent(getAnalytics(), `referral_stake_token`);
      setStakeLoading(true);
      try {
        const txnHash = await transferToken(tokenName, stakeAmount, getStakingContractAddress());
        await getStakeTokenTransactionReceipt(txnHash);
      } catch (err) {
        // notify("warn", t("networkError"));
        notify("warn", t(getErrorMsgKey(err, "networkError")));
        setStakeLoading(false);
        console.error("stakeButtonOnClick error", err);
      }
    } else {
      notify("warn", t("inputErrorLargerThanZero"));
    }
  }

  async function redeemButtonOnClick() {
    if (Number(stakeAmount) > 0) {
      logEvent(getAnalytics(), `referral_redeem_request`);
      setStakeLoading(true);
      try {
        const txnHash = await redeemRequest(tokenName, stakeAmount);
        await getStakeTokenTransactionReceipt(txnHash);
      } catch (err) {
        // notify("warn", t("networkError"));
        notify("warn", t(getErrorMsgKey(err, "networkError")));
        setStakeLoading(false);
        console.error("redeemButtonOnClick error", err);
      }
    }
  }

  async function redeemUnlockButtonOnClick() {
    if (unlockedSum > 0) {
      logEvent(getAnalytics(), `referral_redeem_unlock`);
      setRedeemUnlockLoading(true);
      try {
        const txnHash = await redeemUnlock(tokenName);
        await getStakeTokenTransactionReceipt(txnHash);
      } catch (err) {
        // notify("warn", t("networkError"));
        notify("warn", t(getErrorMsgKey(err, "networkError")));
        setRedeemUnlockLoading(false);
        console.error("redeemUnlockButtonOnClick error", err);
      }
    } else {
      notify("warn", t("Insufficient"));
    }
  }

  function checkRedeemStatus(requestTime) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (requestTime && redeemWaitPeriod) {
      if (Number(currentTime) - Number(redeemWaitPeriod) > Number(requestTime)) {
        return "unlocked";
      } else {
        return "pending";
      }
    } else {
      return null;
    }
  }

  useEffect(() => {
    if (modal) {
      let isUnmount = false;
      if (getWalletAddress()) {
        async function initiateInfo() {
          try {
            const userTotalStake = await getUserStake(getStakingContractAddress(), getMstSmartContractAddress(), Staking);
            const userStakingDetails = await getUserStakingDetails(getStakingContractAddress(), getMstSmartContractAddress(), Staking);
            const userStaking = await getUserStaking(getStakingContractAddress(), getMstSmartContractAddress(), Staking);

            let userStakingDetailsOutput = [...userStakingDetails];
            if (userStakingDetails) {
              userStakingDetailsOutput.sort(function (a, b) {
                var keyA = a.stakeTime;
                var keyB = b.stakeTime;
                // Compare the 2 dates
                if (keyA < keyB) return 1;
                if (keyA > keyB) return -1;
                return 0;
              });
            }

            const redemptionDetails = await getUserRedemptionDetails();
            const redeemWaitPeriod = await getRedeemWaitPeriod();
            let redemptionDetailsOutput = "";

            if (redemptionDetails && redeemWaitPeriod) {
              redemptionDetailsOutput = redemptionDetails.map((element) => {
                const _requestTime = element.requestTime;
                const _unlockTime = moment.unix(element.requestTime).add(redeemWaitPeriod, "seconds").unix().toString();
                const _amount = element.amount;

                const obj = {
                  requestTime: _requestTime,
                  unlockTime: _unlockTime,
                  amount: _amount,
                  status: checkRedeemStatus(_requestTime),
                };
                return obj;
              });

              redemptionDetailsOutput.sort(function (a, b) {
                var keyA = a.requestTime;
                var keyB = b.requestTime;
                // Compare the 2 dates
                if (keyA < keyB) return 1;
                if (keyA > keyB) return -1;
                return 0;
              });
            }

            const unlockedSum = redemptionDetailsOutput
              .filter((item) => item.status === "unlocked")
              .reduce((accumulator, item) => {
                return Number(accumulator) + Number(item.amount);
              }, 0);

            const pendingSum = redemptionDetailsOutput
              .filter((item) => item.status === "pending")
              .reduce((accumulator, item) => {
                return Number(accumulator) + Number(item.amount);
              }, 0);

            if (!isUnmount) {
              setUserStaking(userStaking);
              setMyStakingValue(userTotalStake);
              setRedemptionDetails(redemptionDetailsOutput);
              setRedeemWaitPeriod(redeemWaitPeriod);
              setUnlockedSum(unlockedSum);
              setPendingSum(pendingSum);
              setUserStakingDetails(userStakingDetailsOutput);
            }
          } catch (error) {
            console.log("Network Error", error);
            notify("warn", t("networkError"));
          }
        }
        initiateInfo();
      }
      return () => (isUnmount = true);
    }
  }, [newTransaction, redeemWaitPeriod, modal]);

  return (
    <>
      <Modal isOpen={modal} toggle={toggle} style={{maxWidth: "1100px"}}>
        <ModalBody style={{padding: 0}}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggle}>
                <img src={icon_close} alt="close" />
              </div>
            </div>
            <div className={style["large-stake-wrap"]}>
              <div className={style["stake-records-wrap"]}>
                <div className={style["title"]}>{stakeTypeIndicator === stakeTypeConst.UNSTAKE ? t("unstakeRequest") : t("MiningInitialReward")}</div>
                <div className={style["stake-records-container"]}>
                  {stakeTypeIndicator === stakeTypeConst.UNSTAKE && (
                    <div className={style["flex-stake-container"]}>
                      <div className={`${style["stake-info"]} ${style["unstake"]}`}>
                        <span className={`${style["card-body"]} ${style["pending"]}`}>
                          <div className={style["li-value"]}> {(pendingSum && floorPrecised(amountDivideDecimals(pendingSum, tokenList.find((token) => token.tokenName === tokenName).decimal), 2))}</div>
                          <div className={`${style["li-label"]} ${style["li-label-pending"]}`}> {t("pending")} </div>
                        </span>
                        <span className={`${style["card-body"]} ${style["unlock"]}`}>
                          <div className={style["li-value"]}> {unlockedSum && floorPrecised(amountDivideDecimals(unlockedSum, tokenList.find((token) => token.tokenName === tokenName).decimal), 2)}</div>
                          <div className={`${style["li-label"]} ${style["li-label-unlock"]}`}> {t("unlock")} </div>
                        </span>
                      </div>
                      {redemptionDetails && redemptionDetails.length > 0 && <div className={style["redeem-button"]}>{isRedeemUnlockLoading ? <div className={style["loading"]}> {t("loading")}</div> : <div onClick={() => redeemUnlockButtonOnClick()}>{t("redeemUnlock")}</div>}</div>}
                    </div>
                  )}
                  <div className={style["year-stake-container"]}>
                    <div className={style["year-stake-container"]}>
                      {stakeTypeIndicator === stakeTypeConst.UNSTAKE && (
                        <div className={style["stake-cards"]}>
                          {redemptionDetails &&
                            redemptionDetails.length > 0 &&
                            redemptionDetails.map((redemptionDetail) => {
                              return <StakeRecord key={redemptionDetail.requestTime} tokenName={tokenName} amount={redemptionDetail.amount} requestTime={redemptionDetail.requestTime} unlockTime={redemptionDetail.unlockTime} status={redemptionDetail.status} />;
                            })}
                        </div>
                      )}
                      {stakeTypeIndicator === stakeTypeConst.STAKE && (
                        <div className={`${style["stake-cards"]} ${style["stake-mst"]}`}>
                          {userStakingDetails && userStakingDetails.length > 1 ? (
                            userStakingDetails
                              .filter((item) => item.stakeTime !== "0")
                              .map((userStakingDetail) => {
                                return (
                                  <RewardStakingRecord
                                    key={userStakingDetail.stakeTime}
                                    stakeTime={userStakingDetail.stakeTime}
                                    totalDivision={userStakingDetail.division}
                                    // unlockedAmount={userStakingDetail.unlockedAmount}
                                    initialStakeAmount={userStakingDetail.initialStakeAmount}
                                    unlockInterval={userStakingDetail.unlockInterval}
                                    remainAmount={userStakingDetail.remainAmount}
                                  />
                                );
                              })
                          ) : (
                            <div className={style["no-record"]}>{t("noRecord")}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={style["stake-trader-wrap"]}>
                <div className={style["title"]}>{t("traderMSTStaking")}</div>
                <div className={style["middle-container"]}>
                  <div className={style["middle-container-left"]}>
                    <div className={style["middle-container-left-top"]}>
                      <span>
                        <div className={style["li-label"]}>{t("yourMSTStaking")}</div>
                        <div className={style["li-value"]}>
                          <div className={style["card-icon"]}>
                            <img src={icon_mst} alt="ethm" />
                          </div>
                          <div className={style["stake-value"]}>{userStaking && userStaking.totalStaked ? toFixed(amountDivideDecimals(Number(userStaking.totalStaked), tokenDecimal), 2) : 0}</div>
                        </div>
                      </span>
                    </div>
                    <div className={style["middle-container-left-bottom"]}>
                      <span>
                        <div className={style["li-label"]}>{t("grade")}</div>
                        <div className={style["li-value"]}>
                          <div className={style["level"]}>{myGradeValue ? `${myGradeValue}` : "N/A"} </div>
                        </div>
                      </span>
                      <span>
                        <div className={style["li-label"]}>{t("commissionRate")}</div>
                        <div className={style["li-value"]}>
                          {" "}
                          {commisionRate && (
                            <div className={style["bar"]}>
                              <ProgressBar completed={commisionRate && commisionRate} color={"#61BCF4"} />
                            </div>
                          )}
                          <div className={style["percentage"]}>{commisionRate ? `${commisionRate}%` : "N/A"}</div>{" "}
                        </div>
                      </span>
                    </div>
                  </div>
                  <div className={style["middle-container-right"]}>
                    <span className={`${style["card-body"]} ${style["border-right"]}`}>
                      <div className={style["li-value"]}>
                        {" "}
                        <div className={style["card-icon"]}>
                          <img src={icon_mst} alt="close" />
                        </div>
                        {userStaking && userStaking.lockedStakingRedeemable && userStaking.freeStaking ? toFixed(amountDivideDecimals(Number(userStaking.lockedStakingRedeemable) + Number(userStaking.freeStaking), tokenDecimal), 2) : 0}
                      </div>
                      <div className={style["li-label"]}> {t("unlockedLiquidity")} </div>
                    </span>
                    <span className={`${style["card-body"]} ${style["border-right"]}`}>
                      <div className={style["li-value"]}>
                        {" "}
                        <div className={style["card-icon"]}>
                          <img src={icon_mst} alt="close" />
                        </div>
                        {userStaking && userStaking.lockedStakingLocked ? toFixed(amountDivideDecimals(Number(userStaking.lockedStakingLocked), tokenDecimal), 2) : 0}
                      </div>
                      <div className={style["li-label"]}> {t("lockedLiquidity")} </div>
                    </span>
                  </div>
                </div>
                <div className={style["card-middle"]}>
                  <div className={style["chart-tab"]}>
                    <span onClick={() => handleStakeTypeChange(stakeTypeConst.STAKE)} className={`${stakeTypeIndicator === stakeTypeConst.STAKE ? style["active"] : ""}`}>
                      {t("stake")}
                    </span>
                    <span onClick={() => handleStakeTypeChange(stakeTypeConst.UNSTAKE)} className={`${stakeTypeIndicator === stakeTypeConst.UNSTAKE ? style["active"] : ""}`}>
                      {t("unstake")}
                    </span>
                  </div>
                  <div className={style["value-wrapper"]}>
                    <div className={`${style["value-container"]}`}>
                      {/* <div className={`${style['value-container']} ${style['value-active']}`}> */}
                      <div className={style["label-container"]}>
                        <div className={style["card-icon"]}>
                          <img src={icon_mst} alt="from_icon" />
                        </div>
                      </div>
                      <div className={style["input-container"]}>
                        <NumberFormat
                          thousandsGroupStyle="thousand"
                          value={stakeAmount === 0 ? "" : stakeAmount}
                          placeholder="0.00"
                          decimalSeparator="."
                          displayType="input"
                          type="text"
                          thousandSeparator={true}
                          allowNegative={false}
                          decimalScale={2}
                          onChange={handleStakeAmountInputChange}
                          inputMode="decimal"
                        />
                        {stakeTypeIndicator === stakeTypeConst.UNSTAKE && (
                          <div className={`${style["max"]}`} onClick={() => stakeMaxOnClick()}>
                            {t("max")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {stakeTypeIndicator === stakeTypeConst.STAKE && <div className={style["card-button"]}>{isStakeLoading ? <div className={style["loading"]}> {t("loading")}</div> : <div onClick={() => stakeButtonOnClick()}>{t("stake")}</div>}</div>}
                  {stakeTypeIndicator === stakeTypeConst.UNSTAKE && (
                    <div className={style["card-button"]}>
                      {isStakeLoading ? (
                        <div className={style["loading"]}> {t("loading")}</div>
                      ) : (
                        <div onClick={() => redeemButtonOnClick()} className={stakeAmount > 0 ? style[""] : style["disabled"]}>
                          {t("unstake")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ReferralStakingModal;
