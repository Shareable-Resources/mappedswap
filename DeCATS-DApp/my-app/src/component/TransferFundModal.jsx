import { Modal, ModalBody } from "reactstrap";
import icon_close from "../asset/icon_close.png";
import icon_eurus_wallet from "../asset/icon_eurus_wallet.svg";
import { useTranslation } from "react-i18next";
import style from "./TransferFundModal.module.scss";
import { useState, useEffect } from "react";
import {
  floorPrecised,
  tokenFormater,
  getTransaction,
  getAssetDetails,
  depositToPool,
  withdrawFromPool,
  withdrawUsdcFromPool,
} from "../web3";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import NumberFormat from "react-number-format";
import {
  getEthereumTokenList,
  getNetworkList,
  getTokenList,
  getWalletAddress,
  getOwnerWalletAddress,
} from "../store";
import icon_usdm from "../asset/icon_usdm.svg";
import icon_btcm from "../asset/icon_btcm.svg";
import icon_ethm from "../asset/icon_ethm.svg";
import icon_usdc from "../asset/icon_usdc.svg";
import icon_weth from "../asset/icon_weth.svg";
import notify from "./Toast";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getErrorMsgKey, bigNumberCompare } from "../utils";
import PictureZoom from "./PictureZoom";
import { verify } from "jsonwebtoken";

