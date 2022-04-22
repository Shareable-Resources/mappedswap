import {Modal, ModalBody} from "reactstrap";
import icon_close from "../asset/icon_close.png";
import icon_stakestep from "../asset/icon_stakestep.svg";
import icon_mst from "../asset/icon_mst.svg";
import {useTranslation} from "react-i18next";
import style from "../page/MST/MST.module.scss";
import {useState, useEffect} from "react";
import {
  floorPrecised,
  getMiningUserStake,
  amountDivideDecimals,
  getUserStakeUnlocked,
  stakeToken,
  approveAllowance,
  getTransaction,
  redeemRequestForMining,
  getUserRedemptionDetailsForLiquidityMining,
  getUserStakeRewardDetailsForLiquidityMining,
  getUserStakeDetailsForLiquidityMining,
  getRedeemWaitPeriodForLiquidityMining,
  getRewardWaitPeriodForLiquidityMining,
  getRewardPeriodForLiquidityMining,
  redeemUnlockForMining,
  redeemRewardForMining,
  getLockPeriod,
  checkApprovedAmountForLiquidityMining,
  amountMultipleDecimals,
  getUserStakeRewards,
  stakeETH,
  redeemUnlockForMiningForETH,
} from "../web3";
import notify from "./Toast";
import {getWalletAddress, getTokenList} from "../store";
import StakeRecord from "./StakeRecord";
import NumberFormat from "react-number-format";
import Mining from "../contracts/Mining.json";
import {getMiningPoolTokenContract} from "../network";
import moment from "moment";
import RewardMiningRecord from "./RewardMiningRecord";
import {getAnalytics, logEvent} from "firebase/analytics";
import {getErrorMsgKey} from "../utils";

