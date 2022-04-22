import style from "../page/MST/MST.module.scss";
import icon_usdm from "../asset/icon_usdm.svg";
import {getTokenList} from "../store";
import {amountDivideDecimals, floorPrecised} from "../web3";

const RewardCardTopDetail = ({ledgers}) => {
  return (
    <div className={style["table-values"]}>
      <span>ICON</span>
      <span>VALUE</span>
      <span>VALUE</span>
    </div>
  );
};

export default RewardCardTopDetail;
