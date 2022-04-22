import style from "../page/MST/MST.module.scss";
import { useTranslation } from "react-i18next";
import icon_close from "../asset/icon_close.png";
import icon_mst from "../asset/icon_mst.svg";
import icon_usdc from "../asset/icon_usdc.svg";
import { getTokenList } from "../store";
import { amountDivideDecimals, floorPrecised } from "../web3";
import moment from "moment";
import NumberFormat from "react-number-format";

const StakeRecord = ({ amount, requestTime, tokenName, unlockTime, status }) => {
  const { t } = useTranslation();
  const tokenList = getTokenList();
  const value = floorPrecised(amountDivideDecimals(amount, tokenList.find((token) => token.tokenName === tokenName).decimal), getPrecisedDecimal())

  function getPrecisedDecimal() {
    let decimal = 6;
    if (tokenName === "MST") {
      decimal = 6;
    }
    return decimal;
  }

  if (tokenName)
    return (
      <div className={style["stake-card"]}>
        <div className={style["top-container"]}>
          <div className={style["card-header"]}>
            {status && status === "unlocked" && <span className={style["unlocked"]}>{t("unlocked")}</span>}
            {status && status === "pending" && <span className={style["pending"]}>{t("pending")}</span>}
          </div>
          <div className={`${style["card-body"]} ${style["stake-value"]}`}>{amount && Number(value.replace(/,/g, "")).toFixed(getPrecisedDecimal())}</div>
        </div>
        <div className={style["bottom-container"]}>
          <span>
            {" "}
            <div className={style["li-label"]}> {t("stakeDate")} </div>
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

export default StakeRecord;
