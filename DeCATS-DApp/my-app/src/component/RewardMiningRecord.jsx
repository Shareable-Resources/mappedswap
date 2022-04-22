import style from "../page/MST/MST.module.scss";
import {useTranslation} from "react-i18next";
import icon_close from "../asset/icon_close.png";
import icon_mst from "../asset/icon_mst.svg";
import icon_usdc from "../asset/icon_usdc.svg";
import {getTokenList} from "../store";
import {amountDivideDecimals, floorPrecised, toFixed} from "../web3";
import moment from "moment";

const RewardMiningRecord = ({currentStakeAmount, initialStakeAmount, rewardAmount, requestTime, tokenName, unlockTime, status}) => {
  const {t} = useTranslation();
  const tokenList = getTokenList();
  const tokenIcon = tokenList.find((token) => token.tokenName === tokenName).tokenIcon;

  console.log("rewardAmount", rewardAmount);

  return (
    <div className={style["stake-mining-card"]}>
      <div className={style["card-header"]}>
        {requestTime !== "0" ? (
          <span>
            <div className={`${style["li-label"]} ${style["li-date"]}`}> {t("stakeDate")}: </div>
            <div className={style["li-value"]}> {requestTime && moment.unix(requestTime).format("YYYY-MM-DD HH:mm")}</div>
          </span>
        ) : (
          <div></div>
        )}
        <span>
          <div className={style["li-label"]}> {t("estimatedReturn")}: </div>
          <div className={style["li-value"]}>
            <div className={style["card-icon"]}>
              <img src={icon_mst} alt="close" />
            </div>
            <div>{rewardAmount && toFixed(amountDivideDecimals(rewardAmount, tokenList.find((token) => token.tokenName === "MST").decimal), 2)}</div>
          </div>
        </span>
      </div>
      <div className={`${style["card-body"]} ${style["stake-value"]} ${style["reward-value"]}`}>
        <div className={style["body-top"]}>
          <span>
            <div className={style["li-label"]}> {t("status")} :</div>
            {status === "pending" && (
              <div className={`${style["li-value"]}  ${style["pending"]}`}>
                <span>{t("pending")}</span>
                <span>{`(${t("lockUntil")} ${unlockTime && moment.unix(unlockTime).format("YYYY-MM-DD HH:mm")})`}</span>
              </div>
            )}
            {status === "unlocked" && <div className={`${style["li-value"]} ${style["unlocked"]}`}> {t("unlocked")}</div>}
          </span>
          <span>
            <div className={style["card-icon"]}>
              <img src={tokenIcon} alt="close" />
            </div>
            <div className={style["li-value"]}>{currentStakeAmount && floorPrecised(amountDivideDecimals(currentStakeAmount, tokenList.find((token) => token.tokenName === tokenName).decimal), 6)}</div>
          </span>
        </div>
        <div className={style["body-bottom"]}>
          <span>
            <div className={style["li-label"]}> {t("stakeLiquidity")}: </div>
            <div className={style["li-value"]}> {initialStakeAmount && floorPrecised(amountDivideDecimals(initialStakeAmount, tokenList.find((token) => token.tokenName === tokenName).decimal), 6)}</div>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RewardMiningRecord;
