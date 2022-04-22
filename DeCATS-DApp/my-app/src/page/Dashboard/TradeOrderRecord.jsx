import {Modal, ModalBody} from "reactstrap";
import icon_close from "../../asset/icon_close.png";
import {useState, useEffect} from "react";
import style from "../TradeQuote/TradeQuote.module.scss";
import moment from "moment";
import {amountDivideDecimals, floorPrecised, tokenFormater} from "../../web3";
import {useTranslation} from "react-i18next";
import {getTokenList, getTransactionFeeRatio} from "../../store";
import {getAnalytics, logEvent} from "firebase/analytics";

const TradeOrderRecord = ({id, sellToken, sellAmount, buyToken, buyAmount, txHash, txTime, txStatus, stopout}) => {
  const {t} = useTranslation();
  const [modal, setModal] = useState(false);
  const [buyAmountOutput, setBuyAmountOutput] = useState("");
  const [sellAmountOutput, setSellAmountOutput] = useState("");
  const transactionFee = getTransactionFeeRatio();
  const tokenList = getTokenList();

  useEffect(() => {
    let isUnmount = false;

    try {
      function getAssetDetail() {
        //Size
        const assetBuyDetail = tokenList.find(({tokenName}) => tokenName === buyToken);
        const buyDecimal = assetBuyDetail.decimal;
        const buyAmountOutput = amountDivideDecimals(Math.abs(buyAmount), buyDecimal);
        const assetSellDetail = tokenList.find(({tokenName}) => tokenName === sellToken);
        const sellDecimal = assetSellDetail.decimal;
        const sellAmountOutput = amountDivideDecimals(Math.abs(sellAmount), sellDecimal);

        if (!isUnmount) {
          setBuyAmountOutput(buyAmountOutput);
          setSellAmountOutput(sellAmountOutput);
        }
      }
      getAssetDetail();
    } catch (error) {
      console.log("getAssetDetail err", error);
    }

    return () => (isUnmount = true);
  }, [buyAmount, buyToken, sellAmount, sellToken]);

  function toggleRecord() {
    logEvent(getAnalytics(), `trade_toggle_transaction_record`);
    setModal(!modal);
  }

  function getTransactionStatusName() {
    if (stopout) {
      return t("transactionStopOut");
    } else if (txStatus && txStatus === 1) {
      return t("transactionFailed");
    } else if (txStatus && txStatus === 2) {
      return t("transactionSuccess");
    } else {
      return t("transactionPending");
    }
  }

  function getTransactionStatusClass() {
    if (stopout) {
      return "fail";
    } else if (txStatus && txStatus === 1) {
      return "fail";
    } else if (txStatus && txStatus === 2) {
      return "success";
    } else {
      return "pending";
    }
  }

  function getTransactionPrice() {
    if (sellAmountOutput && buyAmountOutput) {
      if (sellToken === "USDM") {
        return (Number(sellAmountOutput) * (1 - transactionFee)) / Number(buyAmountOutput);
      } else {
        return Number(buyAmountOutput) / (Number(sellAmountOutput) * (1 - transactionFee));
      }
    }
  }

  function getTransactionFee() {
    if (sellAmountOutput && buyAmountOutput) {
      if (sellToken === "USDM") {
        return Number(sellAmountOutput) * transactionFee;
      } else {
        return Number(sellAmountOutput) * transactionFee;
      }
    }
  }

  function getTransactionTokenAmount() {
    if (sellAmountOutput && buyAmountOutput) {
      if (sellToken === "USDM") {
        return Number(buyAmountOutput);
      } else {
        return Number(sellAmountOutput);
      }
    }
  }

  function getTransactionTokenName() {
    if (sellAmountOutput && buyAmountOutput) {
      if (sellToken === "USDM") {
        return tokenFormater(buyToken);
      } else {
        return tokenFormater(sellToken);
      }
    }
  }

  function getTransactionDirection() {
    if (sellAmountOutput && buyAmountOutput) {
      if (sellToken === "USDM") {
        return "buy";
      } else {
        return "sell";
      }
    }
  }

  return (
    <>
      <div className={style["card-container"]} onClick={toggleRecord}>
        {
          <div className={`${style["card-header"]}`}>
            {getTransactionDirection() === "buy" ? <div className={style["buy"]}>{t(getTransactionDirection())}</div> : <div className={style["sell"]}>{t(getTransactionDirection())}</div>}
            <div className={`${style["price"]}`}>
              {sellAmountOutput && buyAmountOutput && floorPrecised(getTransactionTokenAmount(), 6)} <span>{getTransactionTokenName()}</span>
            </div>
          </div>
        }
        <div className={`${style["card-price"]}`}>
          {sellAmountOutput && buyAmountOutput && floorPrecised(getTransactionPrice(), 2)} <span>USD</span>
        </div>
        <div className={style["card-detail"]}>{txTime && moment(txTime).format("YYYY-MM-DD HH:mm")}</div>
        <div className={`${style["card-status"]}  ${style[`${getTransactionStatusClass()}`]} `}>{getTransactionStatusName()} </div>
      </div>
      <Modal isOpen={modal} toggle={toggleRecord}>
        <ModalBody style={{padding: 0}}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggleRecord}>
                <img src={icon_close} alt="close" />
              </div>
            </div>
            <div className={style["rows-container"]}>
              <div className={`${style["row-container"]} ${style["topic-row"]}`}>
                <span className={style["title-container"]}>{t("transactionRecord")}</span>
                <div className={style["id-container"]}>
                  <span>ID: {id && id}</span>
                </div>
              </div>
              <div className={style["row-container"]}>
                <span className={style["row-left"]}>{t("transactionTime")}</span>
                <span>{txTime && moment(txTime).format("YYYY-MM-DD HH:mm")}</span>
              </div>
              <div className={style["row-container"]}>
                <span className={style["row-left"]}>{t("status")}</span>
                <span>{getTransactionStatusName()}</span>
              </div>
              <div className={style["row-container"]}>
                <span className={style["row-left"]}>{t("sell")}</span>
                <span>
                  {sellAmountOutput && floorPrecised(sellAmountOutput - getTransactionFee())} <span>{sellAmountOutput && tokenFormater(sellToken)}</span>
                </span>
              </div>
              <div className={style["row-container"]}>
                <span className={style["row-left"]}>{t("networkFee")}</span>
                <span>
                  {floorPrecised(getTransactionFee(), 6)} <span>{tokenFormater(sellToken)}</span>
                </span>
              </div>
              <div className={style["row-container"]}>
                <span className={style["row-left"]}>{t("buy")}</span>
                <span>
                  {buyAmountOutput && floorPrecised(buyAmountOutput)} <span>{buyAmountOutput && tokenFormater(buyToken)}</span>
                </span>
              </div>
              <div className={`${style["row-container"]} ${style["border-none"]}`}>
                <span className={style["row-left"]}>TX</span>
                <span className={style["detail-hash"]}>{txHash && txHash}</span>
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

export default TradeOrderRecord;
