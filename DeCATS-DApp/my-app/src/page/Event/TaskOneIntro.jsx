import { getLang } from "../../store"

const TaskOneIntro = () => {
    const lang = getLang()

    return (
        <>
            {

                lang === "en" && <>Share your unique <span>referral code & link</span> on your social media accounts to earn 5 USDM! Users must submit a screen capture of their post to be eligible.</>
            }
            {

                lang === "zh_TW" && <>在你的社交媒體平台分享你的個人<span>推薦碼與連結</span>即可賺取5USDM！</>
            }
            {

                lang === "zh_CN" && <>在你的社交媒体平台分享你的个人<span>推荐码与连结</span>即可赚取5USDM！</>
            }
            {

                lang === "zh_KR" && <>당신의 유니크한 <span>추천 코드와 링크를</span> 소셜미디어에 공유하고 5 USDM을 받아가세요</>
            }
        </>
    )
}

export default TaskOneIntro