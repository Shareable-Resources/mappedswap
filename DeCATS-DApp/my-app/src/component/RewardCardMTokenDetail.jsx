import style from '../page/MST/MST.module.scss';
import { getTokenList } from '../store';
import { amountDivideDecimals, floorPrecised} from '../web3';

const RewardCardMTokenDetail = ({ ledgerDetail }) => {

    const tokenList = getTokenList()
    const MSTIcon = tokenList.find(token => token.tokenName === "MST").tokenIcon
    const tokenIcon = tokenList.find(token => token.tokenName === ledgerDetail.token).tokenIcon
    const tokenDecimal = tokenList.find(token => token.tokenName === ledgerDetail.token).decimal
    return (
        <div className={style['table-values']}>
            <span><div className={style['card-icon']}>
                <img src={tokenIcon} alt="usdm" />
            </div><div>{ledgerDetail && floorPrecised(amountDivideDecimals(Number(ledgerDetail.distMToken),tokenDecimal)) }</div></span>
            <span><div className={style['card-icon']}>
                <img src={MSTIcon} alt="usdm" />
            </div><div>{ledgerDetail && floorPrecised(amountDivideDecimals(Number(ledgerDetail.distMSTToken),tokenDecimal))}</div></span>
        </div>
    )

}

export default RewardCardMTokenDetail