const TransferFundModal = ({
  modal,
  toggle,
  btcmCredit,
  ethmCredit,
  usdmCredit,
  btcmDisplayBalance,
  ethmDisplayBalance,
  usdmDisplayBalance,
  setSelectedToken,
  selectedToken,
}) => {
  const { t } = useTranslation();
  const networkList = getNetworkList();
  const [selectedTab, setSelectTab] = useState("depositPage");
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [newTransaction, setNewTransaction] = useState([]);
  const [amount, setAmount] = useState(0);
  const tokenList = getTokenList();
  const ownerWalletAddress = getOwnerWalletAddress();
  const ethereumTokenList = getEthereumTokenList();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const codeLink = getCodeLink();

  function getCodeLink() {
    if (
      getWalletAddress() &&
      selectedToken &&
      selectedToken.tokenName &&
      amount
    ) {
      return `${
        process.env.REACT_APP_PAYMENT_GATEWAY
      }/${getWalletAddress()}?token=${
        selectedToken.tokenName
      }&amount=${amount.replace(/,/g, "")}`;
    } else {
      return null;
    }
  }
  function handleNetworkSelect(event) {
    const selected = networkList.find(
      (network) => network.networkName === event.target.value
    ).networkName;
    setSelectedNetwork(selected);
    setAmount(0);
    setSelectedToken(tokenList.find(({ tokenName }) => tokenName === "BTCM"));
  }

  function handleChange(event) {
    event.preventDefault();
    if (event.target.value) {
      let value = event.target.value;
      setAmount(value);
    } else {
      setAmount(0);
    }
  }

  function handleSelect(event) {
    const selected = tokenList.find(
      ({ tokenName }) => tokenName === event.target.value
    );
    setSelectedToken(selected);
    setAmount(0);
  }

  async function getTransactionReceipt(txnHash) {
    if (txnHash) {
      let txnData = await getTransaction(txnHash);

      if (txnData && txnData.txn_id) {
        setIsLoading(false);
        if (txnData.status == true) {
          notify("primary", t("transactionSuccess"));
          setNewTransaction([]);
        } else {
          notify("warn", t("transactionFailed"));
        }
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

  function decimalCount(amount) {
    const numStr = String(amount);
    if (numStr.includes(".")) {
      return numStr.split(".")[1].length;
    }
    return 0;
  }

  async function payButtonOnClick() {
    logEvent(getAnalytics(), `account_transfer_fund_deposit`);
    try {
      let amtInNumber = Number(amount.replace(/,/g, ""));
      if (
        selectedNetwork === "Ethereum" &&
        selectedTab === "depositPage" &&
        amtInNumber > 0
      ) {
        // toggleQrCodeModal(!qrCodeModal);
        if (ownerWalletAddress) {
          toggleQrCodeModal(!qrCodeModal);
        } else {
          window.open(codeLink);
        }
      } else {
        if (Number(amtInNumber) < 0 || isNaN(parseFloat(amtInNumber))) {
          notify("warn", t("inputErrorLargerThanZero"));
          return;
        } else if (depositCheckLargerThanAvaliable()) {
          notify("warn", t("depositFailed"));
        } else {
          setIsLoading(true);
          const assetDetail = await getAssetDetails(selectedToken.tokenName);
          const assetDecimal = assetDetail.decimals;
          const inputDecimal = decimalCount(amtInNumber);
          if (inputDecimal > assetDecimal) {
            notify("warn", t("inputError"));
            return;
          } else {
            const txnHash = await depositToPool(
              selectedToken.tokenName,
              amtInNumber
            );
            getTransactionReceipt(txnHash);
            // setIsLoading(false);
          }
        }
      }
    } catch (error) {
      // notify("warn", t("networkError"));
      notify("warn", t(getErrorMsgKey(error, "networkError")));
      setIsLoading(false);
    }
  }

  async function receiveButtonOnClick() {
    logEvent(getAnalytics(), `account_transfer_fund_withdrawal`);
    try {
      if (selectedToken && selectedToken.tokenName && amount) {
        let amtInNumber = Number(amount.replace(/,/g, ""));
        if (Number(amtInNumber) < 0 || isNaN(parseFloat(amtInNumber))) {
          notify("warn", t("inputErrorLargerThanZero"));
          return;
        } else if (withdrawCheckNegative()) {
          notify("warn", t("withdrawProhibited"));
        } else if (withdrawCheckLargerThanAvaliable()) {
          notify("warn", t("withdrawFailed"));
        } else {
          setIsLoading(true);
          // const assetDetail = await getAssetDetails(selectedToken.tokenName);
          // const assetDecimal = assetDetail.decimals;
          const assetDetail = tokenList.find(
            ({ tokenName }) => tokenName === selectedToken.tokenName
          );
          const assetDecimal = assetDetail.decimal;
          const inputDecimal = decimalCount(amtInNumber);
          if (inputDecimal > assetDecimal) {
            notify("warn", t("inputError"));
            return;
          } else {
            let txnHash = "";
            if (selectedToken.tokenName === "USDC") {
              if (bigNumberCompare(amtInNumber, 30) < 0) {
                notify("warn", t("usdcWithdrawAmountEnoughMsg"));
                setIsLoading(false);
                return;
              } else {
                txnHash = await withdrawUsdcFromPool(amtInNumber);
              }
            } else {
              txnHash = await withdrawFromPool(
                selectedToken.tokenName,
                amtInNumber
              );
            }
            getTransactionReceipt(txnHash);
            // setIsLoading(false);
          }
        }
      }
    } catch (error) {
      // notify("warn", t("networkError"));
      console.log("receiveButtonOnClick error:", error);
      notify("warn", t(getErrorMsgKey(error, "networkError")));
      setIsLoading(false);
    }
  }

  function depositMaxButton() {
    logEvent(getAnalytics(), `account_transfer_fund_deposit_max`);
    if (selectedToken) {
      if (selectedToken.tokenName === "BTCM") {
        setAmount(floorPrecised(btcmDisplayBalance).replace(/,/g, ""));
      } else if (selectedToken.tokenName === "ETHM") {
        setAmount(floorPrecised(ethmDisplayBalance).replace(/,/g, ""));
      } else if (selectedToken.tokenName === "USDM") {
        setAmount(floorPrecised(usdmDisplayBalance).replace(/,/g, ""));
      }
    }
  }

  function withdrawalMaxButton() {
    logEvent(getAnalytics(), `account_transfer_fund_withdrawal_max`);
    if (getMappedSwapWalletOriginalBalance(selectedToken.tokenName) < 0) {
      setAmount("0");
      return;
    }
    if (selectedToken) {
      if (selectedToken.tokenName === "BTCM") {
        setAmount(
          floorPrecised(
            btcmCredit.realizedBalance - btcmCredit.interest
          ).replace(/,/g, "")
        );
      } else if (selectedToken.tokenName === "ETHM") {
        setAmount(
          floorPrecised(
            ethmCredit.realizedBalance - ethmCredit.interest
          ).replace(/,/g, "")
        );
      } else if (
        selectedToken.tokenName === "USDM" ||
        selectedToken.tokenName === "USDC"
      ) {
        setAmount(
          floorPrecised(
            usdmCredit.realizedBalance - usdmCredit.interest
          ).replace(/,/g, "")
        );
      }
    }
  }

  function depositCheckLargerThanAvaliable() {
    try {
      let amtInNumber = Number(amount.replace(/,/g, ""));
      if (selectedToken) {
        if (selectedToken.tokenName === "BTCM") {
          if (amtInNumber > btcmDisplayBalance) {
            return true;
          }
          return false;
        } else if (selectedToken.tokenName === "ETHM") {
          if (amtInNumber > ethmDisplayBalance) {
            return true;
          }
          return false;
        } else if (selectedToken.tokenName === "USDM") {
          if (amtInNumber > usdmDisplayBalance) {
            return true;
          }
          return false;
        }
      }
    } catch (error) {
      console.log("depositCheckLargerThanAvaliable error:", error);
      return false;
    }
  }

  function withdrawCheckLargerThanAvaliable() {
    try {
      let amtInNumber = Number(amount.replace(/,/g, ""));
      if (selectedToken) {
        if (selectedToken.tokenName === "BTCM") {
          if (amtInNumber > btcmCredit.realizedBalance - btcmCredit.interest) {
            return true;
          }
          return false;
        } else if (selectedToken.tokenName === "ETHM") {
          if (amtInNumber > ethmCredit.realizedBalance - ethmCredit.interest) {
            return true;
          }
          return false;
        } else if (
          selectedToken.tokenName === "USDM" ||
          selectedToken.tokenName === "USDC"
        ) {
          if (amtInNumber > usdmCredit.realizedBalance - usdmCredit.interest) {
            return true;
          }
          return false;
        }
      }
    } catch (error) {
      console.log("withdrawCheckLargerThanAvaliable error:", error);
      return false;
    }
  }

  function withdrawCheckNegative() {
    if (
      ethmCredit.realizedBalance - ethmCredit.interest < 0 ||
      usdmCredit.realizedBalance - usdmCredit.interest < 0 ||
      btcmCredit.realizedBalance - btcmCredit.interest < 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  function switchTab(tabName) {
    setSelectTab(tabName);
    setSelectedNetwork(tabName === "withdrawalPage" ? "Eurus" : "Ethereum");
    setAmount(0);
    setSelectedToken(tokenList.find(({ tokenName }) => tokenName === "BTCM"));
  }

  function toggleQrCodeModal() {
    if (codeLink) {
      logEvent(getAnalytics(), `account_toggle_qrcode_zoom`);
      setQrCodeModal(!qrCodeModal);
    }
  }

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
    let walletBalance = getWalletOriginalBalance(tokenName);
    if (selectedTab === "depositPage" && amount) {
      walletBalance =
        getWalletOriginalBalance(tokenName) - Number(amount.replace(/,/g, ""));
    }
    if (selectedTab === "withdrawalPage" && amount) {
      walletBalance =
        getWalletOriginalBalance(tokenName) + Number(amount.replace(/,/g, ""));
    }
    if (walletBalance < 0) {
      walletBalance = 0;
    }
    return walletBalance;
  }

  function getMappedSwapWalletOriginalBalance(tokenName) {
    let mappedSwapWalletBalance = 0;
    if (tokenName === "BTCM" && btcmCredit) {
      mappedSwapWalletBalance = Number(
        btcmCredit.realizedBalance - btcmCredit.interest
      );
    } else if (tokenName === "ETHM" && ethmCredit) {
      mappedSwapWalletBalance = Number(
        ethmCredit.realizedBalance - ethmCredit.interest
      );
    } else if (tokenName === "USDM" && usdmCredit) {
      mappedSwapWalletBalance = Number(
        usdmCredit.realizedBalance - usdmCredit.interest
      );
    }
    return mappedSwapWalletBalance;
  }

  function getMappedSwapWalletFinalBalance(tokenName) {
    let mappedSwapWalletBalance = getMappedSwapWalletOriginalBalance(tokenName);
    if (tokenName === "USDC") {
      mappedSwapWalletBalance = getMappedSwapWalletOriginalBalance("USDM");
    }
    if (selectedTab === "depositPage" && amount) {
      mappedSwapWalletBalance =
        getMappedSwapWalletOriginalBalance(tokenName) +
        Number(amount.replace(/,/g, ""));
    }
    if (selectedTab === "withdrawalPage" && amount) {
      if (tokenName === "USDC") {
        mappedSwapWalletBalance =
          getMappedSwapWalletOriginalBalance("USDM") -
          Number(amount.replace(/,/g, ""));
      } else {
        mappedSwapWalletBalance =
          getMappedSwapWalletOriginalBalance(tokenName) -
          Number(amount.replace(/,/g, ""));
      }
    }
    if (mappedSwapWalletBalance < 0) {
      mappedSwapWalletBalance = 0;
    }
    return mappedSwapWalletBalance;
  }

  function getMappedSwapWalletFinalBalanceTokenName(tokenName) {
    if (tokenName === "USDC") {
      return tokenFormater("USDM");
    }
    return tokenFormater(tokenName);
  }

  return (
    <div>
      <Modal
        isOpen={modal && modal}
        toggle={toggle}
        style={{ maxWidth: "600px" }}
      >
        <ModalBody style={{ padding: 0 }}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggle}>
                <img src={icon_close} alt="close" />
              </div>
            </div>
            <div className={`${style["title"]} ${style["title-left"]}`}>
              {t("transferFund")}
            </div>

            <div className={style["transfer-fund-container"]}>
              <div className={style["select-container"]}>
                <div
                  onClick={() => switchTab("depositPage")}
                  className={`${
                    selectedTab === "depositPage" ? style["active"] : ""
                  }`}
                >
                  {t("deposit")}
                </div>
                <div
                  onClick={() => switchTab("withdrawalPage")}
                  className={`${
                    selectedTab === "withdrawalPage" ? style["active"] : ""
                  }`}
                >
                  {t("withdrawal")}
                </div>
              </div>
              <div className={style["detail-container"]}>
                <div className={style["card-container"]}>
                  <span>{t("network")}</span>
                  <div className={style["card-select"]}>
                    <div className={style["token-container"]}>
                      <FormControl>
                        <Select
                          value={selectedNetwork}
                          onChange={handleNetworkSelect}
                          displayEmpty
                          inputProps={{ "aria-label": "Without label" }}
                          style={{ width: "100%" }}
                        >
                          <MenuItem value={"Eurus"}>
                            <div className={style["card-icon"]}>
                              <img
                                src={
                                  networkList.find(
                                    (network) => network.networkName === "Eurus"
                                  ).networkIcon
                                }
                                alt="selected-token"
                              />
                            </div>
                            <div>{t("eurus")}</div>
                          </MenuItem>
                          {selectedTab === "depositPage" && (
                            <MenuItem value={"Ethereum"}>
                              <div className={style["card-icon"]}>
                                <img
                                  src={
                                    networkList.find(
                                      (network) =>
                                        network.networkName === "Ethereum"
                                    ).networkIcon
                                  }
                                  alt="selected-token"
                                />
                              </div>
                              <div>{t("ethereum")}</div>
                            </MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>
                <div className={style["card-container"]}>
                  <span>{t("asset")}</span>
                  <div className={style["card-select"]}>
                    <div className={style["token-container"]}>
                      {/* <div className={style["card-icon"]}>
                        <img src={selectedToken && selectedToken.tokenIcon} alt="selected-token" />
                      </div> */}
                      <FormControl>
                        <Select
                          value={selectedToken ? selectedToken.tokenName : ""}
                          onChange={handleSelect}
                          displayEmpty
                          inputProps={{ "aria-label": "Without label" }}
                        >
                          <MenuItem value={"BTCM"}>
                            <span>
                              <div className={style["card-icon"]}>
                                <img src={icon_btcm} alt="selected-token" />
                              </div>
                              BTCM
                            </span>
                            {/* {selectedNetwork === "Eurus" && <span>{selectedTab === "depositPage" ? floorPrecised(btcmDisplayBalance) : floorPrecised(btcmCredit.realizedBalance - btcmCredit.interest)}</span>} */}
                          </MenuItem>
                          <MenuItem value={"ETHM"}>
                            <span>
                              <div className={style["card-icon"]}>
                                <img src={icon_ethm} alt="selected-token" />
                              </div>
                              ETHM
                            </span>
                            {/* {selectedNetwork === "Eurus" && <span>{selectedTab === "depositPage" ? floorPrecised(ethmDisplayBalance) : floorPrecised(ethmCredit.realizedBalance - ethmCredit.interest)}</span>} */}
                          </MenuItem>
                          <MenuItem value={"USDM"}>
                            <span>
                              <div className={style["card-icon"]}>
                                <img src={icon_usdm} alt="selected-token" />
                              </div>
                              USDM
                            </span>
                            {/* {selectedNetwork === "Eurus" && <span>{selectedTab === "depositPage" ? floorPrecised(usdmDisplayBalance) : floorPrecised(usdmCredit.realizedBalance - usdmCredit.interest)}</span>} */}
                          </MenuItem>
                          {selectedTab === "withdrawalPage" &&
                            selectedNetwork === "Eurus" && (
                              <MenuItem value={"USDC"}>
                                <span>
                                  <div className={style["card-icon"]}>
                                    <img src={icon_usdc} alt="selected-token" />
                                  </div>
                                  USDC
                                </span>
                                {/* {selectedNetwork === "Eurus" && <span>{selectedTab === "depositPage" ? floorPrecised(usdmDisplayBalance) : floorPrecised(usdmCredit.realizedBalance - usdmCredit.interest)}</span>} */}
                              </MenuItem>
                            )}
                          {selectedNetwork === "Ethereum" &&
                            ethereumTokenList.map((element) => {
                              return (
                                <MenuItem
                                  value={element.tokenName}
                                  key={element.tokenName}
                                >
                                  <span>
                                    <div className={style["card-icon"]}>
                                      <img
                                        src={element.tokenIcon}
                                        alt="selected-token"
                                      />
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
                  <div className={style["card-footer"]}>
                    {selectedTab === "withdrawalPage" &&
                      selectedNetwork === "Eurus" &&
                      selectedToken &&
                      selectedToken.tokenName === "USDC" && (
                        <div className={style["red-info"]}>
                          <span>{t("usdcWithdrawAlert")}</span>
                        </div>
                      )}
                  </div>
                </div>
                <div className={style["card-container"]}>
                  <span>{t("amount")}</span>
                  <div className={style["card-input"]}>
                    <NumberFormat
                      thousandsGroupStyle="thousand"
                      value={amount === 0 ? "" : amount}
                      placeholder={t("0.00")}
                      decimalScale={6}
                      decimalSeparator="."
                      displayType="input"
                      type="text"
                      thousandSeparator={true}
                      allowNegative={false}
                      onChange={handleChange}
                      inputMode="decimal"
                    />
                    {selectedNetwork === "Eurus" && (
                      <div
                        className={style["max"]}
                        onClick={
                          selectedTab === "depositPage"
                            ? depositMaxButton
                            : withdrawalMaxButton
                        }
                      >
                        {t("max")}
                      </div>
                    )}
                  </div>
                  <div className={style["card-footer"]}>
                    {
                      <div className={style["total-balance"]}>
                        <span>MappedSwap {t("balance")} :</span>
                        <span>
                          {selectedToken &&
                            floorPrecised(
                              getMappedSwapWalletFinalBalance(
                                selectedToken.tokenName
                              )
                            )}{" "}
                          {selectedToken &&
                            getMappedSwapWalletFinalBalanceTokenName(
                              selectedToken.tokenName
                            )}
                        </span>
                      </div>
                    }
                    {selectedTab === "depositPage" &&
                      selectedNetwork === "Eurus" && (
                        <div className={style["total-balance"]}>
                          <span>
                            {t("wallet")} {t("balance")} :
                          </span>
                          <span>
                            {selectedToken &&
                              floorPrecised(
                                getWalletFinalBalance(selectedToken.tokenName)
                              )}{" "}
                            {selectedToken && selectedToken.tokenName}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
                <div className={style["button-container"]}>
                  {" "}
                  {isLoading ? (
                    <div className={style["card-button"]}>
                      <span className={style["loading"]}> {t("loading")} </span>
                    </div>
                  ) : (
                    <div className={style["card-button"]}>
                      <span
                        onClick={
                          selectedTab === "depositPage"
                            ? payButtonOnClick
                            : receiveButtonOnClick
                        }
                      >
                        {t("tradeConfirm")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
      <PictureZoom
        modal={qrCodeModal}
        toggle={toggleQrCodeModal}
        link={codeLink}
      />
    </div>
  );
};

export default TransferFundModal;
