import {Modal, ModalBody} from "reactstrap";
import icon_close from "../asset/icon_close.png";
import style from "./PictureZoom.module.scss";
import QRCode from "qrcode.react";

const PictureZoom = ({modal, toggle, link}) => {
  return (
    <div>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalBody style={{padding: 0}}>
          <div id={style["modal-container"]}>
            <div className={style["close-container"]}>
              <div className={style["card-icon"]} onClick={toggle}>
                <img src={icon_close} alt="close" />
              </div>
            </div>
            <div className={style["zoom-picture-container"]}>
              <QRCode id="qr-gen-big" value={link} size={400} level={"H"} includeMargin={true} />{" "}
            </div>
            <div className={style["link-wrap"]}>
              <div className={style["link-container"]} onClick={() => window.open(link)}>
                {link && link}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default PictureZoom;
