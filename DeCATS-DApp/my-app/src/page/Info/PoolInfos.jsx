import PoolInfo from "./PoolInfo";
import style from "./PoolInfo.module.scss";
import {getIsMobile} from "../../store";

const PoolInfos = ({selectedToken}) => {
  const isMobile = getIsMobile();
  return (
    <>
      {!isMobile && (
        <div className={style["quote-containers"]}>
          <PoolInfo defaultTokenName="BTCM" isMobile={isMobile} />
          <PoolInfo defaultTokenName="ETHM" isMobile={isMobile} />
        </div>
      )}
      {isMobile && (
        <div className={style["quote-containers"]}>
          <PoolInfo defaultTokenName={selectedToken && selectedToken} isMobile={isMobile} />
        </div>
      )}
    </>
  );
};

export default PoolInfos;
