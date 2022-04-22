import { useState, useEffect } from "react";
import styles from "./VolumeTradingComp.module.scss";
import CampaignTable from "../../component/Table/CampaignTable";
import DoubleArrowDown from "../../asset/icon_doublearrowdown.svg";
import { useTranslation, Trans } from "react-i18next";
import EventTerms from "./EventTerms";
import TaskOneIntro from "./TaskOneIntro";
import MidStopDay from "./MidStopDay";


const VolumeTradingComp = () => {

    const [leaderboard, setLeaderboard] = useState([]);
    const { t } = useTranslation();

    const onScreenCapture = () => {
        window.open(t('screenCaptureURL'))
    };

    const onTradeNow = () => {
        window.open(t('tradeNowURL'))
    };

    return (
        <>
            <div className={styles["campaign-container"]}>
                <div className={styles["sub-container"]}>
                    <div className={styles["task-content"]}>
                        <div className={styles["white-font"]}>MAPPEDSWAP'S</div>
                        <div className={styles["blue-font"]}>{t("campaignTitle1")}</div>
                        <div className={styles["white-font"]}>{t("campaignTitle2")}</div>
                    </div>
                </div>
                <div>
                    <img src={DoubleArrowDown} alt="arrow" />
                </div>
                <div className={styles["task-container"]}>
                    <div className={styles["task-content"]}>
                        <div className={styles["white-font"]}>{t("campaignTask1")}</div>
                        <div className={styles["blue-font"]}>{t("campaignTask1Title")}</div>
                        <div className={styles["font-container"]}>
                            <div className={styles["small-white-font"]}><TaskOneIntro /></div>
                        </div>
                        <button type="button" onClick={onScreenCapture}>{t("campaignTask1Button")}</button>
                        <div className={styles["white-font"]}>
                            <div>{t("campaignTask1Content3")}</div>
                            <div>{t("campaignTask1Content4")}</div>
                        </div>
                    </div>
                </div>
                <div className={styles["task-container"]}>
                    <div className={styles["task-content"]}>
                        <div className={styles["white-font"]}>{t("campaignTask2")}</div>
                        <div className={styles["blue-font"]}>{t("campaignTask2Title")}</div>
                        <div className={styles["font-container"]}>
                            <div className={styles["small-white-font"]}>{t("campaignTask2Content1")}</div>
                        </div>
                        <button type="button" onClick={onTradeNow}>{t("campaignTask2Button")}</button>
                        <div className={styles["white-font"]}>
                            <div>{t("campaignTask2Content2")}</div>
                            <div>{t("campaignTask2Content3")}</div>
                        </div>
                    </div>
                </div>
                <div className={styles["task-container"]}>
                    <div className={styles["task-content"]}>
                        <div className={styles["white-font"]}>{t("campaignTask3")}</div>
                        <div className={styles["blue-font"]}>{t("campaignTask3Title")}</div>
                        <div className={styles["font-container"]}>
                            <div className={styles["small-white-font"]}>
                                <div>{t("campaignTask3Content1")}</div>
                                <div><MidStopDay></MidStopDay></div>
                            </div>
                        </div>
                        <button type="button" onClick={onTradeNow}>{t("campaignTask3Button")}</button>
                        <div className={styles["white-font"]}>
                            <div>{t("campaignTask3Content3")}</div>
                            <div>{t("campaignTask3Content4")}</div>
                        </div>
                        <div className={styles["table-container"]}>
                            <div className={styles["table"]}><CampaignTable /></div>
                        </div>
                    </div>
                </div>
                <div className={styles["terms-container"]}>
                    <div className={styles["white-font"]}>{t("termsConditions1")}</div>
                    <ul className={styles["bullet-points"]}>
                        <EventTerms></EventTerms>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default VolumeTradingComp;