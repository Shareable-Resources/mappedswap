import style from '../page/MST/MST.module.scss';
import { useTranslation } from 'react-i18next'

const StakingModalButton = ({ isLargerThanApproved, isApprovalLoading, isStakeLoading, approvalButtonOnClick, stakeButtonOnClickForApproved }) => {

    const { t } = useTranslation()

    console.log(isLargerThanApproved, isApprovalLoading, isStakeLoading)

    return (
        <>
            {
                !isLargerThanApproved &&
                <div className={`${style['card-button']} ${style['card-button-double']}`}>
                    {isApprovalLoading ? <div className={style['loading']}> {t('loading')}</div> :
                        <>
                            {
                                isLargerThanApproved ?
                                    <div className={style['approved']}>{t('approved')}</div> :
                                    <div onClick={() => approvalButtonOnClick()}>{t('approve')}</div>
                            }
                        </>
                    }
                    {isStakeLoading ? <div className={style['loading']}> {t('loading')}</div> :
                        <>
                            {
                                isLargerThanApproved ?
                                    <div onClick={() => stakeButtonOnClickForApproved()}>{t('stake')}</div> :
                                    <div className={style['disabled']}>{t('stake')}</div>
                            }
                        </>
                    }
                </div>
            }
            {isLargerThanApproved &&
                <div className={style['card-button']}>
                    {isStakeLoading ? <div className={style['loading']}> {t('loading')}</div> : <>
                        {
                            isLargerThanApproved ? <div onClick={() => stakeButtonOnClickForApproved()}>{t('stake')}</div> :
                                <div className={style['disabled']}> {t('stake')}</div>
                        }
                    </>}
                </div>
            }

        </>
    )
}

export default StakingModalButton