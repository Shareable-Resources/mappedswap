import style from "../page/MST/MST.module.scss";
import {useTranslation} from "react-i18next";
import icon_close from "../asset/icon_close.png";
import icon_mst from "../asset/icon_mst.svg";
import icon_usdc from "../asset/icon_usdc.svg";
import {getTokenList} from "../store";
import {amountDivideDecimals, floorPrecised} from "../web3";
import moment from "moment";

const RewardRecord = ({stakeAmount, rewardAmount, requestTime, tokenName, unlockTime, status}) => {
  const {t} = useTranslation();
  const tokenList = getTokenList();
  const tokenIcon = tokenList.find((token) => token.tokenName === tokenName).tokenIcon;

  return (
    <div className={style["stake-card"]}>
      <div className={style["top-container"]}>
        <div className={style["card-header"]}>
          {status && status === "unlocked" && <span className={style["unlocked"]}>{t("unlocked")}</span>}
          {status && status === "pending" && <span className={style["pending"]}>{t("locked")}</span>}
        </div>
        <div className={`${style["card-body"]} ${style["stake-value"]} ${style["reward-value"]}`}>
          <div className={style["li-label"]}> {t("stake")} </div>
          <div className={style["li-value"]}>
            <div className={style["card-icon"]}>
              <img src={tokenIcon} alt="close" />
            </div>{" "}
            {stakeAmount && floorPrecised(amountDivideDecimals(stakeAmount, tokenList.find((token) => token.tokenName === tokenName).decimal), 6)}
          </div>
        </div>
        <div className={`${style["card-body"]} ${style["stake-value"]} ${style["reward-value"]}`}>
          <div className={style["li-label"]}> {t("rewards")} </div>
          <div className={style["li-value"]}>
            <div className={style["card-icon"]}>
              <img src={icon_mst} alt="close" />
            </div>{" "}
            {rewardAmount && floorPrecised(amountDivideDecimals(rewardAmount, tokenList.find((token) => token.tokenName === "MST").decimal), 2)}
          </div>
        </div>
      </div>
      <div className={style["bottom-container"]}>
        <span>
          {" "}
          <div className={style["li-label"]}> {t("requestDate")} </div>
          <div className={style["li-value"]}> {requestTime && moment.unix(requestTime).format("YYYY-MM-DD HH:mm")}</div>
        </span>
        <span>
          <div className={style["li-label"]}> {t("unlockDate")} </div>
          <div className={style["li-value"]}> {unlockTime && moment.unix(unlockTime).format("YYYY-MM-DD HH:mm")}</div>
        </span>
      </div>
    </div>
  );
};

export default RewardRecord;
