import style from "../page//MST/MST.module.scss";
import {useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {getIsMobile} from "../store";
import RebateDescriptionTableElement from "./RebateDescriptionTableElement";
import RebateDescriptionTable from "./RebateDescriptionTable";
import RebateDescriptionCalculation from "./RebateDescriptionCalucation";
import {getAnalytics, logEvent} from "firebase/analytics";

const RebateDescription = () => {
  const {t} = useTranslation();
  const [selectedRecordTab, setSelectedRecordTab] = useState("table");
  const isMobile = getIsMobile();

  function switchTabToTable() {
    logEvent(getAnalytics(), `referral_rebate_switch_to_table`);
    setSelectedRecordTab("table");
  }

  function switchTabToCalculation() {
    logEvent(getAnalytics(), `referral_rebate_switch_to_calculation`);
    setSelectedRecordTab("calculation");
  }

  return (
    <>
      {!isMobile && (
        <div className={style["description-container"]}>
          <div className={`${style["record-container-panel"]} `}>
            <span onClick={switchTabToTable} className={`${selectedRecordTab === "table" ? style["active"] : ""} ${style["left"]}`}>
              {t("rebateLevelTable")}
            </span>
            <span onClick={switchTabToCalculation} className={`${selectedRecordTab === "calculation" ? style["active"] : ""}`}>
              {t("rebateCalculation")}
            </span>
          </div>
          {selectedRecordTab === "calculation" && <RebateDescriptionCalculation />}
          {selectedRecordTab === "table" && <RebateDescriptionTable />}
        </div>
      )}
      {isMobile && (
        <div className={style["description-container"]}>
          <RebateDescriptionCalculation />
          <RebateDescriptionTable />
        </div>
      )}
    </>
  );
};

export default RebateDescription;
