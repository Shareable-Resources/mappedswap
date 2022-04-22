import style from "../page/MST/MST.module.scss";
import {useTranslation} from "react-i18next";
import icon_close from "../asset/icon_close.png";
import icon_mst from "../asset/icon_mst.svg";
import icon_usdc from "../asset/icon_usdc.svg";
import {getTokenList} from "../store";
import {amountDivideDecimals, floorPrecised, toFixed} from "../web3";
import moment from "moment";
import {bigNumbverDivideDecimals} from "../utils";

const RewardStakingRecord = ({stakeTime, totalDivision, initialStakeAmount, remainAmount, unlockInterval}) => {
  const {t} = useTranslation();
  const tokenList = getTokenList();
  const currentTime = Math.floor(Date.now() / 1000);
  const unlockedTime = Number(stakeTime) + Number(unlockInterval) * Number(totalDivision);

  console.log("unlockInterval", unlockInterval);

  function getCurrentDivision() {
    let currentDivision = 0;
    if (currentTime && stakeTime && unlockedTime && totalDivision) {
      if (currentTime > unlockedTime || currentTime === unlockedTime) {
        currentDivision = totalDivision;
      } else {
        if (Number(unlockInterval) === 86400 * 7) {
          const baseTime = ((stakeTime - 86400 * 4) / 86400) * 7 * 86400 * 7 + 86400 * 4;
          currentDivision = Math.floor((currentTime - Number(baseTime)) / Number(unlockInterval));
        } else {
          currentDivision = Math.floor((currentTime - Number(stakeTime)) / Number(unlockInterval));
        }
      }
    }
    return Number(currentDivision);
  }

  function getCurrentUnlockedAmount() {
    let currentUnlockedAmount = 0;
    if (getCurrentDivision() && initialStakeAmount) {
      currentUnlockedAmount = (getCurrentDivision() / Number(totalDivision)) * Number(initialStakeAmount);
    }
    return currentUnlockedAmount;
  }

  function getNextUnlockedTime() {
    let nextUnlockedTime = null;
    if (unlockInterval && stakeTime && currentTime && unlockedTime) {
      if (currentTime > unlockedTime || currentTime === unlockedTime) {
        return;
      } else {
        const timePassForNextPeriod = (getCurrentDivision() + 1) * unlockInterval;
        if (Number(unlockInterval) === 86400 * 7) {
          const baseTime = ((stakeTime - 86400 * 4) / 86400) * 7 * 86400 * 7 + 86400 * 4;
          nextUnlockedTime = Number(baseTime) + timePassForNextPeriod;
        } else {
          nextUnlockedTime = Number(stakeTime) + timePassForNextPeriod;
        }
      }
    }
    return nextUnlockedTime;
  }

  return (
    <div className={style["stake-mining-card"]}>
      <div className={style["card-header"]}>
        {
          <span>
            <div className={`${style["li-label"]} ${style["li-date"]}`}> {t("stakeDate")}: </div>
            <div className={style["li-value"]}> {stakeTime && moment.unix(stakeTime).format("YYYY-MM-DD HH:mm")}</div>
          </span>
        }
        <span>
          <div className={style["li-value"]}>
            <div className={style["card-icon"]}>
              <img src={icon_mst} alt="close" />
            </div>
            <div>{remainAmount && toFixed(amountDivideDecimals(remainAmount, tokenList.find((token) => token.tokenName === "MST").decimal), 2)}</div>
          </div>
        </span>
      </div>
      <div className={`${style["card-body"]} ${style["stake-value"]} ${style["reward-value"]}`}>
        <div className={style["body-center"]}>
          <span className={style["body-center-title"]}>
            <div>{t("period")} :</div>
            <div>{t("stakingLiquidity")} :</div>
          </span>
          <span>
            <div className={style["li-label"]}>
              {getCurrentDivision()} ({t("unlockedDivision")})
            </div>
            <div className={style["li-value"]}>{getCurrentUnlockedAmount() && toFixed(amountDivideDecimals(getCurrentUnlockedAmount(), tokenList.find((token) => token.tokenName === "MST").decimal), 2)}</div>
          </span>
          <span>
            <div className={style["li-label"]}>
              {totalDivision && totalDivision} ({t("totalDivision")})
            </div>
            <div className={style["li-value"]}>{initialStakeAmount && toFixed(amountDivideDecimals(initialStakeAmount, tokenList.find((token) => token.tokenName === "MST").decimal), 2)}</div>
          </span>
        </div>
      </div>
      {getNextUnlockedTime() && (
        <div className={style["card-footer"]}>
          <span>{t("nextUnlockTime")}:</span>
          <span>{moment.unix(getNextUnlockedTime()).format("YYYY-MM-DD HH:mm")}</span>
        </div>
      )}
    </div>
  );
};

export default RewardStakingRecord;
