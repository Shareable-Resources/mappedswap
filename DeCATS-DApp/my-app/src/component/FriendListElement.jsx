import style from "../page/MST/MST.module.scss";
import {floorPrecised} from "../web3";
import {useTranslation} from "react-i18next";
import TransferFundToFriendModal from "./TransferFundToFriendModal";
import {getToken} from "../store";
import notify from "./Toast";
import {useState} from "react";
import {getAnalytics, logEvent} from "firebase/analytics";
import moment from "moment";

const FriendListElement = ({address, weeklyVolume, name, createdDate}) => {
  const {t} = useTranslation();
  const token = getToken();
  const [depositModal, setDepositModal] = useState(false);

  function toggleDeposit() {
    if (token) {
      logEvent(getAnalytics(), `friendlist_toggle_deposit`);
      setDepositModal(!depositModal);
    } else {
      notify("warn", t("pleaseLoginInMetamask"));
    }
  }

  return (
    <>
      <tr>
        <td className={style["address"]}>
          {" "}
          <span>{address && address}</span>
        </td>
        <td className={style["blocknumber"]}>{createdDate && moment(createdDate).format("YYYY-MM-DD HH:mm")}</td>
        <td className={style["price"]}>{weeklyVolume && floorPrecised(weeklyVolume, 6)}</td>
        <td className={style["claim"]}>
          <span className={style["transfer"]} onClick={() => toggleDeposit()}>
            {t("deposit")}
          </span>
        </td>
      </tr>
      <TransferFundToFriendModal modal={depositModal} toggle={toggleDeposit} receiverAddress={address} receiverName={name} />
    </>
  );
};

export default FriendListElement;
