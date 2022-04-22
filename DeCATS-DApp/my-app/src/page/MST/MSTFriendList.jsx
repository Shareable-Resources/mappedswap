import style from "./MST.module.scss";
import {useTranslation} from "react-i18next";
import "react-circular-progressbar/dist/styles.css";
import FriendListElement from "../../component/FriendListElement";
import {useState, useEffect} from "react";
import {BiSearch} from "react-icons/bi";
import {friendList} from "../../api";
import axios from "axios";
import notify from "../../component/Toast";
import {getToken} from "../../store";
import {v4 as uuidv4} from "uuid";

const MSTFriendList = () => {
  const {t} = useTranslation();
  const [inputWalletAddress, setInputWalletAddress] = useState("");
  const [data, setData] = useState("");
  const token = getToken();
  function handleInputWalletAddress(event) {
    setInputWalletAddress(event.target.value);
  }

  async function getList() {
    try {
      let FRIENDLISTAPI = friendList(inputWalletAddress);
      let response = await axios.get(FRIENDLISTAPI, {
        headers: {
          Authorization: token,
        },
      });
      if (response && response.data && response.data.data) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("getInterestList error", error);
      notify("warn", t("networkError"));
    }
  }

  useEffect(() => {
    try {
      getList();
    } catch (error) {
      console.log("getList err", error);
    }
  }, [inputWalletAddress]);

  return (
    <>
      <div id={style["mst-friend-wrap"]}>
        <div className={`${style["card-container"]} ${style["card-container-friend-list"]}`}>
          <div className={style["title-container"]}>
            <div className={style["title"]}>{t("friendList")}</div>
            <div className={style["card-input"]}>
              {" "}
              <BiSearch />
              <input type="text" name="name" placeholder={`${t("walletAddress")}`} onChange={handleInputWalletAddress} value={inputWalletAddress} autoComplete="off" />
            </div>
          </div>
          {data && data.length > 0 ? (
            <div className={style["table-wrapper"]}>
              <table>
                <thead>
                  <tr>
                    <th className={style["time"]}>{t("walletAddress")}</th>
                    <th className={style["blocknumber"]}>{t("referralTime")}</th>
                    <th className={style["price"]}>{t("weeklyVolume")}</th>
                    <th className={style["claim"]}></th>
                  </tr>
                </thead>
                <tbody>
                  {data &&
                    data.map((element) => {
                      return <FriendListElement key={uuidv4()} address={element.address} riskLevel={element.riskLevel} weeklyVolume={element.weeklyVolume} name={element.name} createdDate={element.createdDate} />;
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={style["no-record"]}>{t("noRecord")}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default MSTFriendList;
