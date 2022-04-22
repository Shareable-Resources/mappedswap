import {Container} from "@mui/material";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import style from "./Toast.module.scss";
toast.configure();
const notify = (type, result, autoCloseTime = 2000, link = null) => {
  toast(
    <div className={style["message-container"]}>
      <span>{result}</span>
      {link && (
        <a href={link} target="_blank">
          {link}
        </a>
      )}
    </div>,
    {
      position: toast.POSITION.TOP_RIGHT,
      className: `${style[`toastContainer-${type}`]}`,
      bodyClassName: `${style["toastBody"]}`,
      progressClassName: `${style[`toastBar-${type}`]}`,
      autoClose: autoCloseTime,
      draggable: true,
    }
  );
};

export default notify;
