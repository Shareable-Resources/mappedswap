import style from '../page/MST/MST.module.scss';
import { useState } from 'react';
import { getIsMobile, getTokenList } from '../store';
import { amountDivideDecimals, floorPrecised } from '../web3';
import moment from 'moment';
import { shortenHash } from '../utils';

const BurnTransactionElement = ({ createdDate, txHash, mstAmount, usdPrice }) => {

    const tokenList = getTokenList()
    const usdmDecimal = tokenList.find(token => token.tokenName === "USDM").decimal
    const mstDecimal = tokenList.find(token => token.tokenName === "MST").decimal
    const isMobile = getIsMobile()

    function getDisplayHash () {
        if (txHash) {
            if(isMobile) {
                return shortenHash(txHash)
            } else {
                return txHash
            }
        }
    }

    return (
        <tr>
            <td className={style['time']}>{createdDate && moment(createdDate).format('YYYY-MM-DD HH:mm')}</td>
            <td className={style['address']}><span>{txHash && getDisplayHash()}</span></td>
            <td className={style['time']}>{mstAmount && floorPrecised(amountDivideDecimals(mstAmount, mstDecimal),2)}</td>
            <td className={style['time']}>{usdPrice && floorPrecised(amountDivideDecimals(usdPrice, usdmDecimal),2)}</td>
        </tr>
    )

}

export default BurnTransactionElement