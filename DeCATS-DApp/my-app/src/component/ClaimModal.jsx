import {Modal, ModalBody} from "reactstrap";
import icon_close from "../asset/icon_close.png";
import {useTranslation} from "react-i18next";
import style from "../page/MST/MST.module.scss";
import {useState, useEffect} from "react";
import {claimableRewardDetail} from "../api";
import notify from "./Toast";
import axios from "axios";
import {getToken, getWalletAddress} from "../store";
import ClaimRecord from "./ClaimRecord";
import InfiniteScroll from "react-infinite-scroll-component";
import {deepClone} from "../utils";

const ClaimModal = ({modal, toggle, tokenName}) => {
  const ITEM_PER_PAGE = 20;
  const {t} = useTranslation();
  const token = getToken();
  const stakeTypeConst = {STAKE: "stake", UNSTAKE: "unstake"};
  const [stakeTypeIndicator, setStakeTypeIndicator] = useState(stakeTypeConst.STAKE);
  const [claimableRewardDetails, setClaimableRewardDetails] = useState([]);
  const [acquireSuccessID, setAcquireSuccessID] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(ITEM_PER_PAGE);
  const [hasMore, setHasMore] = useState(false);

  async function getList() {
    try {
      let REWARDETAIL = claimableRewardDetail(ITEM_PER_PAGE, 0, tokenName);
      let response = await axios.get(REWARDETAIL, {
        headers: {
          authorization: token,
        },
      });
      if (response && response.data && response.data.data) {
        setHasMore(true);
        setClaimableRewardDetails(response.data.data.rows);
      }
    } catch (error) {
      console.error("getList error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getNextList() {
    try {
      let REWARDETAIL = claimableRewardDetail(ITEM_PER_PAGE, page + 1, tokenName);
      let response = await axios.get(REWARDETAIL, {
        headers: {
          Authorization: token,
        },
      });
      if (response.data.success && response.data.data.rows) {
        const dataList = response.data.data.rows;
        if (dataList.length === 0) {
          setHasMore(false);
        } else {
          setClaimableRewardDetails([...claimableRewardDetails, ...response.data.data.rows]);
          setPageSize(pageSize + ITEM_PER_PAGE);
          setPage(page + 1);
        }
      }
    } catch (error) {
      console.error("getNextList error", error);
      notify("warn", t("networkError"));
    }
  }

  useEffect(() => {
    let isUnmount = false;
    if (getWalletAddress() && modal) {
      getList();
    }

    return () => (isUnmount = true);
  }, [modal]);

  useEffect(() => {
    if (acquireSuccessID) {
      let newClaimableRewardDetails = deepClone(claimableRewardDetails);
      let newClaimableRewardItem = newClaimableRewardDetails.find(({roundId}) => roundId === acquireSuccessID);
      if (newClaimableRewardItem && newClaimableRewardItem.rewardsDetails && newClaimableRewardItem.rewardsDetails[0] && newClaimableRewardItem.rewardsDetails[0]["status"]) {
        newClaimableRewardItem.rewardsDetails[0]["status"] = 0;
      }
      setClaimableRewardDetails(newClaimableRewardDetails);
    }
  }, [acquireSuccessID]);

  console.log("claimableRewardDetails", claimableRewardDetails);

  return (
    <>
      <Modal isOpen={modal} toggle={toggle} style={{maxWidth: "1000px"}}>
        <ModalBody style={{padding: 0}}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggle}>
                <img src={icon_close} alt="close" />
              </div>
            </div>

            <div className={style["claim-wrap"]}>
              {/* <div className={`${style['title']} ${style['title-left']}`}>
                                {t('rewards')}
                            </div> */}
              <div className={style["claim-container"]}>
                <div className={style["claim-panel"]}>
                  <div className={stakeTypeIndicator === stakeTypeConst.STAKE ? style["active"] : ""}>{t("miningRewards")}</div>
                </div>
                {claimableRewardDetails && claimableRewardDetails[0] && (
                  <div className={`${style["table-wrapper"]} ${style["table-wrapper-header"]}`}>
                    <table>
                      <thead>
                        <tr>
                          <th className={style["time"]}>{t("requestDate")}</th>
                          <th className={style["blocknumber"]}>{t("amount")}</th>
                          <th className={style["status"]}>{t("status")}</th>
                          <th className={style["claim"]}></th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                )}

                {claimableRewardDetails && claimableRewardDetails[0] ? (
                  <InfiniteScroll dataLength={pageSize} next={getNextList} scrollThreshold={0.6} hasMore={hasMore} scrollableTarget="scrollableClaim">
                    <div className={style["table-wrapper"]} id="scrollableClaim">
                      <table>
                        <tbody>
                          {claimableRewardDetails.map((element) => {
                            return (
                              <ClaimRecord
                                key={element.id}
                                id={element.rewardsDetails[0] && element.rewardsDetails[0].id}
                                roundId={element.roundId}
                                acquiredDate={element.rewardsDetails[0] && element.rewardsDetails[0].acquiredDate}
                                amount={element.rewardsDetails[0] && element.rewardsDetails[0].amount}
                                claimStatus={element.rewardsDetails[0] && element.rewardsDetails[0].status}
                                status={element.status && element.status}
                                token={element.rewardsDetails[0] && element.rewardsDetails[0].poolToken}
                                jobId={element.rewardsDetails[0] && element.rewardsDetails[0].jobId}
                                mstExchangeRate={element.mstExchangeRate}
                                exchangeRate={element.exchangeRate}
                                setAcquireSuccessID={setAcquireSuccessID}
                              />
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </InfiniteScroll>
                ) : (
                  <div className={style["no-record"]}>{t("noRecord")}</div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ClaimModal;
