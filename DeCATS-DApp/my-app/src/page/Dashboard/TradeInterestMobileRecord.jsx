import {Modal, ModalBody} from "reactstrap";
import icon_close from "../../asset/icon_close.png";
import {useState, useEffect} from "react";
import moment from "moment";
import {amountDivideDecimals, floorPrecised, tokenFormater} from "../../web3";
import {useTranslation} from "react-i18next";
import style from "../TradeQuote/TradeQuote.module.scss";
import {getTokenList} from "../../store";

const TradeInterestRecord = ({createdDate, token, interest, rate, amount}) => {
  const {t} = useTranslation();
  const [modal, setModal] = useState(false);
  const [amountOutput, setAmountOutput] = useState("");
  const [rateOutput, setRateOutput] = useState("");
  const [proceeds, setProceeds] = useState("");
  const toggleRecord = () => setModal(!modal);
  const tokenList = getTokenList();

  useEffect(() => {
    async function getAssetDetail() {
      //Size
      const assetDetail = tokenList.find(({tokenName}) => tokenName === token);
      const decimal = assetDetail.decimal;
      const amountOutput = floorPrecised(amountDivideDecimals(Math.abs(amount), decimal));
      setAmountOutput(amountOutput);

      //Rate
      const rateOutput = amountDivideDecimals(rate, 7);
      setRateOutput(rateOutput);

      //Proceeds
      const proceedsOutput = floorPrecised(amountDivideDecimals(Math.abs(interest), decimal));
      setProceeds(proceedsOutput);
    }

    getAssetDetail();
  }, [amount, interest, rate, token]);

  return (
    <>
      <tr onClick={toggleRecord}>
        <td className={style["time"]}>{createdDate && moment(createdDate).format("YYYY-MM-DD HH:mm")}</td>
        <td className={style["currency"]}>{token && tokenFormater(token)}</td>
        <td className={style["size"]}>{amountOutput && amountOutput}</td>
        <td className={style["rate"]}>
          {rateOutput && rateOutput}% / {t("hour")}
        </td>
        <td className={style["proceeds"]}>{proceeds && proceeds}</td>
      </tr>
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
                <span className={style["title-container"]}>{t("interestRecord")}</span>
              </div>
              <div className={style["row-container"]}>
                <span>{t("time")}</span>
                <span>{createdDate && moment(createdDate).format("YYYY-MM-DD HH:mm")}</span>
              </div>
              <div className={style["row-container"]}>
                <span>{t("currency")}</span>
                <span>
                  <span>{token && tokenFormater(token)}</span>
                </span>
              </div>
              <div className={style["row-container"]}>
                <span>{t("size")}</span>
                <span>
                  {amountOutput && amountOutput} <span>{amountOutput && tokenFormater(token)}</span>
                </span>
              </div>
              <div className={style["row-container"]}>
                <span>{t("hourlyRate")}</span>
                <span>
                  {rateOutput && rateOutput}% / {t("hour")}
                </span>
              </div>
              <div className={style["row-container"]}>
                <span>{t("proceeds")}</span>
                <span>
                  {proceeds && proceeds} <span>{proceeds && tokenFormater(token)}</span>
                </span>
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

export default TradeInterestRecord;