const StakingModal = ({modal, toggle, tokenName, tokenDecimal, tokenIcon, lockPeriod}) => {
  const {t} = useTranslation();
  const stakeTypeConst = {STAKE: "stake", UNSTAKE: "unstake"};
  const [stakeAmount, setStakeAmount] = useState(0);
  const [userStake, setUserStake] = useState(0);
  const [isStakeLoading, setStakeLoading] = useState(false);
  const [isRedeemUnlockLoading, setRedeemUnlockLoading] = useState(false);
  const [isApprovalLoading, setApprovalLoading] = useState(false);
  const [newTransaction, setNewTransaction] = useState([]);
  const [redeemWaitPeriod, setRedeemWaitPeriod] = useState(0);
  const [redemptionDetails, setRedemptionDetails] = useState([]);
  const [rewardDetails, setRewardDetails] = useState([]);
  const [pendingStakeSum, setPendingStakeSum] = useState(0);
  const [unlockedStakeSum, setUnlockedStakeSum] = useState(0);
  const [unlockedLiquidity, setUnlockedLiquidity] = useState(0);
  const [lockedLiquidity, setLockedLiquidity] = useState(0);
  const tokenList = getTokenList();
  const [stakeTypeIndicator, setStakeTypeIndicator] = useState(stakeTypeConst.STAKE);
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [userStakeReward, setUserStakeReward] = useState(0);

  async function handleStakeTypeChange(stakeTypeIndicator) {
    setStakeTypeIndicator(stakeTypeIndicator);
    setStakeAmount("");
  }

  async function handleStakeAmountInputChange(event) {
    event.preventDefault();
    setStakeAmount(event.target.value.replace(/,/g, ""));
  }

  function stakeMaxOnClick() {
    logEvent(getAnalytics(), `farm_stake_stake_max`);
    setStakeAmount(floorPrecised(amountDivideDecimals(Number(unlockedLiquidity), tokenDecimal), 6).replace(/,/g, ""));
  }

  async function approvalButtonOnClick() {
    if (checkMinimumStake()) {
      if (Number(stakeAmount) > 0) {
        logEvent(getAnalytics(), `farm_stake_stake_approval`);
        setApprovalLoading(true);
        try {
          const txnHash = await approveAllowance(tokenName, stakeAmount);
          await getStakeTokenTransactionReceipt(txnHash);
        } catch (err) {
          // notify("warn", t("networkError"));
          notify("warn", t(getErrorMsgKey(err, "networkError")));
          setApprovalLoading(false);
          console.error("approvalButtonOnClick error", err);
        }
      } else {
        notify("warn", t("inputErrorLargerThanZero"));
      }
    } else {
      notify("warn", t("inputErrorBelowMiniumStake"));
    }
  }

  async function stakeButtonOnClickForApproved() {
    if (checkMinimumStake()) {
      if (Number(stakeAmount) > 0) {
        logEvent(getAnalytics(), `farm_stake_stake_token`);
        setStakeLoading(true);
        try {
          const __txnHash = await stakeToken(tokenName, stakeAmount);
          await getStakeTokenTransactionReceipt(__txnHash);
        } catch (err) {
          // notify("warn", t("networkError"));
          notify("warn", t(getErrorMsgKey(err, "networkError")));
          setStakeLoading(false);
          console.error("stakeButtonOnClick error", err);
        }
      } else {
        notify("warn", t("inputErrorLargerThanZero"));
      }
    } else {
      notify("warn", t("inputErrorBelowMiniumStake"));
    }
  }

  async function stakeETHButtonOnClick() {
    if (checkMinimumStake()) {
      if (Number(stakeAmount) > 0) {
        logEvent(getAnalytics(), `farm_stake_stake_ETH`);
        setStakeLoading(true);
        try {
          const __txnHash = await stakeETH(tokenName, stakeAmount);
          console.log("__txnHash", __txnHash);
          await getStakeTokenTransactionReceipt(__txnHash);
        } catch (err) {
          // notify("warn", t("networkError"));
          notify("warn", t(getErrorMsgKey(err, "networkError")));
          setStakeLoading(false);
          console.error("stakeButtonOnClick error", err);
        }
      } else {
        notify("warn", t("inputErrorLargerThanZero"));
      }
    } else {
      notify("warn", t("inputErrorBelowMiniumStake"));
    }
  }

  async function redeemButtonOnClick() {
    if (Number(stakeAmount) > 0) {
      logEvent(getAnalytics(), `farm_stake_redeem`);
      setStakeLoading(true);
      try {
        const txnHash = await redeemRequestForMining(tokenName, stakeAmount);
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
    logEvent(getAnalytics(), `farm_stake_redeem_unlock_token`);
    setRedeemUnlockLoading(true);
    try {
      const txnHash = await redeemUnlockForMining(tokenName);
      await getStakeTokenTransactionReceipt(txnHash);
    } catch (err) {
      // notify("warn", t("networkError"));
      notify("warn", t(getErrorMsgKey(err, "networkError")));
      setRedeemUnlockLoading(false);
      console.error("redeemUnlockButtonOnClick error", err);
    }
  }

  async function redeemUnlockETHButtonOnClick() {
    logEvent(getAnalytics(), `farm_stake_redeem_unlock_ETH`);
    setRedeemUnlockLoading(true);
    try {
      const txnHash = await redeemUnlockForMiningForETH(tokenName);
      await getStakeTokenTransactionReceipt(txnHash);
    } catch (err) {
      // notify("warn", t("networkError"));
      notify("warn", t(getErrorMsgKey(err, "networkError")));
      setRedeemUnlockLoading(false);
      console.error("redeemUnlockButtonOnClick error", err);
    }
  }

  async function redeemRewardButtonOnClick() {
    if (userStakeReward > 0) {
      logEvent(getAnalytics(), `farm_stake_redeem_reward`);
      setRedeemUnlockLoading(true);
      try {
        const txnHash = await redeemRewardForMining(tokenName);
        await getStakeTokenTransactionReceipt(txnHash);
      } catch (err) {
        // notify("warn", t("networkError"));
        notify("warn", t(getErrorMsgKey(err, "networkError")));
        setRedeemUnlockLoading(false);
        console.error("redeemUnlockButtonOnClick error", err);
      }
    } else {
      notify("warn", t("inputErrorLargerThanZero"));
    }
  }

  async function getStakeTokenTransactionReceipt(txnHash) {
    if (txnHash) {
      let txnData = await getTransaction(txnHash, true);
      if (txnData && txnData.txn_id) {
        if (txnData.status == false) {
          notify("primary", t("transactionFailed"));
        } else {
          notify("primary", t("transactionSuccess"));
          setNewTransaction([]);
        }
        setStakeLoading(false);
        setRedeemUnlockLoading(false);
        setApprovalLoading(false);
      } else {
        setTimeout(() => {
          getStakeTokenTransactionReceipt(txnHash);
        }, 3000);
      }
    } else {
      setStakeLoading(false);
      setStakeLoading(false);
      setApprovalLoading(false);
      notify("warn", t("transactionFailed"));
    }
  }

  function checkRedeemStatus(requestTime, period) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (requestTime && period) {
      if (Number(currentTime) - Number(period) > Number(requestTime)) {
        return "unlocked";
      } else {
        return "pending";
      }
    } else {
      return null;
    }
  }

  function stakeAmountLargeThanApprovedAmount() {
    let approvalStatus = false;
    if (Number(approvedAmount) === Number(amountMultipleDecimals(stakeAmount, tokenDecimal)) || Number(approvedAmount) > Number(amountMultipleDecimals(stakeAmount, tokenDecimal))) {
      approvalStatus = true;
    }
    return approvalStatus;
  }

  function secondsToDay(seconds) {
    seconds = Number(seconds);
    var day = Math.floor(seconds / (3600 * 24));
    return day;
  }

  function checkMinimumStake() {
    let minimumStakeBol = true;
    if (tokenName === "wBTC" && stakeAmount < 0.0001) {
      minimumStakeBol = false;
    } else if (tokenName === "ETH" && stakeAmount < 0.001) {
      minimumStakeBol = false;
    } else if (tokenName === "USDC" && stakeAmount < 1) {
      minimumStakeBol = false;
    }
    return minimumStakeBol;
  }

  useEffect(() => {
    let isUnmount = false;
    if (getWalletAddress()) {
      async function initiateInfo() {
        try {
          const userStake = await getMiningUserStake(getMiningPoolTokenContract()[tokenName], Mining);
          // const userStakeUnlocked = await getUserStakeUnlocked(getMiningPoolTokenContract()[tokenName]);
          const redemptionDetails = await getUserRedemptionDetailsForLiquidityMining(tokenName);
          const stakeRewardDetails = await getUserStakeRewardDetailsForLiquidityMining(tokenName);
          const stakeDetails = await getUserStakeDetailsForLiquidityMining(tokenName);
          const redeemWaitPeriod = await getRedeemWaitPeriodForLiquidityMining(tokenName);
          // const rewardWaitPeriod = await getRewardWaitPeriodForLiquidityMining(tokenName);
          const lockPeriod = await getLockPeriod(getMiningPoolTokenContract()[tokenName]);
          const approvedAmount = await checkApprovedAmountForLiquidityMining(tokenName);
          const userStakeReward = await getUserStakeRewards(getMiningPoolTokenContract()[tokenName]);
          let redemptionDetailsOutput = "";
          let rewardDetailsOutput = "";
          let unlockedSum = 0;
          let pendingSum = 0;

          console.log("stakeRewardDetails ", stakeRewardDetails);

          if (redemptionDetails && redeemWaitPeriod) {
            redemptionDetailsOutput = redemptionDetails.map((element) => {
              const _requestTime = element.timestamp;
              const _unlockTime = moment.unix(element.timestamp).add(redeemWaitPeriod, "seconds").unix().toString();
              const _amount = element.amount;

              const obj = {
                requestTime: _requestTime,
                unlockTime: _unlockTime,
                amount: _amount,
                status: checkRedeemStatus(_requestTime, redeemWaitPeriod),
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

          if (redemptionDetailsOutput) {
            unlockedSum = redemptionDetailsOutput
              .filter((item) => item.status === "unlocked")
              .reduce((accumulator, item) => {
                return Number(accumulator) + Number(item.amount);
              }, 0);

            pendingSum = redemptionDetailsOutput
              .filter((item) => item.status === "pending")
              .reduce((accumulator, item) => {
                return Number(accumulator) + Number(item.amount);
              }, 0);
          }

          console.log("stakeDetails", stakeDetails);
          console.log("stakeRewardDetails", stakeRewardDetails);

          if (stakeDetails && lockPeriod) {
            var stakeDetailsOutput = stakeDetails.map((element) => ({timestamp: element.timestamp, currentStakeAmount: element.currentStakeAmount, initialStakeAmount: element.initialStakeAmount, stakeRewardsAmount: element.stakeRewardsAmount}));
            const map = new Map();
            stakeDetailsOutput.forEach((item) => map.set(item.timestamp, item));
            const mergedOutput = Array.from(map.values());
            rewardDetailsOutput = mergedOutput.map((element) => {
              const _requestTime = element.timestamp;
              const _unlockTime = moment.unix(element.timestamp).add(lockPeriod, "seconds").unix().toString();
              const _initialStakeAmount = element.initialStakeAmount;
              const _currentStakeAmount = element.currentStakeAmount;
              const _rewardAmount = element.stakeRewardsAmount;
              const obj = {
                requestTime: _requestTime,
                unlockTime: _unlockTime,
                currentStakeAmount: _currentStakeAmount ? _currentStakeAmount : "0",
                initialStakeAmount: _initialStakeAmount ? _initialStakeAmount : "0",
                rewardAmount: _rewardAmount ? _rewardAmount : "0",
                status: checkRedeemStatus(_requestTime, lockPeriod),
              };
              return obj;
            });

            rewardDetailsOutput.sort(function (a, b) {
              var keyA = a.requestTime;
              var keyB = b.requestTime;
              // Compare the 2 dates
              if (keyA < keyB) return 1;
              if (keyA > keyB) return -1;
              return 0;
            });
          }

          // const totalRewardSum = rewardDetailsOutput.reduce((accumulator, item) => {
          //   return Number(accumulator) + Number(item.rewardAmount);
          // }, 0);

          const lockedLiquidity = rewardDetailsOutput
            .filter((item) => item.status === "pending")
            .reduce((accumulator, item) => {
              return Number(accumulator) + Number(item.currentStakeAmount);
            }, 0);

          const unlockedLiquidity = rewardDetailsOutput
            .filter((item) => item.status === "unlocked")
            .reduce((accumulator, item) => {
              return Number(accumulator) + Number(item.currentStakeAmount);
            }, 0);

          setRewardDetails(rewardDetailsOutput);
          setUserStake(userStake);
          setRedeemWaitPeriod(redeemWaitPeriod);
          setRedemptionDetails(redemptionDetailsOutput);
          setLockedLiquidity(lockedLiquidity);
          setUnlockedLiquidity(unlockedLiquidity);
          setApprovedAmount(approvedAmount);
          setUserStakeReward(userStakeReward);
          setPendingStakeSum(pendingSum);
          setUnlockedStakeSum(unlockedSum);
        } catch (error) {
          console.log("Network Error");
          notify("warn", t("networkError"));
        }
      }

      if (modal) {
        initiateInfo();
      }
    }
    return () => (isUnmount = true);
  }, [redeemWaitPeriod, modal, newTransaction]);

  console.log(rewardDetails);

  return (
    <>
      <Modal isOpen={modal} toggle={toggle} style={{maxWidth: "1400px"}}>
        <ModalBody style={{padding: 0}}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggle}>
                <img src={icon_close} alt="close" />
              </div>
            </div>
            <div className={style["large-stake-wrap"]}>
              <div className={style["stake-records-wrap"]}>
                <div className={style["title"]}>{stakeTypeIndicator === stakeTypeConst.STAKE ? t("stakeRecords") : t("unstakeRequest")}</div>
                <div className={style["stake-records-container"]}>
                  {/* {stakeTypeIndicator === stakeTypeConst.STAKE && (
                    <div className={style["flex-stake-container"]}>
                      <div className={`${style["stake-info"]} ${style["unstake"]}`}>
                        <span className={`${style["card-body"]} ${style["unlock"]}`}>
                          <div className={style["li-value"]}>
                            {" "}
                            <div className={style["card-icon"]} onClick={toggle}>
                              <img src={icon_mst} alt="close" />
                            </div>
                            {userStakeReward && floorPrecised(amountDivideDecimals(userStakeReward, tokenList.find((token) => token.tokenName === "MST").decimal), 2)}
                          </div>
                          <div className={`${style["li-label"]} ${style["li-label-unlock"]}`}> {t("claimableInitialRewards")} </div>
                        </span>
                      </div>
                      {Number(userStakeReward) > 0 && <div className={style["redeem-button"]}>{isRedeemUnlockLoading ? <div className={style["loading"]}> {t("loading")}</div> : <div onClick={() => redeemRewardButtonOnClick()}>{t("redeemReward")}</div>}</div>}
                      {(Number(userStakeReward) < 0 || Number(userStakeReward) === 0) && (
                        <div className={style["redeem-button"]}>
                          <div className={style["disabled"]}>{t("redeemReward")}</div>
                        </div>
                      )}
                    </div>
                  )} */}
                  {stakeTypeIndicator === stakeTypeConst.UNSTAKE && (
                    <div className={style["flex-stake-container"]}>
                      <div className={`${style["stake-info"]} ${style["unstake"]}`}>
                        <span className={`${style["card-body"]}`}>
                          <div className={style["li-value"]}>
                            {" "}
                            <div className={style["card-icon"]} onClick={toggle}>
                              <img src={tokenIcon} alt="close" />
                            </div>
                            {pendingStakeSum && floorPrecised(amountDivideDecimals(pendingStakeSum, tokenList.find((token) => token.tokenName === tokenName).decimal), 6)}
                          </div>
                          <div className={`${style["li-label"]} ${style["li-label-pending"]}`}> {t("pending")} </div>
                        </span>
                        <span className={`${style["card-body"]} ${style["unlock"]}`}>
                          <div className={style["li-value"]}>
                            {" "}
                            <div className={style["card-icon"]} onClick={toggle}>
                              <img src={tokenIcon} alt="close" />
                            </div>
                            {unlockedStakeSum && floorPrecised(amountDivideDecimals(unlockedStakeSum, tokenList.find((token) => token.tokenName === tokenName).decimal), 6)}
                          </div>
                          <div className={`${style["li-label"]} ${style["li-label-unlock"]}`}> {t("unlock")} </div>
                        </span>
                      </div>
                      {redemptionDetails[0] && (
                        <div className={style["redeem-button"]}>{isRedeemUnlockLoading ? <div className={style["loading"]}> {t("loading")}</div> : <div onClick={tokenName === "ETH" ? () => redeemUnlockETHButtonOnClick() : () => redeemUnlockButtonOnClick()}>{t("redeemUnlock")}</div>}</div>
                      )}
                      {!redemptionDetails[0] && (
                        <div className={style["redeem-button"]}>
                          <div className={style["disabled"]}>{t("redeemUnlock")}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={style["year-stake-container"]}>
                    <div className={style["year-stake-container"]}>
                      {stakeTypeIndicator === stakeTypeConst.STAKE && (
                        <div className={style["title"]}>
                          {t("stakingPeriod")}: {lockPeriod && secondsToDay(lockPeriod)} {t("Day")}
                        </div>
                      )}

                      {stakeTypeIndicator === stakeTypeConst.UNSTAKE && (
                        <div className={style["stake-cards"]}>
                          {redemptionDetails &&
                            redemptionDetails.map((element) => {
                              return <StakeRecord key={element.requestTime} tokenName={tokenName} amount={element.amount} requestTime={element.requestTime} unlockTime={element.unlockTime} status={element.status} />;
                            })}
                        </div>
                      )}
                      {stakeTypeIndicator === stakeTypeConst.STAKE && (
                        <div className={style["stake-cards"]}>
                          {rewardDetails &&
                            rewardDetails
                              .filter((item) => item.requestTime !== "0")
                              .map((element) => {
                                return (
                                  <RewardMiningRecord
                                    key={element.requestTime}
                                    tokenName={tokenName}
                                    rewardAmount={element.rewardAmount}
                                    initialStakeAmount={element.initialStakeAmount}
                                    currentStakeAmount={element.currentStakeAmount}
                                    requestTime={element.requestTime}
                                    unlockTime={element.unlockTime}
                                    status={element.status}
                                  />
                                );
                              })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={style["stake-trader-wrap"]}>
                <div className={style["title"]}>
                  {tokenName} {t("stake")}
                </div>
                <div className={style["your-stake-container"]}>
                  <div className={style["top-container"]}>
                    <div className={style["li-label"]}> {t("yourStaking")} </div>
                    <div className={style["li-value"]}>
                      {" "}
                      <div className={style["card-icon"]} onClick={toggle}>
                        <img src={tokenIcon} alt="close" />
                      </div>
                      {userStake ? floorPrecised(amountDivideDecimals(Number(userStake), tokenDecimal), 6) : 0}
                    </div>
                  </div>
                  <div className={style["bottom-container"]}>
                    <span className={`${style["card-body"]} ${style["border-right"]}`}>
                      <div className={style["li-value"]}>
                        {" "}
                        <div className={style["card-icon"]}>
                          <img src={tokenIcon} alt="close" />
                        </div>
                        {unlockedLiquidity ? floorPrecised(amountDivideDecimals(Number(unlockedLiquidity), tokenDecimal), 6) : 0}
                      </div>
                      <div className={style["li-label"]}> {t("unlockedLiquidity")} </div>
                    </span>
                    <span className={`${style["card-body"]} ${style["border-right"]}`}>
                      <div className={style["li-value"]}>
                        {" "}
                        <div className={style["card-icon"]}>
                          <img src={tokenIcon} alt="close" />
                        </div>
                        {lockedLiquidity ? floorPrecised(amountDivideDecimals(Number(lockedLiquidity), tokenDecimal), 6) : 0}
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
                          <img src={tokenIcon} alt="from_icon" />
                        </div>
                      </div>
                      <div className={style["input-container"]}>
                        <NumberFormat
                          thousandsGroupStyle="thousand"
                          value={stakeAmount === 0 ? "" : stakeAmount}
                          placeholder="0.00"
                          decimalSeparator="."
                          decimalScale={6}
                          displayType="input"
                          type="text"
                          thousandSeparator={true}
                          allowNegative={false}
                          onChange={handleStakeAmountInputChange}
                          inputMode="decimal"
                        />
                        {stakeTypeIndicator === stakeTypeConst.UNSTAKE && (
                          <div className={`${style["max"]}`} onClick={stakeMaxOnClick}>
                            {t("max")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {stakeTypeIndicator === stakeTypeConst.STAKE && !(tokenName === "ETH") && (
                    <div className={`${style["card-button-double"]}`}>
                      {isApprovalLoading ? (
                        <div className={style["button-wrap"]}>
                          <span className={style["circle"]}>1</span>
                          <div className={style["loading"]}> {t("loading")}</div>
                        </div>
                      ) : (
                        <div className={style["button-wrap"]}>
                          <span className={style["circle"]}>1</span>
                          {stakeAmountLargeThanApprovedAmount() ? <div className={style["disabled"]}>{t("allowToStake")}</div> : <div onClick={() => approvalButtonOnClick()}>{t("allowToStake")}</div>}
                        </div>
                      )}
                      <span className={style["card-icon"]}>
                        <img src={icon_stakestep} alt="close" />
                      </span>
                      {isStakeLoading ? (
                        <div className={style["button-wrap"]}>
                          <span className={style["circle"]}>2</span>
                          <div className={style["loading"]}> {t("loading")}</div>
                        </div>
                      ) : (
                        <div className={style["button-wrap"]}>
                          <span className={style["circle"]}>2</span>
                          {stakeAmountLargeThanApprovedAmount() ? <div onClick={() => stakeButtonOnClickForApproved()}>{t("stake")}</div> : <div className={style["disabled"]}>{t("stake")}</div>}
                        </div>
                      )}
                    </div>
                  )}
                  {stakeTypeIndicator === stakeTypeConst.STAKE && tokenName === "ETH" && <div className={style["card-button"]}>{isStakeLoading ? <div className={style["loading"]}> {t("loading")}</div> : <>{<div onClick={() => stakeETHButtonOnClick()}>{t("stake")}</div>}</>}</div>}
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

export default StakingModal;
