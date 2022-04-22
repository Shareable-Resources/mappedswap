import {Modal, ModalBody} from "reactstrap";
import icon_close from "../asset/icon_close.png";
import {useTranslation} from "react-i18next";
import style from "./AddTokenModal.module.scss";
import {getNetworkList, getMappedSwapTokenList} from "../store";
import {Container, Row, Col} from "reactstrap";
import {watchWalletAsset} from "../web3";
import notify from "./Toast";

const AddTokenModal = ({modal, toggle}) => {
  const {t} = useTranslation();
  const mappedSwapTokenList = getMappedSwapTokenList();
  async function addTokenButtonOnClick(tokenName, network) {
    const isEthNetworkBol = network === "Ethereum";
    console.log("isEthNetworkBol", isEthNetworkBol);
    try {
      await watchWalletAsset(tokenName, isEthNetworkBol);
      // if (addResult) {
      //   notify("primary", t("addSuccuss"));
      // } else {
      //   notify("primary", t("addFail"));
      // }
    } catch (error) {
      console.error("addTokenButtonOnClick error", error);
      notify("warn", t("networkError"));
    }
  }

  return (
    <div>
      <Modal isOpen={modal && modal} toggle={toggle} style={{maxWidth: "600px"}}>
        <ModalBody style={{padding: 0}}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggle}>
                <img src={icon_close} alt="close" />
              </div>
            </div>
            <div className={`${style["title"]} ${style["title-left"]}`}>{t("addToken")}</div>
            <div className={style["detail-container"]}>
              <div className={style["card-container"]}>
                <div className={style["network-container"]}>
                  <div className={style["card-icon"]}>
                    <img src={getNetworkList()[0].networkIcon} alt="selected-token" />
                  </div>
                  <div>{getNetworkList()[0].networkName}</div>
                </div>
                <Container>
                  <Row>
                    {mappedSwapTokenList &&
                      mappedSwapTokenList.map((element) => {
                        return (
                          <Col className={`${style["tokens-container"]}`} key={element.tokenName} xs="3" sm="3" md="3" lg="3" xl="3" xxl="3" style={{paddingRight: "5px", paddingLeft: "5px"}}>
                            <div className={style["token-container"]} onClick={() => addTokenButtonOnClick(element.tokenName, getNetworkList()[0].networkName)}>
                              <div className={style["card-icon"]}>
                                <img src={element.tokenIcon} alt="close" />
                              </div>
                              <div>{element.tokenName}</div>
                            </div>
                          </Col>
                        );
                      })}
                  </Row>
                </Container>
              </div>
              <div className={style["card-container"]}>
                <div className={style["network-container"]}>
                  <div className={style["card-icon"]}>
                    <img src={getNetworkList()[1].networkIcon} alt="selected-token" />
                  </div>
                  <div>{getNetworkList()[1].networkName}</div>
                </div>
                <Container>
                  <Row>
                    {mappedSwapTokenList &&
                      mappedSwapTokenList.map((element) => {
                        return (
                          <Col className={`${style["tokens-container"]}`} key={element.tokenName} xs="3" sm="3" md="3" lg="3" xl="3" xxl="3" style={{paddingRight: "5px", paddingLeft: "5px"}}>
                            <div className={style["token-container"]} onClick={() => addTokenButtonOnClick(element.tokenName, getNetworkList()[1].networkName)}>
                              <div className={style["card-icon"]}>
                                <img src={element.tokenIcon} alt="close" />
                              </div>
                              <div>{element.tokenName}</div>
                            </div>
                          </Col>
                        );
                      })}
                  </Row>
                </Container>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AddTokenModal;
