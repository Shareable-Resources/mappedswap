import style from "../page/MST/MST.module.scss";
import icon_usdm from "../asset/icon_usdm.svg";
import {getTokenList} from "../store";
import {amountDivideDecimals} from "../web3";
import {floorPrecised, tokenFormater} from "../web3";

const RewardCardBottomDetail = ({ledgerDetail}) => {
  const tokenList = getTokenList();
  const decimal = tokenList.find((token) => token.tokenName === ledgerDetail.token).decimal;
  //   const tokenIcon = tokenList.find((token) => token.tokenName === ledgerDetail.token).tokenIcon;
  //   const totalIncome = Number(ledgerDetail.allChildAgentFeeIncome) + Number(ledgerDetail.allChildAgentInterestIncome) + Number(ledgerDetail.allSubAgentFeeIncome) + Number(ledgerDetail.allSubAgentInterestIncome) + Number(ledgerDetail.netAgentFeeIncome) + Number(ledgerDetail.netAgentInterestIncome);

  function getDisplayValueByDistType(value) {
    let outputValue = 0;
    if (ledgerDetail && ledgerDetail.distTokenInUSDM) {
      if (ledgerDetail.distType === 1) {
        outputValue = floorPrecised(amountDivideDecimals(value, decimal) * amountDivideDecimals(Number(ledgerDetail.distTokenInUSDM), decimal));
      } else {
        outputValue = floorPrecised(amountDivideDecimals(value, decimal));
      }
    }
    return outputValue;
  }

  return (
    <>
      <div className={style["table-values"]}>
        <span>{ledgerDetail.distType === 1 ? "MST" : tokenFormater(ledgerDetail.token)}</span>
        <span>
          <div>{ledgerDetail && parseInt(ledgerDetail.interestPercentage)}%</div>
        </span>
        <span>
          {ledgerDetail.distType === 1 && "$"}
          <div>{ledgerDetail && getDisplayValueByDistType(ledgerDetail.directFeeIncome)}</div>
        </span>
        <span>
          {ledgerDetail.distType === 1 && "$"}
          <div>{ledgerDetail && getDisplayValueByDistType(ledgerDetail.directInterestIncome)}</div>
        </span>
        <span>
          {ledgerDetail.distType === 1 && "$"}
          <div>{ledgerDetail && getDisplayValueByDistType(ledgerDetail.allChildAgentFeeIncome)}</div>
        </span>
        <span>
          {ledgerDetail.distType === 1 && "$"}
          <div>{ledgerDetail && getDisplayValueByDistType(ledgerDetail.allChildAgentInterestIncome)}</div>
        </span>
        <span>
          {ledgerDetail.distType === 1 && "$"}
          <div>{ledgerDetail && getDisplayValueByDistType(ledgerDetail.allSubAgentFeeIncome)}</div>
        </span>
        <span>
          {ledgerDetail.distType === 1 && "$"}
          <div>{ledgerDetail && getDisplayValueByDistType(ledgerDetail.allSubAgentInterestIncome)}</div>
        </span>
        <span>
          {ledgerDetail.distType === 1 && "$"}
          <div>{ledgerDetail && getDisplayValueByDistType(ledgerDetail.netAgentFeeIncome)}</div>
        </span>
        <span className={style["border-bottom"]}>
          {ledgerDetail.distType === 1 && "$"}
          <div>{ledgerDetail && getDisplayValueByDistType(ledgerDetail.netAgentInterestIncome)}</div>
        </span>
        <span>
          {" "}
          {ledgerDetail.distType === 1 && "$"}
          <div>{ledgerDetail && getDisplayValueByDistType(ledgerDetail.totalIncome)}</div>
        </span>
      </div>
    </>
  );
};

export default RewardCardBottomDetail;
