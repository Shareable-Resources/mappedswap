import style from "./MST.module.scss";
import {useTranslation} from "react-i18next";
import LiquidityMiningCard from "../../component/LiquidityMiningCard";
import {useState} from "react";
import {getIsMobile} from "../../store";

const MSTLiquidityMining = () => {
  const {t} = useTranslation();
  const [selectedTab, setSelectedTab] = useState("stakingScheme");
  const isMobile = getIsMobile();
  return (
    <>
      <div id={style["mst-liquid-wrap"]}>
        <div className={style["mst-panel"]}>
          <div className={selectedTab === "stakingScheme" ? style["active"] : ""} onClick={() => setSelectedTab("stakingScheme")}>
            {t("pool")}
          </div>
          <div className={selectedTab === "stakingProgram" ? style["active"] : ""} onClick={() => setSelectedTab("stakingProgram")}>
            {t("stakingScheme")}
          </div>
        </div>
        {!isMobile && (
          <>
            <div className={`${style["scheme-wrap"]} ${style["stake-program"]}`}>
              <div className={style["scheme-title"]}>{t("stakingScheme")}</div>
              <div className={style["introduction-container"]}>
                <div className={style["body"]}>
                  <span className={style["first"]}> {t("miningDescriptionOne")}</span>

                  <span> {t("miningDescriptionTwo")}</span>
                  {/* <span> {t("miningDescriptionTwelve")}</span> */}
                  <span className={style["sub-content"]}> {t("rewardAmount")}</span>
                  <span className={style["sub-content2"]}> {t("miningDescriptionThree")}</span>
                  <span className={style["sub-content2"]}> {t("miningDescriptionFour")}</span>
                  <span className={style["sub-content2"]}> {t("miningDescriptionFive")}</span>
                  <span className={style["sub-content"]}> {t("lockupPeriod")}</span>
                  <span className={style["sub-content2"] + " " + style["first"]}> {t("miningDescriptionSix")}</span>
                  <span className={style["sub-content2"] + " " + style["first"]}> {t("lockupPeriodReminder")}</span>

                  <span> {t("miningDescriptionSeven")}</span>
                  <span className={style["sub-content"]}> {t("rewardAmount")}</span>
                  <span className={style["sub-content2"]}> {t("miningDescriptionEight")}</span>
                  <span className={style["sub-content2"]}> {t("miningDescriptionNine")}</span>
                  <span className={style["sub-content2"] + " " + style["first"]}> {t("miningDescriptionEleven")}</span>
                  <span className={style["sub-content2"] + " " + style["first"]}> {t("rewardAmountReminder")}</span>
                  {/* <span> {t("miningDescriptionTen")}</span> */}
                </div>
              </div>
            </div>
            <div className={style["scheme-wrap"]}>
              <div className={style["scheme-title"]}>{t("pools")}</div>
              <div className={style["scheme-container"]}>
                <LiquidityMiningCard tokenName={"wBTC"} />
                <LiquidityMiningCard tokenName={"ETH"} />
                <LiquidityMiningCard tokenName={"USDC"} />
              </div>
            </div>
          </>
        )}
        {isMobile && (
          <>
            {selectedTab === "stakingProgram" && (
              <div className={`${style["scheme-wrap"]} ${style["stake-program"]}`}>
                <div className={style["scheme-title"]}>{t("stakingScheme")}</div>
                <div className={style["introduction-container"]}>
                  <div className={style["body"]}>
                    <span className={style["first"]}> {t("miningDescriptionOne")}</span>

                    <span> {t("miningDescriptionTwo")}</span>
                    <span> {t("miningDescriptionTwelve")}</span>
                    <span className={style["sub-content"]}> {t("rewardAmount")}</span>
                    <span className={style["sub-content2"]}> {t("miningDescriptionThree")}</span>
                    <span className={style["sub-content2"]}> {t("miningDescriptionFour")}</span>
                    <span className={style["sub-content2"]}> {t("miningDescriptionFive")}</span>
                    <span className={style["sub-content"]}> {t("lockupPeriod")}</span>
                    <span className={style["sub-content2"] + " " + style["first"]}> {t("miningDescriptionSix")}</span>
                    <span className={style["sub-content2"] + " " + style["first"]}> {t("lockupPeriodReminder")}</span>
                    <span> {t("miningDescriptionSeven")}</span>
                    <span className={style["sub-content"]}> {t("rewardAmount")}</span>
                    <span className={style["sub-content2"]}> {t("miningDescriptionEight")}</span>
                    <span className={style["sub-content2"]}> {t("miningDescriptionNine")}</span>
                    <span className={style["sub-content2"] + " " + style["first"]}> {t("miningDescriptionEleven")}</span>
                    <span> {t("rewardAmountReminder")}</span>
                  </div>
                </div>
              </div>
            )}
            {selectedTab === "stakingScheme" && (
              <div className={style["scheme-wrap"]}>
                <div className={style["scheme-title"]}>{t("pool")}</div>
                <div className={style["scheme-container"]}>
                  <LiquidityMiningCard tokenName={"wBTC"} />
                  <LiquidityMiningCard tokenName={"ETH"} />
                  <LiquidityMiningCard tokenName={"USDC"} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MSTLiquidityMining;
