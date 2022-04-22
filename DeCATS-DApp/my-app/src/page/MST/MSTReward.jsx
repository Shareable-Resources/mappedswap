import style from "./MST.module.scss";
import {useTranslation} from "react-i18next";
import {Container, Row, Col} from "reactstrap";
import "react-circular-progressbar/dist/styles.css";
import RewardCard from "../../component/RewardCard";
import {useLocation} from "react-router";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {useState, useEffect} from "react";
import {LedgerList} from "../../api";
import notify from "../../component/Toast";
import axios from "axios";
import {getToken} from "../../store";
import InfiniteScroll from "react-infinite-scroll-component";
import {deepClone} from "../../utils";
import {getAnalytics, logEvent} from "firebase/analytics";

const MSTReward = () => {
  const {t} = useTranslation();
  let location = useLocation();
  const token = getToken();
  const ITEM_PER_PAGE = 12;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const [selectYear, setSelectYear] = useState(currentYear);
  const [selectMonth, setSelectMonth] = useState("");
  const [displayYear, setDisplayYear] = useState("");
  const [displayMonth, setDisplayMonth] = useState("");
  const [selectStatus, setSelectStatus] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(ITEM_PER_PAGE);
  const [data, setData] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [acquireSuccessID, setAcquireSuccessID] = useState("");

  function handleSelectYear(event) {
    logEvent(getAnalytics(), `reward_handle_select_year`);
    setSelectYear(event.target.value);
    setDisplayYear(event.target.value);
    setPage(0);
    setHasMore(true);
    setPageSize(ITEM_PER_PAGE);
  }

  function handleSelectMonth(event) {
    logEvent(getAnalytics(), `reward_handle_select_month`);
    setSelectMonth(event.target.value);
    setDisplayMonth(event.target.value);
    setPage(0);
    setPageSize(ITEM_PER_PAGE);
    setHasMore(true);
  }

  function handleSelectStatus(status) {
    logEvent(getAnalytics(), `reward_handle_select_status`);
    setSelectStatus(status);
    setPage(0);
    setPageSize(ITEM_PER_PAGE);
    setHasMore(true);
  }

  function getMonthFromString(mon) {
    var d = Date.parse(mon + "1, 2012");
    if (!isNaN(d)) {
      return new Date(d).getMonth() + 1;
    }
    return -1;
  }

  async function getLedgerList() {
    try {
      let LEDGERLIST = LedgerList(pageSize, page, selectMonth && getMonthFromString(selectMonth), selectYear, selectStatus);
      let response = await axios.get(LEDGERLIST, {
        headers: {
          Authorization: token,
        },
      });
      if (response && response.data && response.data.data && response.data.data.rows) {
        setData(response.data.data.rows);
        // console.log(response.data.data.rows)
      }
    } catch (error) {
      console.error("getInterestList error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getNextLedgerList() {
    setPage(page + 1);
    try {
      let LEDGERLIST = LedgerList(pageSize, page + 1, selectMonth && getMonthFromString(selectMonth), selectYear, selectStatus);
      let response = await axios.get(LEDGERLIST, {
        headers: {
          Authorization: token,
        },
      });
      if (response && response.data && response.data.data && response.data.data.rows) {
        if (response.data.data.rows.length === 0 || response.data.data.rows.length % ITEM_PER_PAGE != 0) {
          setHasMore(false);
        }
        if (response.data.data.rows.length > 0) {
          setData([...data, ...response.data.data.rows]);
          setPageSize(pageSize + ITEM_PER_PAGE);
        }
      }
    } catch (error) {
      console.error("getInterestList error", error);
      notify("warn", t("networkError"));
    }
  }

  useEffect(() => {
    try {
      getLedgerList();
    } catch (error) {
      console.log("getList err", error);
    }
  }, [selectYear, selectMonth, selectStatus]);

  useEffect(() => {
    if (acquireSuccessID) {
      let newClaimableRewardDetails = deepClone(data);
      let newClaimableRewardItem = newClaimableRewardDetails.find(({roundId}) => roundId === acquireSuccessID);
      if (newClaimableRewardItem && newClaimableRewardItem.distributions) {
        newClaimableRewardItem.distributions.status = 20;
      }
      setData(newClaimableRewardDetails);
    }
  }, [acquireSuccessID]);

  return (
    <>
      <div className={`${style["mst-reward-wrap"]}`} id={`${style["scrollableDiv"]}`}>
        <InfiniteScroll dataLength={pageSize} next={getNextLedgerList} scrollThreshold={0.75} hasMore={hasMore} scrollableTarget="scrollableDiv">
          <div className={style["reward-panel"]}>
            <div className={style["status-panel"]}>
              <div className={!selectStatus ? style["active"] : ""} onClick={() => handleSelectStatus("")}>
                {t("all")}
              </div>
              <div className={selectStatus === "30" ? style["active"] : ""} onClick={() => handleSelectStatus("30")}>
                {t("approved")}
              </div>
              <div className={selectStatus === "0" ? style["active"] : ""} onClick={() => handleSelectStatus("0")}>
                {t("pending")}
              </div>
            </div>
            <div className={style["select-panel"]}>
              <div className={style["card-select"]}>
                <Select value={displayYear} onChange={handleSelectYear} displayEmpty inputProps={{"aria-label": "Without label"}} label="Age">
                  <MenuItem disabled value="">
                    {t("Year")}
                  </MenuItem>
                  <MenuItem value={currentYear}>{currentYear}</MenuItem>
                  <MenuItem value={currentYear - 1}>{currentYear - 1}</MenuItem>
                  <MenuItem value={currentYear - 2}>{currentYear - 2}</MenuItem>
                </Select>
              </div>
              <div className={`${style["card-select"]}`} className={`${style["card-select-right"]}`}>
                <Select value={displayMonth} onChange={handleSelectMonth} inputProps={{"aria-label": "Without label"}} displayEmpty label="Age">
                  <MenuItem disabled value="">
                    {t("Month")}
                  </MenuItem>
                  {months.map((month) => {
                    return (
                      <MenuItem key={month} value={month}>
                        {t(month)}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
            </div>
          </div>
          {data && data[0] ? (
            <Container>
              <Row>
                {data &&
                  data.map((element) => {
                    console.log(data);
                    return (
                      <Col className={`${style["reward-cards-wrap"]}`} key={element.id} xs="3" sm="3" md="3" lg="3" xl="3" xxl="3" style={{paddingRight: "5px", paddingLeft: "5px"}}>
                        <RewardCard
                          key={element.id}
                          id={element.id}
                          roundId={element.roundId}
                          cronJobId={element.cronJobId}
                          dateFrom={element.dateFrom}
                          dateTo={element.dateTo}
                          status={element.status}
                          ledgers={element.ledgers}
                          distributions={element.distributions}
                          setAcquireSuccessID={setAcquireSuccessID}
                        />
                      </Col>
                    );
                  })}
              </Row>
            </Container>
          ) : (
            <div className={style["no-record"]}>{t("noRecord")}</div>
          )}
        </InfiniteScroll>
      </div>
    </>
  );
};

export default MSTReward;
