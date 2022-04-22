import React from 'react';
import { useState, useEffect } from "react";
import TableRow from './TableRow';
import '../../page/Event/VolumeTradingComp.module.scss';
import { useTranslation } from "react-i18next";
import { leaderBoardRanking } from "../../api";
import axios from 'axios';

const hardCodeRanking = [
  {
    "id": "2601",
    "ruleId": "1",
    "rule": {
      "id": "1",
      "rank": 1,
      "percentageOfPrice": "20"
    }
  },
  {
    "id": "2602",
    "ruleId": "2",
    "rule": {
      "id": "2",
      "rank": 2,
      "percentageOfPrice": "18"
    }
  },
  {
    "id": "2603",
    "ruleId": "3",
    "rule": {
      "id": "3",
      "rank": 3,
      "percentageOfPrice": "15"
    }
  },
  {
    "id": "2604",
    "ruleId": "4",
    "rule": {
      "id": "4",
      "rank": 4,
      "percentageOfPrice": "12"
    }
  },
  {
    "id": "2605",
    "ruleId": "5",
    "rule": {
      "id": "5",
      "rank": 5,
      "percentageOfPrice": "10"
    }
  },
  {
    "id": "2606",
    "ruleId": "6",
    "rule": {
      "id": "6",
      "rank": 6,
      "percentageOfPrice": "8"
    }
  },
  {
    "id": "2607",
    "ruleId": "7",
    "rule": {
      "id": "7",
      "rank": 7,
      "percentageOfPrice": "5"
    }
  },
  {
    "id": "2608",
    "ruleId": "8",
    "rule": {
      "id": "8",
      "rank": 8,
      "percentageOfPrice": "3"
    }
  },
  {
    "id": "2609",
    "ruleId": "9",
    "rule": {
      "id": "9",
      "rank": 9,
      "percentageOfPrice": "2"
    }
  },
  {
    "id": "2610",
    "ruleId": "10",
    "rule": {
      "id": "10",
      "rank": 10,
      "percentageOfPrice": "2"
    }
  },
  {
    "id": "2611",
    "ruleId": "11",
    "rule": {
      "id": "11",
      "rank": 11,
      "percentageOfPrice": "1"
    }
  },
  {
    "id": "2612",
    "ruleId": "12",
    "rule": {
      "id": "12",
      "rank": 12,
      "percentageOfPrice": "1"
    }
  },
  {
    "id": "2613",
    "ruleId": "13",
    "rule": {
      "id": "13",
      "rank": 13,
      "percentageOfPrice": "0.5"
    }
  },
  {
    "id": "2614",
    "ruleId": "14",
    "rule": {
      "id": "14",
      "rank": 14,
      "percentageOfPrice": "0.5"
    }
  },
  {
    "id": "2615",
    "ruleId": "15",
    "rule": {
      "id": "15",
      "rank": 15,
      "percentageOfPrice": "0.5"
    }
  },
  {
    "id": "2616",
    "ruleId": "16",
    "rule": {
      "id": "16",
      "rank": 16,
      "percentageOfPrice": "0.5"
    }
  },
  {
    "id": "2617",
    "ruleId": "17",
    "rule": {
      "id": "17",
      "rank": 17,
      "percentageOfPrice": "0.25"
    }
  },
  {
    "id": "2618",
    "ruleId": "18",
    "rule": {
      "id": "18",
      "rank": 18,
      "percentageOfPrice": "0.25"
    }
  },
  {
    "id": "2619",
    "ruleId": "19",
    "rule": {
      "id": "19",
      "rank": 19,
      "percentageOfPrice": "0.25"
    }
  },
  {
    "id": "2620",
    "ruleId": "20",
    "rule": {
      "id": "20",
      "rank": 20,
      "percentageOfPrice": "0.25"
    }
  }
]

const CampaignTable = ({ tableHeader, tableBody }) => {

  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const ITEM_PER_PAGE = 20;

  useEffect(() => {
    try {
      async function getRankingDetail() {
        let LEADERBOARDAPI = leaderBoardRanking(ITEM_PER_PAGE);
        let response = await axios.get(LEADERBOARDAPI);
        if (response && response.data && response.data.data) {
          const data = response.data.data
          data.sort(function (a, b) {
            var keyA = Number(a.ruleId);
            var keyB = Number(b.ruleId);
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          });
  
          for (let i = 0; i < data.length; i++) {
            const ele = data[i]
            if (Number(ele.profitAndLoss) > 0) {
              hardCodeRanking[i] = ele
            }
          }
          setLeaderboard(data)
        }
      }
      getRankingDetail()
    } catch (error) {
      console.log("getRankingDetail err", error)
    }
  }, [])



  return (
    <table>
      <thead>
        <tr>
          <th colSpan="4">{t("leaderboardHeader")}</th>
        </tr>
      </thead>
      <thead>
        <tr>
          <th>{t("rank")}</th>
          <th>{t("percentOfPrize")}</th>
          <th>{t("walletAddress")}</th>
          <th>{t("cumulativePNL")}</th>
        </tr>
      </thead>
      <tbody>
        {hardCodeRanking.map((element) => {
          return <TableRow key={element.id} id={element.id} rank={element.rule.rank}
            percentageOfPrice={element.rule.percentageOfPrice}
            address={element.customer && element.customer.address}
            profitAndLoss={element.profitAndLoss} />
        })}
      </tbody>
    </table>
  );
};

export default CampaignTable;