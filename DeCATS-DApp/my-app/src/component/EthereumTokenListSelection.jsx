import React from "react";
import MenuItem from "@mui/material/MenuItem";
import style from "./TransferFundModal.module.scss";
import icon_weth from "../asset/icon_weth.svg";
import {getTokenList} from "../store";

export const EthereumTokenListSelection = () => {
  const tokenList = getTokenList();

  return (
    <>
      <MenuItem value={"ETH"}>
        <span>
          <div className={style["card-icon"]}>
            <img src={tokenList.find(({tokenName}) => tokenName === "ETH").tokenIcon} alt="selected-token" />
          </div>
          ETH
        </span>
      </MenuItem>
      <MenuItem value={"wBTC"}>
        <span>
          <div className={style["card-icon"]}>
            <img src={tokenList.find(({tokenName}) => tokenName === "wBTC").tokenIcon} alt="selected-token" />
          </div>
          wBTC
        </span>
      </MenuItem>
      <MenuItem value={"USDC"}>
        <span>
          <div className={style["card-icon"]}>
            <img src={tokenList.find(({tokenName}) => tokenName === "USDC").tokenIcon} alt="selected-token" />
          </div>
          USDC
        </span>
      </MenuItem>
    </>
  );
};
