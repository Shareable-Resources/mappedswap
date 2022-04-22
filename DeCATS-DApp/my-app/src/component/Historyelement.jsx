
import style from '../page/Dashboard/Dashboard.module.scss';
import moment from 'moment'
import { useState, useEffect } from 'react';
import { getAssetDetails, amountDivideDecimals, floorPrecised} from '../web3';

const Historyelement = ({ amount, time, token }) => {

    const [amountOutput, setAmountOutput] = useState('')

    useEffect(() => {
        try {

            async function getAssetDetail() {
                //Size
                const assetDetail = await getAssetDetails(token)
                const decimal = assetDetail.decimals
                const amountOutput = amountDivideDecimals(amount, decimal)
                setAmountOutput(amountOutput)
            }
            getAssetDetail()

        } catch (error) {
            console.log("getAssetDetail err", error)
        }

    }, [token, amount])

    return (
        <>
            <div className={style['history-container']}>
            <div className={style['time']}>{time && moment(time).format('YYYY-MM-DD HH:mm')}</div>
                {/* <div className={style['type']}> {type === "4" ? t('withdrawl') : t('deposit')} </div> */}
                <div className={style['amount']}><div className={style['amount-value']}>{amountOutput && floorPrecised(amountOutput)}</div> <span>{amountOutput && token}</span></div>
            </div>
        </>
    )
}

export default Historyelement