import png_flowchart_zh_cn from "../picture/png_flowchart_zh_cn.svg";
import png_flowchart_zh_tw from "../picture/png_flowchart_zh_tw.svg";
import png_flowchart_en from "../picture/png_flowchart_en.svg";
import png_flowchart_zh_cn_mobile from "../picture/png_flowchart_zh_cn_mobile.svg";
import png_flowchart_zh_tw_mobile from "../picture/png_flowchart_zh_tw_mobile.svg";
import png_flowchart_en_mobile from "../picture/png_flowchart_en_mobile.svg";
import png_flowchart_kr_mobile from "../picture/png_flowchart_kr_mobile.svg";
import png_flowchart_kr from "../picture/png_flowchart_kr.svg";

import {getIsMobile, getLang} from "../store";
import style from "./FlowChart.module.scss";
import {useState, useEffect} from "react";

const FlowChart = () => {
  const [image, setImage] = useState(png_flowchart_en);

  useEffect(() => {
    let imageList = [
      {image: png_flowchart_en, isMobile: false, lang: "en"},
      {image: png_flowchart_zh_tw, isMobile: false, lang: "zh_TW"},
      {image: png_flowchart_zh_cn, isMobile: false, lang: "zh_CN"},
      {image: png_flowchart_kr, isMobile: false, lang: "zh_KR"},
      {image: png_flowchart_en_mobile, isMobile: true, lang: "en"},
      {image: png_flowchart_zh_tw_mobile, isMobile: true, lang: "zh_TW"},
      {image: png_flowchart_zh_cn_mobile, isMobile: true, lang: "zh_CN"},
      {image: png_flowchart_kr_mobile, isMobile: true, lang: "zh_KR"},
    ];

    const filter = {
      isMobile: getIsMobile(),
      lang: getLang(),
    };

    imageList = imageList.filter(function (item) {
      for (const key in filter) {
        if (item[key] === undefined || item[key] != filter[key]) return false;
      }
      return true;
    });
    setImage(imageList[0].image);
  }, [getIsMobile(), getLang()]);

  return (
    <div className={style["flowChart"]}>
      <img src={image && image} alt="decats" />
      {/* <img src={png_flowchart_en} alt="decats" /> */}
    </div>
  );
};

export default FlowChart;
