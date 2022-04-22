import style from "./MST.module.scss";
import {useTranslation} from "react-i18next";
import {useHistory} from "react-router";
import {getIsMobile, getIsAgent, getUserState} from "../../store";
import {logEvent, getAnalytics} from "firebase/analytics";

const MST = ({selectedTab}) => {
  const {t} = useTranslation();
  const history = useHistory();
  const isMobile = getIsMobile();
  const isAgent = getIsAgent();
  const userStatus = getUserState();

  function directReferral() {
    logEvent(getAnalytics(), `referral_direct_referral`);
    history.push("/referral");
  }

  function directFriendList() {
    logEvent(getAnalytics(), `referral_direct_friend_list`);
    history.push("/referral/friendlist");
  }

  function directReward() {
    logEvent(getAnalytics(), `referral_direct_reward`);
    history.push("/referral/reward");
  }

  function directPoolInfo() {
    logEvent(getAnalytics(), `info_direct_pool_info`);
    if (isMobile) {
      history.push("/info/pool/BTCM");
    } else {
      history.push("/info/pool");
    }
  }

  return (
    <>
      {!(selectedTab === "poolInfo" || selectedTab === "MSTInfo" || selectedTab === "mining") ? (
        <div className={style["mst-panel"]}>
          <div className={selectedTab === "refer" ? style["active"] : ""} onClick={directReferral}>
            {t("referral")}
          </div>
          {isAgent && (
            <div className={selectedTab === "friendlist" ? style["active"] : ""} onClick={directFriendList}>
              {t("friendList")}
            </div>
          )}
          {isAgent && (
            <div className={selectedTab === "reward" ? style["active"] : ""} onClick={directReward}>
              {t("myReferralRewards")}
            </div>
          )}
        </div>
      ) : (
        <div></div>
      )}
      {selectedTab === "MSTInfo" || selectedTab === "poolInfo" ? (
        <div className={style["mst-panel"]}>
          {/* <div className={(selectedTab === "MSTInfo") ? style['active'] : ""} onClick={() => history.push('/info/mst')}>{t('MSTInfo')}</div> */}
          <div className={selectedTab === "poolInfo" ? style["active"] : ""} onClick={directPoolInfo}>
            {t("poolInfo")}
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default MST;
