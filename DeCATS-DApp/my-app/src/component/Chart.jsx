import React from "react";
import {createChart} from "lightweight-charts";
import style from "./Chart.module.scss";
import {priceHistory} from "../api";
import axios from "axios";
import {getToken} from "../store";
import {useEffect} from "react";
import moment from "moment";
import notify from "./Toast";

function Chart({pairName, interval, type, isMobileQuoteLeftVisible}) {
  const ref = React.useRef();
  let chart = null;
  const token = getToken();
  // const interval = "1m"

  useEffect(async () => {
    async function getPrice() {
      try {
        let PRICEAPI = priceHistory(pairName, interval);
        let response = await axios.get(PRICEAPI, {
          headers: {
            Authorization: token,
          },
        });
        if (response && response.data && response.data.data) {
          let dataOutput = response.data.data;
          return dataOutput;
        }
      } catch (error) {
        console.error("getPrice error", error);
        notify("primary", "Network error");
      }
    }

    const dataList = await getPrice();
    let dataListForCandleChart = "";
    let dataListForLineChart = "";
    const Offset = Number(moment.parseZone(new Date()).utcOffset());
    if (dataList) {
      let dataList2Working = dataList.map((item) => {
        const _time = moment.utc(item.createdDate).unix() + Offset * 60;
        const _open = parseInt(item.open);
        const _high = parseInt(item.high);
        const _low = parseInt(item.low);
        const _close = parseInt(item.close);

        const obj = {
          time: _time,
          open: _open,
          high: _high,
          low: _low,
          close: _close,
        };
        return obj;
      });

      dataList2Working.sort(function (a, b) {
        var keyA = a.time;
        var keyB = b.time;
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });

      let filterDuplicate = (arr, key) => {
        return [...new Map(arr.map((x) => [key(x), x])).values()];
      };
      dataListForCandleChart = filterDuplicate(dataList2Working, (it) => it.time);

      dataListForLineChart = dataListForCandleChart.map((element) => ({
        time: element.time,
        value: element.close,
      }));
    }

    removeAllChildrenElements();
    if (!ref.current) {
      return;
    }
    chart = createChart(ref.current, {
      width: ref && ref.current && ref.current.innerWidth,
      height: ref && ref.current && ref.current.innerHeight,
      localization: {
        dateFormat: "yyyy/MM/dd",
      },
      layout: {
        backgroundColor: "rgb(17, 17, 39)",
        textColor: "rgba(255, 255, 255, 0.9)",
      },
      grid: {
        vertLines: {
          color: "rgb(41, 44, 58)",
        },
        horzLines: {
          color: "rgb(41, 44, 58)",
        },
      },
      priceScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
      },
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
      },
    });
    chart.applyOptions({
      // timezone: "Europe/Paris",
      timeScale: {
        // rightOffset: 12,
        // barSpacing: 3,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        borderVisible: false,
        borderColor: "#fff000",
        visible: true,
        timeVisible: true,
        secondsVisible: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      priceScale: {
        position: "right",
        mode: 1,
        autoScale: false,
        invertScale: false,
        alignLabels: true,
        borderVisible: false,
        borderColor: "#555ffd",
        scaleMargins: {
          top: 0.25,
          bottom: 0.25,
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      lineStyle: 0,
      lineWidth: 3,
    });

    const lineSeries = chart.addLineSeries({
      lineStyle: 0,
      lineWidth: 3,
    });

    const areaSeries = chart.addAreaSeries({
      topColor: "rgba(79, 127, 228, 0.7)",
      bottomColor: "rgba(96, 186, 177, 0.7)",
      lineColor: "rgba(79, 127, 228, 1)",
      lineWidth: 2,
    });

    if (dataList && dataListForLineChart && lineSeries && type === "line") {
      areaSeries.setData(dataListForLineChart);
    } else {
      candlestickSeries.setData(dataListForCandleChart);
    }
  }, [interval, pairName, isMobileQuoteLeftVisible, type]);

  function removeAllChildrenElements() {
    const myElement = ref.current;
    if (myElement && myElement.children && myElement.children.length) {
      for (let i = 0; i < myElement.children.length; i++) {
        myElement.children[i].remove();
      }
    }
  }

  return <>{<div className={style["chart-wrapper"]} ref={ref} />}</>;
}

export default Chart;
