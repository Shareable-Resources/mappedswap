import style from './MST.module.scss';
import { useTranslation } from 'react-i18next';
import icon_decats from '../../asset/icon_decats.svg'
import icon_usdm from '../../asset/icon_usdm.svg'
import icon_ethm from '../../asset/icon_ethm.svg'
import icon_btcm from '../../asset/icon_btcm.svg';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MSTRate } from '../../api';
import axios from 'axios';
import { useState, useEffect } from 'react';
import notify from '../../component/Toast';
import { getPairReserve, floorPrecised, amountDivideDecimals } from '../../web3';
import { getTokenList } from '../../store';
import BurnTransaction from '../../component/BurnTransaction';
import BuyBackTransaction from '../../component/BuyBackTransaction';

const MSTInfo = () => {

    const { t } = useTranslation()
    const tokenList = getTokenList()
    const [MSTRateValue, setMSTRateValue] = useState('');
    const [usdmTokenReserve, setUSDMTokenReserve] = useState(0)
    const [btcmTokenReserve, setBTCMTokenReserve] = useState(0)
    const [ethmTokenReserve, setETHMTokenReserve] = useState(0)

    async function getMSTRate() {

        try {
            let MSTRATEAPI = MSTRate();
            let response = await axios.get(MSTRATEAPI)
            if (response && response.data && response.data.data && response.data.data[0]) {
                setMSTRateValue(response.data.data[0].mstPrice)
            }

        } catch (error) {
            console.error('getMSTRate error', error);
            notify('warn', t('networkError'))
        }
    }


    async function getReserve() {
        try {
            const ethPairReserveInfo = await getPairReserve("USDM", "ETHM")
            const BtcPairReserveInfo = await getPairReserve("USDM", "BTCM")
            setUSDMTokenReserve(BtcPairReserveInfo.token0)
            setBTCMTokenReserve(BtcPairReserveInfo.token1)
            setETHMTokenReserve(ethPairReserveInfo.token1)
        } catch (error) {
            console.error('Get Reserve error', error);
            notify('warn', t('networkError'))
        }
    }


    useEffect(() => {
        try {
            getMSTRate()
            getReserve()
        } catch (error) {
            console.log('getList err', error)
        }
    }, [])

    return (
        <>
            <div id={style['mst-info-wrap']}>
                <div className={style['large-card-container']}>
                    <div className={`${style['left-card']} ${style['top-left-card']}`}>
                        <div className={style['left-box']}>
                            <div className={style['box-title']}>{t('lastPrice')}</div>
                            <div className={style['price-container']}> {MSTRateValue && floorPrecised(amountDivideDecimals(Number(MSTRateValue), tokenList.find(token => token.tokenName === "USDM").decimal), 6)}
                            </div>
                        </div>
                        <div className={style['right-box']}>
                            <div className={style['top-box']}>
                                <div className={style['large-value-container']}>
                                    <div className={`${style['value-container']} ${style['top-container']}`}>
                                        <span>{t('circulatingSupply')}</span>
                                        0
                                    </div>
                                    <div className={style['value-container']}>
                                        <span>{t('totalSupply')}</span>
                                        0
                                    </div>
                                </div>
                                <div className={style['progress-bar-container']}>
                                    {/* Progress Bar */}
                                    <CircularProgressbar value={0} text={`${0}%`} />
                                </div>
                            </div>
                            <div className={style['bottom-box']}>
                                <div className={style['large-value-container']}>
                                    <div className={`${style['value-container']} ${style['top-container']}`}>
                                        <span>{t('marketingCap')}</span>
                                        0
                                    </div>
                                    <div className={style['value-container']}>
                                        <span>{t('fullyDilutedValuation')}</span>
                                        0
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className={`${style['right-card']} ${style['mst-intro']}`}>
                        <div className={style['title']}>{t('whatisMST')}</div>
                        <div className={style['body']}>{t('MSTDescription')}</div>
                        <div className={style['bottom']}>
                            <div className={style['card-icon']}>
                                <img src={icon_decats} alt="decats" />
                            </div></div>
                    </div>
                </div>
                <div className={style['large-card-container']}>

                    <div className={`${style['left-card']} ${style['mst-treasury']}`}>
                        <div className={style['card-container']}>
                            <div className={style['title']}>{t('MSTTreasury')}
                            </div>
                            <div className={style['body']}>
                                <div className={style['first']}> {t('treasuryFundDescriptionOne')}</div>
                                <div className={style['first']}> {t('treasuryFundDescriptionTwo')}</div>
                                <div className={style['first']}> {t('treasuryFundDescriptionThree')}</div>
                                <div className={style['first']}> {t('treasuryFundDescriptionFour')}</div>
                            </div>
                        </div>
                    </div>
                    <div className={style['right-card']}>
                        <span>{t('assetDetail')}</span>

                        <div className={style['tokens-container']}>

                            <div className={`${style['token-container']} ${style['top-container']}`}>
                                <div className={style['li-label']}>
                                    <div className={style['card-icon']}>
                                        <img src={icon_btcm} alt="ethm" />
                                    </div>
                                    BTCM
                                </div>
                                <div className={style['li-value']}>
                                    {btcmTokenReserve && floorPrecised(amountDivideDecimals(btcmTokenReserve, tokenList.find(token => token.tokenName === "BTCM").decimal), 2)}
                                </div>
                            </div>
                            <div className={`${style['token-container']} ${style['top-container']}`}>
                                <div className={style['li-label']}>
                                    <div className={style['card-icon']}>
                                        <img src={icon_ethm} alt="usdm" />
                                    </div>
                                    ETHM
                                </div>
                                <div className={style['li-value']}>
                                    {ethmTokenReserve && floorPrecised(amountDivideDecimals(ethmTokenReserve, tokenList.find(token => token.tokenName === "ETHM").decimal), 2)}
                                </div>
                            </div>
                            <div className={style['token-container']}>
                                <div className={style['li-label']}>
                                    <div className={style['card-icon']}>
                                        <img src={icon_usdm} alt="usdm" />
                                    </div>
                                    USDM
                                </div>
                                <div className={style['li-value']}>
                                    {usdmTokenReserve && floorPrecised(amountDivideDecimals(usdmTokenReserve, tokenList.find(token => token.tokenName === "USDM").decimal), 2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['card-container']}>
                    <div className={style['title']}>{t('buyBackDetails')}
                    </div>
                    <BuyBackTransaction></BuyBackTransaction>
                </div>
                <div className={style['card-container']}>
                    <div className={style['title']}>{t('burnTransaction')}
                    </div>
                    <BurnTransaction></BurnTransaction>
                </div>
            </div>
        </>
    )
}

export default MSTInfo