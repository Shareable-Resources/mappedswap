import style from "../page//MST/MST.module.scss";
import {useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {getIsMobile} from "../store";
import RebateDescriptionTableElement from "./RebateDescriptionTableElement";
import {mstDistRules} from "../api";
import axios from "axios";
import notify from "./Toast";

const RebateDescriptionTable = () => {
  const {t} = useTranslation();
  const isMobile = getIsMobile();
  const [mstDistRulesList, setmstDistRulesList] = useState([]);

  async function getmstDistRules() {
    try {
      let EXPECTEDCOMMISSIONAPI = mstDistRules();
      let response = await axios.get(EXPECTEDCOMMISSIONAPI);
      if (response) {
        setmstDistRulesList(mstDistRulesList);
      }
    } catch (error) {
      console.error("getmstDistRules error", error);
      notify("warn", t("networkError"));
    }
  }

  useEffect(() => {
    let isUnmount = false;
    try {
      async function getmstDistRules() {
        try {
          let EXPECTEDCOMMISSIONAPI = mstDistRules();
          let response = await axios.get(EXPECTEDCOMMISSIONAPI);
          if (response && response.data && response.data.data) {
            setmstDistRulesList(response.data.data);
          }
        } catch (error) {
          console.error("getmstDistRules error", error);
          notify("warn", t("networkError"));
        }
      }
      getmstDistRules();
      return () => (isUnmount = true);
    } catch (error) {
      console.log("getList err", error);
    }
  }, []);

  return (
    <div className={`${style["description-body-wrap"]} `}>
      {isMobile && <div className={style["title"]}>{t("rebateLevelTable")}</div>}
      {mstDistRulesList && mstDistRulesList[0] ? (
        <div className={`${style["table-wrapper"]} ${style["rebate-table"]}`}>
          <table>
            <thead>
              <tr>
                <th className={style["grade"]}>{t("level")}</th>
                <th className={style["price"]}>
                  {t("weeklyVolume")}
                  <span className={style["remark"]}>1</span>
                </th>
                <th className={style["price"]}>
                  {t("stakedMST")}
                  <span className={style["remark"]}>2</span>
                </th>
                <th className={style["rebate-level"]}>
                  <span>{t("rebateLevel")}</span>
                  <span>{t("token&MST")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {mstDistRulesList.map((element) => {
                return <RebateDescriptionTableElement key={element.id} grade={element.grade} weekAmount={element.weekAmount} holdMST={element.holdMST} distMSTTokenRate={element.distMSTTokenRate} distMTokenRate={element.distMTokenRate} commissionRate={element.commissionRate} />;
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={style["no-record"]}>{t("noRecord")}</div>
      )}
      <div className={style["body"]}>
        <span className={style["first"]}> {t("rebateTableDescriptionOne")}</span>
        <span className={style["first"]}> {t("rebateTableDescriptionTwo")}</span>
        <span className={style["first"]}> {t("rebateTableDescriptionThree")}</span>
        <span className={style["first"]}> {t("rebateTableDescriptionFour")}</span>
        <span className={style["first"]}> {t("rebateTableDescriptionFive")}</span>
        <span> {t("referralDescriptionTwo")}</span>
      </div>
    </div>
  );
};

export default RebateDescriptionTable;
