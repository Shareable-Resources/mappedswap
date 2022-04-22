import { getLang } from "../../store"

const MidStopDay = () => {
    const lang = getLang()

    return (
        <>
            {

                lang === "en" && <>Mid stop day is <span>28 April 2022, ending at 10pm (UTC+8)</span></>
            }
            {

                lang === "zh_TW" && <>中繼結算日為<span>2022年4月28日晚上10點(UTC+8)</span></>
            }
            {

                lang === "zh_CN" && <>中继结算日为<span>2022年4月28日晚上10点(UTC+8)</span></>
            }
            {

                lang === "zh_KR" && <>중간 점검 날짜는 <span>2022년 4월 28일이고 10pm에 끝납니다.(UTC+8)</span></>
            }
        </>
    )
}

export default MidStopDay