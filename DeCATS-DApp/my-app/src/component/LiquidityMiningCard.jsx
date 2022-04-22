import icon_mst from "../asset/icon_mst.svg";
import style from "../page/MST/MST.module.scss";
import "react-circular-progressbar/dist/styles.css";
import {useTranslation} from "react-i18next";
import {useState, useEffect, useRef, useLayoutEffect} from "react";
import StakingModal from "./StakingModal";
import ClaimModal from "./ClaimModal";
import {getTotalAnnualRewards, amountDivideDecimals, getFixedPoolCapacityUSD, getLockPeriod, getFixedPoolUsageUSD, getPoolStake, floorPrecised, getMiningUserStake, checkIssideChainNetworks, switchEthereumChain} from "../web3";
import {getWalletAddress, getTokenList, getToken, getLang} from "../store";
import notify from "./Toast";
import {getMiningPoolTokenContract} from "../network";
import Mining from "../contracts/Mining.json";
import {thousandsMillionsFormatter} from "../utils";
import {getClaimSummary} from "../api";
import axios from "axios";
import {getAnalytics, logEvent} from "firebase/analytics";

const LiquidityMiningCard = ({tokenName}) => {
  const poolInitialReturn = 100;
  const {t} = useTranslation();
  const tokenList = getTokenList();
  const token = getToken();
  const usdDecimal = tokenList.find((token) => token.tokenName === "USD").decimal;
  const mstDecimal = tokenList.find((token) => token.tokenName === "MST").decimal;
  const tokenDecimal = tokenList.find((token) => token.tokenName === tokenName).decimal;
  const tokenIcon = tokenList.find((token) => token.tokenName === tokenName).tokenIcon;
  const [stakingModal, setStakingModal] = useState(false);
  const [claimModal, setClaimModal] = useState(false);
  const [userStake, setUserStake] = useState(0);
  const [annualReward, setAnnualReward] = useState(0);
  const [fixedPoolCapacity, setFixedPoolCapacity] = useState(0);
  const [poolUsage, setPoolUsage] = useState(0);
  const [lockPeriod, setLockPeriod] = useState(0);
  const [miningReward, setMiningReward] = useState(0);
  const firstUpdate = useRef(true);

  async function toggleStakingModal() {
    logEvent(getAnalytics(), `farm_toggle_stake`);
    if (token) {
      try {
        setStakingModal(!stakingModal);
      } catch (error) {
        console.error("toggleStakingModal error", error);
        notify("warn", t("networkError"));
      }
    } else {
      notify("warn", t("pleaseLoginInMetamask"));
    }
  }

  async function toggleClaimModal() {
    logEvent(getAnalytics(), `farm_toggle_claim`);
    if (token) {
      setClaimModal(!claimModal);
    } else {
      notify("warn", t("pleaseLoginInMetamask"));
    }
  }

  function getNextLiquidityAmount() {
    if (Number(poolUsage) > Number(fixedPoolCapacity)) {
      return 0;
    } else {
      return Number(fixedPoolCapacity) - Number(poolUsage);
    }
  }

  async function getClaimSummaryFn() {
    try {
      let CLAIMSUMMARY = getClaimSummary(tokenName);
      let response = await axios.get(CLAIMSUMMARY, {
        headers: {
          authorization: token,
        },
      });
      if (response && response.data && response.data.data && response.data.data.rows[0]) {
        setMiningReward(response.data.data.rows[0].amount);
      }
    } catch (error) {
      console.error("getClaimSummaryFn error", error);
      notify("warn", t("networkError"));
    }
  }

  useEffect(() => {
    let isUnmount = false;

    async function initiateInfo() {
      try {
        if (getWalletAddress()) {
          const userStake = await getMiningUserStake(getMiningPoolTokenContract()[tokenName], Mining);
          setUserStake(userStake);
          getClaimSummaryFn();
        }
        const annualReward = await getTotalAnnualRewards(getMiningPoolTokenContract()[tokenName]);
        const fixedPoolCapacity = await getFixedPoolCapacityUSD(getMiningPoolTokenContract()[tokenName]);
        const poolUsage = await getFixedPoolUsageUSD(getMiningPoolTokenContract()[tokenName]);
        const lockPeriod = await getLockPeriod(getMiningPoolTokenContract()[tokenName]);
        const poolStake = await getPoolStake(getMiningPoolTokenContract()[tokenName]);

        // const rewardPeriod = await getRewardPeriodForLiquidityMining(tokenName
        // setPoolStake(poolStake)
        setPoolUsage(poolUsage);
        setAnnualReward(annualReward);
        setFixedPoolCapacity(fixedPoolCapacity);
        setLockPeriod(lockPeriod);
        // setRewardPeriod(rewardPeriod)
      } catch (error) {
        console.log("Network Error");
        notify("warn", t("networkError"));
      }
    }
    initiateInfo();

    return () => (isUnmount = true);
  }, [stakingModal]);

  return (
    <>
      <div className={style["pool-container"]}>
        <div className={style["pool-header"]}>
          <div className={style["pool-header-left"]}>
            <div className={style["pool-header-left-top"]}>
              <div className={style["card-icon"]}>
                <img src={tokenIcon} alt="total" />
              </div>

              <div className={style["title-container"]}>
                <div className={style["pool-title"]}>
                  {tokenName && tokenName} {t("pool")}
                </div>
                <div className={style["pool-description"]}>{`${t("stake")} ${tokenName && tokenName} ${t("usdcPooldescription")}`}</div>
              </div>
            </div>
            <div className={style["pool-header-left-bottom"]}>
              <span>
                <div className={style["li-value"]}>{poolInitialReturn}%</div>
                <div className={style["li-label"]}>{t("estimatedReturn")}</div>
              </span>
              <div className={style["plus"]}>+</div>
              <span>
                <div className={style["li-value"]}>{annualReward && fixedPoolCapacity ? (amountDivideDecimals(Number(annualReward), usdDecimal) / amountDivideDecimals(Number(fixedPoolCapacity), usdDecimal)) * 100 : 0}%</div>
                <div className={style["li-label"]}>{t("estimatedReturnRate")}</div>
              </span>
              <div></div>
            </div>
            <div className={style["li-notice"]}>
              {getLang() === "en" ? (
                <>
                  {" "}
                  ${thousandsMillionsFormatter(amountDivideDecimals(Number(getNextLiquidityAmount()), usdDecimal))} {t("liquidityAvailable")}
                </>
              ) : (
                <>
                  {" "}
                  {t("liquidityAvailable")} ${thousandsMillionsFormatter(amountDivideDecimals(Number(getNextLiquidityAmount()), usdDecimal))}
                </>
              )}
            </div>
          </div>
        </div>
        <div className={style["pool-body"]}>
          <div className={style["top-info"]}>
            <span>
              <div className={style["li-value"]}>
                <div>${poolUsage ? thousandsMillionsFormatter(amountDivideDecimals(Number(poolUsage), usdDecimal)) : 0}</div>
              </div>
              <div className={style["li-label"]}>{t("totalLiquidity")}</div>
            </span>
            <span>
              <div className={style["li-value"]}>
                {" "}
                <div className={style["card-icon"]}>
                  <img src={tokenIcon} alt="total" />
                </div>
                <div>{userStake ? floorPrecised(amountDivideDecimals(Number(userStake), tokenDecimal)) : 0}</div>
              </div>
              <div className={style["li-label"]}>{t("youPooled")}</div>
            </span>
            <span>
              <div className={style["li-value"]}>
                {" "}
                <div className={style["card-icon"]}>
                  <img src={icon_mst} alt="total" />
                </div>
                <div>{miningReward ? floorPrecised(amountDivideDecimals(Number(miningReward), mstDecimal), 2) : 0} </div>
              </div>
              <div className={style["li-label"]}>{t("miningRewards")}</div>
            </span>
          </div>
        </div>
        <div className={style["pool-button"]}>
          <span className={style["stake"]} onClick={toggleStakingModal}>
            {t("stake")}
          </span>
          <span className={style["claim"]} onClick={toggleClaimModal}>
            {t("claimMiningReward")}
          </span>
        </div>
      </div>
      <StakingModal modal={stakingModal} toggle={toggleStakingModal} tokenName={tokenName} tokenDecimal={tokenDecimal} tokenIcon={tokenIcon} lockPeriod={lockPeriod} />
      <ClaimModal modal={claimModal} toggle={toggleClaimModal} tokenName={tokenName} />
    </>
  );
};

export default LiquidityMiningCard;
