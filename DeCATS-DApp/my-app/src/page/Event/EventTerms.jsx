import { getLang } from "../../store"

const EventTerms = () => {

    const telegramLink = 'https://t.me/mappedswapofficial'
    const campaignOneLink = 'https://www.mappedswap.io/promotion'

    const lang = getLang()
    return (
        <>
            {
                lang === "en" &&
                <>
                    <li>All tasks rewards are on first come first serve basis, Task 1 has <span>10,000</span> openings, Task 2 has <span>4,000</span> and Task 3 has <span>1,000.</span></li>
                    <li>Task 1,  a referral code can be obtained from completing <a href={campaignOneLink}>Campaign 1</a>. Users who did not participate campaign 1  can trade or stake into MappedSwap to get a referral code.</li>
                    <li>Connected wallet should contain a <span>combined minimum of 0.01ETH</span> value of the following tokens (BTC, ETH, USDC, USDT) on Ethereum Chain to prevent bots from snatching allocated USDMs and MSTs. Combined minimum value of 0.01 ETH will be refresh and pegged to market rate everyday on <span>12:00am UTC+8.</span></li>
                    <li>In Task 1, users need to share their referral code & link, and allow 24 hours for our team to check the sharing of your Twitter message. Duplicate wallet addresses who met task requirements do not qualify. Qualified users will have their USDM deposited into your Account page in MappedSwap.</li>
                    <li>In Task 2, accumulative trade refers to the total amount of trade made starting from <span>13 April 2022</span>, rewards are distributed <span>once</span> per day when users met the criteria. One wallet address will receive one reward only.</li>
                    <li>In mid stop Task 3, Cumulative Profit and Loss value is determined by having at least 10,000 USD in value to qualify for the MST giveaway. This calculation will activate only on mid stop day of the whole promotion <span>28 April 2022, ends at 10pm, UTC+8.</span> Rewards will distribute to qualified users the next day.</li>
                    <li>When users participate in Task 2 and/or 3, they are automatically participating in the leaderboard race for the 200,000 MST prize pool.</li>
                    <li>Leaderboard competition is based on the how much Cumulative Profit and Loss value you have, the higher value you have the higher you climb. The leaderboard refreshes every 15 minutes.</li>
                    <li>First come first serve conditions are depicted as follows:</li>
                    <ul>
                        <li>Task 1, base on the timestamp of your submission of the image capture in Google Form.</li>
                        <li>Task 2, first to meet the criteria of the accumulative trade of 1,000 USD value, within the campaign period.</li>
                        <li>Task 3, first to meet the criteria of the 10,000 USD in total value from the day your wallet is connected onto MappedSwap.</li>
                    </ul>
                    <li>All MSTs giveaway are automatically staked into your account in MappedSwap.</li>
                    <li>USDM rewards will be deposited into your Account page in MappedSwap.</li>
                    <li>Unstaking of MST will result in a <span>7 days withdrawal processing time.</span></li>
                    <li>Leaderboard prizes will be processed within <span>3 days</span> after the campaign ends.</li>
                    <li>For any support, please access our <a href={telegramLink}>Telegram group</a>.</li>
                </>
            }
            {
                lang === "zh_CN" &&
                <>
                    <li>所有任务奖励依参加先后顺序领取：任务1为<span>1万</span>个名额，任务2为<span>4千</span>名，任务3为<span>1千</span>名。</li>
                    <li>任务1，可以通过完成<a href={campaignOneLink}>活动1</a>获得推荐码，未参与活动1的用户可以在MappedSwap进行交易或质押以获得推荐码。</li>
                    <li>连接的钱包应包含以太坊链上 <span>总价值至少为 0.01 ETH</span>之等值的以下代币（wBTC、ETH、USDC、USDT），以防止机器人占用活动奖励(USDM, MST)名额。 0.01 ETH 的价值将在每天<span>上午 10:00 UTC+8</span> 更新，每日市价取自CoinMarketCap。</li>
                    <li>任务1，用户需要分享推荐码与连结，并设定为所有人皆能看到，24小时内将会有MappedSwap团队的人至推特检视您的分享贴文。重复的推荐码地址不符合活动资格。奖励的USDM会直接打入符合资格用户的MappedSwap帐户。</li>
                    <li>任务2，累积交易即从<span>2022年4月13起</span>的交易加总数目。奖励将一天发放一次给达到门槛的用户。一个钱包地址将只会收到一个奖励。</li>
                    <li>中继任务3，累计盈亏计算后需至少达到10,000美元才符合MST赠奖活动资格。任务3结算日为2022年4月28日晚上10点（UTC+8），并会在隔天分发奖励给符合资格的用户。</li>
                    <li>当使用者完成任务2跟3时，使用者将会自动加入排行榜的竞争，后续可分红价值200,000 MST的总奖金。</li>
                    <li>排行榜评分标准为用户所有累计盈亏的总额，其总价值越高，则排名越前面。排行榜每15分钟刷新一次排名。</li>
                    <li>依据先到先得的顺序领取奖励之条件如下：</li>
                    <ul>
                        <li>任务1，将根据你提交截图的Google表单上的时间纪录。</li>
                        <li>任务2，活动期间最先达到累积交易量1,000 USD的门槛。</li>
                        <li>任务3，自您的钱包成功连接到 MappedSwap 当日算起，优先满足累积交易总额（盈亏 PNL）达到价值10,000 USD的门槛。</li>
                    </ul>
                    <li>所有MST赠奖活动都会自动质押至您在Mappedswap的帐户内。</li>
                    <li>USDM奖励将会显示在您的Mappedswap帐户页面。</li>
                    <li>赎回MST质押需<span>7天赎回等待期</span>。</li>
                    <li>排行榜奖项将在活动结束后<span>三天</span>内发放。</li>
                    <li>如需任何协助请透过<a href={telegramLink}>纸飞机</a>联络我们。</li>
                </>
            }
            {
                lang === "zh_TW" &&
                <>
                    <li>所有任務獎勵依參加先后順序領取：任務1為<span>1萬</span>個名額，任務2為<span>4千</span>名，任務3為<span>1千</span>名。</li>
                    <li>任務1，可以通過完成<a href={campaignOneLink}>活动1</a>獲得推薦碼，未參與活動1的用戶可以在MappedSwap進行交易或質押以獲得推薦碼。</li>
                    <li>連接的錢包應包含以太坊鏈上<span>總價值至少為 0.01 ETH</span>之等值的以下代幣（wBTC、ETH、USDC、USDT），以防止機器人佔用活動獎勵(USDM, MST)名額。 0.01 ETH 的價值將在每天<span>上午 10:00 UTC+8</span> 更新，每日市價取自CoinMarketCap。</li>
                    <li>任務1，用戶需要分享推薦碼與連結，並設定為所有人皆能看到，24小時內將會有MappedSwap團隊的人至推特檢視您的分享貼文。重復的推薦碼地址不符合活動資格。獎勵的USDM會直接打入符合資格用戶的MappedSwap帳戶。</li>
                    <li>任務2，累積交易即從<span>2022年4月13起</span>的交易加總數目。獎勵將一天發放一次給達到門檻的用戶。一個錢包地址將隻會收到一個獎勵。</li>
                    <li>中繼任務3，累計盈虧計算后需至少達到10,000美元才符合MST贈獎活動資格。任務3結算日為2022年4月28日晚上10點（UTC+8），並會在隔天分發獎勵給符合資格的用戶。</li>
                    <li>當使用者完成任務2跟3時，使用者將會自動加入排行榜的競爭，后續可分紅價值200,000 MST的總獎金。</li>
                    <li>排行榜評分標准為用戶所有累計盈虧的總額，其總價值越高，則排名越前面。排行榜每15分鐘刷新一次排名。</li>
                    <li>依據先到先得的順序領取獎勵之條件如下：</li>
                    <ul>
                        <li>任務1，將根據你提交截圖的Google表單上的時間紀錄。</li>
                        <li>任務2，活動期間最先達到累積交易量1,000 USD的門檻。</li>
                        <li>任務3，自您的錢包成功連接到 MappedSwap 當日算起，優先滿足累積交易總額（盈虧 PNL）達到價值10,000 USD的門檻。</li>
                    </ul>
                    <li>所有MST贈獎活動都會自動質押至您在Mappedswap的帳戶內。</li>
                    <li>USDM獎勵將會顯示在您的Mappedswap帳戶頁面。</li>
                    <li>贖回MST質押需<span>7天贖回等待期</span>。</li>
                    <li>排行榜獎項將在活動結束后<span>三天</span>內發放。</li>
                    <li>如需任何協助請透過<a href={telegramLink}>紙飛機</a>。</li>
                </>
            }
            {
                lang === "zh_KR" &&
                <>
                    <li>모든 보상은 선착순으로 지급됩니다. Task 1은 <span>10,000</span>, Task 2는 <span>4000</span>, Task 3는 <span>1000</span>의 열린 자리가 있습니다.</li>
                    <li>추천 코드는 <a href={campaignOneLink}>캠페인 1을</a> 완료하면 얻을 수 있습니다. 캠페인 1에 참여하지 않은 사용자는 MappedSwap으로 거래하거나 스테이킹하여 추천 코드를 얻을 수 있습니다.</li>
                    <li>이 캠페인에서 봇이 할당된 MST를 가로채지 못하도록 등록된 지갑에는 다음 토큰(wBTC, ETH, USDC, USDT)<span>의 최소 0.01 ETH 값이</span> 포함되어야 합니다. 0.01 ETH의 합산 최소값은 <span>UTC+8 오전</span>10시 매일 CoinMarketCap의 시장 환율에 의해 결정됩니다.</li>
                    <li>Task 1에서, 이용자는 추천 코드와 링크를 공유하고나서 팀이 트위터 메세지 공유 확인을 위해 24시간을 기다려야합니다. Task 요구사항을 충족한 중복된 주소들은 자격이 주어지지 않습니다. 허가된 이용자들은 MappedSwap의 계정 페이지에 그들의 USDM이 입금될 것입니다.</li>
                    <li>Task 2에서, 누적 거래는 <span>2022년 4월 13</span>일부터 만들어진 모든 거래량을 말합니다. 보상은 이용자가 조건에 부합할시 하루에 <span>한번</span> 지급될 것입니다. 한 지갑 주소로 오직 한번에 보상을 받을 것입니다.</li>
                    <li>Task 3 중간 점검에서, 누적 손익은 최소 10,000 USD의 가치를 가지고 있냐에 따라 MST 기브어웨이에 자격이 있는지 결정납니다. 이 계산법은 오직 전체 프로모션의 중간 점검 날(<span>2022년 4월 28일 10pm UTC+8</span> 까지)에 사용됩니다. 보상은 다음날 자격이 있는 이용자에게 지급됩니다.</li>
                    <li>이용자가 Task 2와 Task 3에 참여할때, 자동적으로 20만 MST 상금이 걸려있는 리더보드 경쟁에 자동적으로 참여하게 됩니다.</li>
                    <li>리더보드 경쟁은 대 누적 손익은최 따라 정해집니다. 더 높은 가치를 가지고 있을 수록 높은 자리로 올라갑니다. 리더보드는 매 15분 마다 업데이트 됩니다.</li>
                    <li>선착순은 아래와 같이 설명될 수 있습니다</li>
                    <ul>
                        <li>Task 1, 모든 구글로 제출되 화면 캡쳐는 제출 시간에 기반됩니다.</li>
                        <li>Task 2, 캠페인 기간동안 누적 거래량이 1,000 USD 가치에 도달한 사람.</li>
                        <li>Task 3, 지갑을 MappedSwap에 연결한 뒤 10,000 USD 가치에 충족한 사람.</li>
                    </ul>
                    <li>모든 MST 기브어웨이는 자동으로 MappedSwap 계정에 스테이킹 될 것입니다.</li>
                    <li>USDM 보상은 MappedSwap의 계정 페이지에 예금될 것입니다.</li>
                    <li>MST의 언스테이킹은 <span>7일간의 출금 시간이</span> 필요합니다.</li>
                    <li>리더보드 상은 캠페인 끝난 <span>3일</span> 뒤에 진행될 것입니다.</li>
                    <li>어떤 도움이 필요하시면, 저희 <a href={telegramLink}>텔레그램</a> 그룹에 연락을 주세요.</li>
                </>
            }
        </>
    )
}

export default EventTerms