import {Container, Row} from "reactstrap";
import style from "./Footer.module.scss";
import {getAppVersion} from "../store";
import icon_whatsapp from "../asset/icon_whatsapp.svg";
import icon_telegram from "../asset/icon_telegram.svg";
import {useHistory} from "react-router";
import {getAnalytics, logEvent} from "firebase/analytics";

const Navbar = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = getAppVersion();
  const history = useHistory();

  function directTelegram() {
    logEvent(getAnalytics(), `footer_direct_telegram`);
    window.open(process.env.REACT_APP_MAPPEDSWAP_TELEGRAM);
  }

  return (
    <div id={style["footer"]}>
      <div className={style["icons-container"]}>
        <div className={style["card-icon"]} onClick={directTelegram}>
          <img src={icon_telegram} alt="icon" />
        </div>
      </div>
      <span>{currentYear} © MappedSwap</span>
      {/* <span>Version : {appVersion}</span> */}
    </div>
  );
};

export default Navbar;
