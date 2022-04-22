import style from '../page//MST/MST.module.scss';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getIsMobile } from '../store';
import FlowChart from './FlowChart';


const RebateDescriptionCalculation = () => {

    const { t } = useTranslation()
    const [selectedRecordTab, setSelectedRecordTab] = useState('table');
    const isMobile = getIsMobile()
    return (
        <div className={`${style['description-body-wrap']} `}>
            {isMobile && <div className={style['title']}>
                {t('rebateCalculation')}
            </div>}
            <FlowChart/>
            <div className={style['body']}>
                <span className={style['first']}> {t('rebateCalculationDescriptionOne')}</span>
                <span className={style['first']}> {t('rebateCalculationDescriptionTwo')}</span>
                <span> {t('rebateCalculationDescriptionThree')}</span>
            </div>
        </div>
    )

}

export default RebateDescriptionCalculation