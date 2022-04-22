import InfiniteScroll from "react-infinite-scroll-component";
import {useState, useEffect} from "react";
import axios from "axios";
import style from "../page/MST/MST.module.scss";
import {getBurnTransaction} from "../api";
import notify from "./Toast";
import {useTranslation} from "react-i18next";
import {getToken} from "../store";
import BurnTransactionElement from "./BurnTransactionElement";

const BurnTransaction = () => {
  const ITEM_PER_PAGE = 10;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(ITEM_PER_PAGE);
  const [data, setData] = useState([]);
  const {t} = useTranslation();
  const [hasMore, setHasMore] = useState(true);
  const token = getToken();

  useEffect(() => {
    try {
      getList();
    } catch (error) {
      console.log("getList err", error);
    }
  }, []);

  async function getList() {
    try {
      let BURNTRANSACTIONAPI = getBurnTransaction(ITEM_PER_PAGE, page);
      let response = await axios.get(BURNTRANSACTIONAPI, {
        headers: {
          Authorization: token,
        },
      });
      if (response && response.data && response.data.data && response.data.data.rows) {
        setData(response.data.data.rows);
      }
    } catch (error) {
      console.error("getBurnTransaction error", error);
      notify("warn", t("networkError"));
    }
  }

  async function getNextList() {
    try {
      let BUYBACKTRANSACTIONAPI = getBurnTransaction(ITEM_PER_PAGE, page + 1);
      let response = await axios.get(BUYBACKTRANSACTIONAPI, {
        headers: {
          Authorization: token,
        },
      });
      if (response && response.data && response.data.data && response.data.data.rows) {
        const dataList = response.data.data.rows;
        if (dataList.length === 0) {
          setHasMore(false);
        } else {
          setData([...data, ...dataList]);
          setPageSize(pageSize + ITEM_PER_PAGE);
          setPage(page + 1);
        }
      }
    } catch (error) {
      console.error("GetOrderList error", error);
      notify("warn", t("networkError"));
    }
  }

  return (
    <>
      {data && data[0] ? (
        <InfiniteScroll dataLength={pageSize} next={getNextList} scrollThreshold={0.75} hasMore={hasMore} scrollableTarget="scrollableOrder">
          <div className={`${style["table-wrapper"]} ${style["scroll-table"]}`}>
            <table>
              <thead>
                <tr>
                  <th className={style["time"]}>{t("time")}</th>
                  <th className={style["time"]}>{t("transactionID")}</th>
                  <th className={style["time"]}>{t("price")}</th>
                  <th className={style["time"]}></th>
                </tr>
              </thead>
              <tbody>
                {data.map((element) => {
                  return <BurnTransactionElement key={element.id} createdDate={element.createdDate} txHash={element.txHash} mstAmount={element.mstAmount} />;
                })}
              </tbody>
            </table>
          </div>{" "}
        </InfiniteScroll>
      ) : (
        <div className={style["no-record"]}>{t("noRecord")}</div>
      )}
    </>
  );
};

export default BurnTransaction;
