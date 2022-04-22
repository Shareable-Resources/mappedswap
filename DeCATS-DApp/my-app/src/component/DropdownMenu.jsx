import React from "react";
import style from "./DropdownMenu.module.scss";
import {useTranslation} from "react-i18next";

export const DropdownMenu = (isActive) => {
  const {t} = useTranslation();

  return (
    <div className={`${style["sub-menu"]} ${isActive && style["active-sub-menu"]}`}>
      <div className={`${style["token-name"]}`}>
        {/* <div className={style['card-icon']}>
                            <img src={icon_dropdownselect} alt="ethm" />
                        </div> */}
        <span> {t("copyAddress")}</span>
      </div>
      <div className={style["token-name"]}>
        {/* <div className={style['card-icon']} >
                            <img src={icon_dropdownselect} alt="ethm" />
                        </div> */}
        <span> {t("disconnect")}</span>
      </div>
    </div>
  );
};
