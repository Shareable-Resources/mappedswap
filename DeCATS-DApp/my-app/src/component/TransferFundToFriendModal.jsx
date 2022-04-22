import { Modal, ModalBody } from "reactstrap";
import icon_close from "../asset/icon_close.png";
import { useTranslation } from "react-i18next";
import style from "./TransferFundModal.module.scss";
import { useState, useEffect } from "react";
import { floorPrecised, getTokenBalance, mappedswapPoolDeposit, getTransaction, getAssetDetails } from "../web3";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import NumberFormat from "react-number-format";
import { getNetworkList, getTokenList, getEthereumTokenList } from "../store";
import icon_usdm from "../asset/icon_usdm.svg";
import icon_btcm from "../asset/icon_btcm.svg";
import icon_ethm from "../asset/icon_ethm.svg";
import notify from "./Toast";
import { getErrorMsgKey } from "../utils";
import { getAnalytics, logEvent } from "firebase/analytics";

const TransferFundToFriendModal = ({ modal, toggle, receiverAddress, receiverName }) => {
  const { t } = useTranslation();
  const tokenList = getTokenList();
  const ethereumTokenList = getEthereumTokenList();
  const networkList = getNetworkList();
  const [selectedNetwork, setSelectedNetwork] = useState("Eurus");
  const [isLoading, setIsLoading] = useState(false);
  const [btcmDisplayBalance, setBtcmDisplayBalance] = useState(0);
  const [ethmDisplayBalance, setEthmDisplayBalance] = useState(0);
  const [usdmDisplayBalance, setUsdmDisplayBalance] = useState(0);
  const [selectedToken, setSelectedToken] = useState(tokenList.find(({ tokenName }) => tokenName === "BTCM"));
  const [inputAmount, setInputAmount] = useState(0);

  function handleNetworkSelect(event) {
    const selected = networkList.find((network) => network.networkName === event.target.value).networkName;
    setSelectedNetwork(selected);
    setInputAmount(0);
  }

  function handleSelect(event) {
    const selected = tokenList.find(({ tokenName }) => tokenName === event.target.value);
    setSelectedToken(selected);
    setInputAmount(0);
  }

  function handleChange(event) {
    event.preventDefault();
    if (event.target.value) {
      let value = event.target.value;
      setInputAmount(value);
    } else {
      setInputAmount(0);
    }
  }

  async function mappedswapPoolDepositButtonOnClick() {
    logEvent(getAnalytics(), `friendlist_confirm_deposit`);
    try {
      if (selectedNetwork === "Ethereum") {
        window.open(`${process.env.REACT_APP_PAYMENT_GATEWAY}/${receiverAddress}?token=${selectedToken.tokenName}&amount=${inputAmount.replace(/,/g, "")}`);
      } else {
        setIsLoading(true);
        const txnHash = await mappedswapPoolDeposit(selectedToken.tokenName, receiverAddress, inputAmount.replace(/,/g, ""));
        await getTransactionReceipt(txnHash);
      }
    } catch (err) {
      // notify("warn", t("networkError"));
      notify("warn", t(getErrorMsgKey(err, "networkError")));
      setIsLoading(false);
      console.error("mappedswapPoolDepositButtonOnClick error", err);
    }
  }

  async function getTransactionReceipt(txnHash) {
    if (txnHash) {
      let txnData = await getTransaction(txnHash);
      console.log("txnData", txnData);
      if (txnData && txnData.txn_id) {
        if (txnData.status == false) {
          notify("primary", t("transactionFailed"));
        } else {
          notify("primary", t("transactionSuccess"));
          setInputAmount(0);
        }
        setIsLoading(false);
      } else {
        setTimeout(() => {
          getTransactionReceipt(txnHash);
        }, 3000);
      }
    } else {
      setIsLoading(false);
      notify("warn", t("transactionFailed"));
    }
  }

  useEffect(() => {
    let isUnmount = false;
    async function initiateInfo() {
      try {
        if (modal) {
          const btcmAssetDetail = await getAssetDetails("BTCM");
          const ethmAssetDetail = await getAssetDetails("ETHM");
          const usdmAssetDetail = await getAssetDetails("USDM");
          setBtcmDisplayBalance(btcmAssetDetail.balance);
          setEthmDisplayBalance(ethmAssetDetail.balance);
          setUsdmDisplayBalance(usdmAssetDetail.balance);
        }
      } catch (error) {
        console.log("Network Error");
        notify("warn", t("networkError"));
      }
    }

    initiateInfo();
    return () => (isUnmount = true);
  }, [modal]);

  function getWalletOriginalBalance() {
    let walletBalance = 0;
    if (selectedToken && selectedToken.tokenName) {
      if (selectedToken.tokenName === "BTCM") {
        walletBalance = Number(btcmDisplayBalance);
      } else if (selectedToken.tokenName === "ETHM") {
        walletBalance = Number(ethmDisplayBalance);
      } else if (selectedToken.tokenName === "USDM") {
        walletBalance = Number(usdmDisplayBalance);
      }
    }
    return walletBalance;
  }

  function getWalletFinalBalance(tokenName) {
    let walletBalance = getWalletOriginalBalance(tokenName)
    if (inputAmount) {
      walletBalance = walletBalance - Number(inputAmount.replace(/,/g, ""));
    }
    if (walletBalance < 0) {
      walletBalance = 0;
    }
    return walletBalance;
  }

  return (
    <>
      <Modal isOpen={modal && modal} toggle={toggle} style={{ maxWidth: "600px" }}>
        <ModalBody style={{ padding: 0 }}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggle}>
                <img src={icon_close} alt="close" />
              </div>
            </div>
            <div className={`${style["title"]} ${style["title-left"]}`}>{t("transferFund")}</div>
            <div className={style["transfer-fund-container"]}>
              <div className={style["detail-container"]}>
                <div className={style["card-container"]}>
                  <span>{t("transferTo")}</span>
                  <div className={style["card-name"]}>
                    <div className={style["li-name"]}>{receiverName && receiverName}</div>
                    <div className={style["li-hash"]}>{receiverAddress && receiverAddress}</div>
                  </div>
                </div>
                <div className={style["card-container"]}>
                  <span>{t("network")}</span>
                  <div className={style["card-select"]}>
                    <div className={style["token-container"]}>
                      <FormControl>
                        <Select value={selectedNetwork} onChange={handleNetworkSelect} displayEmpty inputProps={{ "aria-label": "Without label" }} style={{ width: "100%" }}>
                          <MenuItem value={"Eurus"}>
                            <div className={style["card-icon"]}>
                              <img src={networkList.find((network) => network.networkName === "Eurus").networkIcon} alt="selected-token" />
                            </div>
                            <div>{t("eurus")}</div>
                          </MenuItem>
                          <MenuItem value={"Ethereum"}>
                            <div className={style["card-icon"]}>
                              <img src={networkList.find((network) => network.networkName === "Ethereum").networkIcon} alt="selected-token" />
                            </div>
                            <div>{t("ethereum")}</div>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>
                <div className={style["card-container"]}>
                  <span>{t("asset")}</span>
                  <div className={style["card-select"]}>
                    <div className={style["token-container"]}>
                      <FormControl>
                        <Select value={selectedToken ? selectedToken.tokenName : ""} onChange={handleSelect} displayEmpty inputProps={{ "aria-label": "Without label" }}>
                          <MenuItem value={"BTCM"}>
                            <span>
                              <div className={style["card-icon"]}>
                                <img src={icon_btcm} alt="selected-token" />
                              </div>
                              BTCM
                            </span>
                            {/* {selectedNetwork === "Eurus" && <span>{floorPrecised(btcmCredit.realizedBalance - btcmCredit.interest)}</span>} */}
                          </MenuItem>
                          <MenuItem value={"ETHM"}>
                            <span>
                              <div className={style["card-icon"]}>
                                <img src={icon_ethm} alt="selected-token" />
                              </div>
                              ETHM
                            </span>
                            {/* {selectedNetwork === "Eurus" && <span>{floorPrecised(ethmCredit.realizedBalance - ethmCredit.interest)}</span>} */}
                          </MenuItem>
                          <MenuItem value={"USDM"}>
                            <span>
                              <div className={style["card-icon"]}>
                                <img src={icon_usdm} alt="selected-token" />
                              </div>
                              USDM
                            </span>
                            {/* {selectedNetwork === "Eurus" && <span>{floorPrecised(usdmCredit.realizedBalance - usdmCredit.interest)}</span>} */}
                          </MenuItem>
                          {selectedNetwork === "Ethereum" &&
                            ethereumTokenList.map((element) => {
                              return (
                                <MenuItem value={element.tokenName}>
                                  <span>
                                    <div className={style["card-icon"]}>
                                      <img src={element.tokenIcon} alt="selected-token" />
                                    </div>
                                    {element.tokenName}
                                  </span>
                                </MenuItem>
                              );
                            })}
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>
                <div className={style["card-container"]}>
                  <span>{t("amount")}</span>
                  <div className={style["card-input"]}>
                  <NumberFormat thousandsGroupStyle="thousand" value={inputAmount === 0 ? "" : inputAmount} placeholder={t("0.00")} decimalScale={6} decimalSeparator="." displayType="input" type="text" thousandSeparator={true} allowNegative={false} onChange={handleChange} inputMode="decimal" />
                  </div>
                </div>
                <div className={style["card-footer"]}>
                  {selectedNetwork === "Eurus" && (
                    <div className={style["total-balance"]}>
                      <span>
                        {t("wallet")} {t("balance")} :
                      </span>
                      <span>
                        {selectedToken && floorPrecised(getWalletFinalBalance(selectedToken.tokenName))} {selectedToken && selectedToken.tokenName}
                      </span>
                    </div>
                  )}
                </div>
                <div className={style["button-container"]}>
                  {" "}
                  {isLoading ? (
                    <div className={style["card-button"]}>
                      <span className={style["loading"]}> {t("loading")} </span>
                    </div>
                  ) : (
                    <div className={style["card-button"]}>
                      <span onClick={() => mappedswapPoolDepositButtonOnClick()}>{t("tradeConfirm")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default TransferFundToFriendModal;
