import {Modal, ModalBody} from "reactstrap";
import icon_close from "../asset/icon_close.png";
import {useTranslation} from "react-i18next";
import style from "./TransferFundModal.module.scss";
import {useState} from "react";
import {fundingCode} from "../api";
import axios from "axios";
import notify from "./Toast";
import {getToken, setToken, getWalletAddress, updateLoginTokenList} from "../store";
import {useLocation} from "react-router-dom";

const GetfundingModal = ({modal, toggle}) => {
  const [discountCode, setDiscountCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const token = getToken();
  const {t} = useTranslation();
  let location = useLocation();

  function handleChange(event) {
    if (event.target.value) {
      setDiscountCode(event.target.value);
    } else {
      setDiscountCode("");
    }
  }

  async function getFundingButtonOnClick() {
    setIsLoading(true);
    try {
      const FUNDINGCODEAPI = fundingCode();
      let response = await axios.post(
        FUNDINGCODEAPI,
        {
          fundingCode: discountCode,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (response && response.data && response.data.success) {
        setToken(response.data.data);
        updateLoginTokenList(getWalletAddress(), response.data.data);
        window.location.href = location.pathname;
      } else {
        notify("warn", t("invalidCode"));
      }
    } catch (err) {
      console.error(err);
      notify("warn", t("invalidCode"));
      setIsLoading(false);
    }
    setIsLoading(false);
  }

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalBody style={{padding: 0}}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggle}>
                <img src={icon_close} alt="close" />
              </div>
            </div>
            <div className={style["detail-container"]}>
              <div className={style["title"]}>{t("getFunding")}</div>
              <div className={style["card-container"]}>
                <span>{t("code")}</span>
                <div className={style["card-input"]}>
                  {" "}
                  <input type="text" name="name" onChange={handleChange} value={discountCode} autoComplete="off" placeholder={t("importCode")} />
                </div>
              </div>
            </div>
            <div className={style["button-container"]}>
              {isLoading ? (
                <div className={style["card-button"]}>
                  <span className={style["loading"]}> {t("loading")} </span>
                </div>
              ) : (
                <div className={style["card-button"]}>
                  <span onClick={getFundingButtonOnClick}>{t("confirm")}</span>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default GetfundingModal;
