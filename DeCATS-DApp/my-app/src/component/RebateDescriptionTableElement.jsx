import style from "../page//MST/MST.module.scss";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {getIsMobile} from "../store";
import {amountDivideDecimals, floorPrecised} from "../web3";
import {getTokenList} from "../store";

const RebateDescriptionTableElement = ({id, grade, weekAmount, holdMST, distMTokenRate, distMSTTokenRate, commissionRate}) => {
  const distributionPercentage = Number(commissionRate) / 100;
  const {t} = useTranslation();
  const isMobile = getIsMobile();
  const tokenList = getTokenList();
  const MSTdecimal = tokenList.find((token) => token.tokenName === "MST").decimal;
  const USDdecimal = tokenList.find((token) => token.tokenName === "USDM").decimal;

  return (
    <tr>
      <td className={style["grade"]}>{grade && grade}</td>
      <td className={style["price"]}>{weekAmount && floorPrecised(amountDivideDecimals(weekAmount, USDdecimal), 0)}</td>
      <td className={style["price"]}>{holdMST && floorPrecised(amountDivideDecimals(holdMST, MSTdecimal), 0)}</td>
      <td className={style["price"]}>
        {distMTokenRate && Number(distMTokenRate)}% + {distMSTTokenRate && Number(distMSTTokenRate)}%{" "}
      </td>
    </tr>
  );
};

export default RebateDescriptionTableElement;
