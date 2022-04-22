import logger from '../util/ServiceLogger';
import PriceService from '../service/PriceService';
import PriceHistoryService from '../service/PriceHistoryService';
import globalVar from '../const/globalVar';

const usdmAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<USDM>']
    .address;
const btcmAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<BTCM>']
    .address;
const ethmAddress =
  globalVar.foundationConfig.smartcontract.MappedSwap['OwnedBeaconProxy<ETHM>']
    .address;

// const modelModule = seq.sequelize.models;
const interval = globalVar.dAppConfig.priceLoader.interval;

export let price: any;
export const kLineObj: any = {};
// const kLineObj: any = {};

export class PriceLoader {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  // private price: DBModel.Price = new DBModel.Price();
  constructor(private priceService: PriceService = new PriceService()) {}

  async loadPriceIntoMemory() {
    logger.info(
      `[loadPriceIntoMemory] Starts load price into memory at interval ${interval}`,
    );

    const temp = kLineObj;

    try {
      logger.info(`1st time load when start server`);

      const priceHistoryService: PriceHistoryService =
        new PriceHistoryService();

      //1st time load when start server
      price = await this.priceService.getPrice();
      await this.getLastKLine();

      await setInterval(async function () {
        // logger.info(`Load price into memory`);

        const service: PriceService = new PriceService();
        const priceLoader: PriceLoader = new PriceLoader();
        price = await service.getPrice();
        // await this.getLastKLine();

        // await priceLoader.getLastKLine();
        await priceLoader.loadPriceIntoKline();
      }, interval);
    } catch (e) {
      logger.error(`loadPriceIntoMemory failed`);
      logger.error(e);
    }
  }

  async loadPriceIntoKline() {
    try {
      if (price && kLineObj) {
        const dateNow = new Date();
        const dateWithoutSecond: any = new Date(new Date().setSeconds(0, 0));

        // const currentPrice = price;
        // const currentKline = kLineObj;

        let closePrice = 0;
        let price0 = 0;
        let price1 = 0;

        price.forEach((element) => {
          // const pairName = element.pairName;
          // logger.info('pairName: ' + pairName);

          price0 = element.reserve0 / 10 ** element.reserve0DecimalPlace;
          price1 = element.reserve1 / 10 ** element.reserve1DecimalPlace;

          if (element.pairName.includes('BTCM')) {
            if (usdmAddress < btcmAddress) {
              closePrice = price0 / price1;
            } else {
              closePrice = price1 / price0;
            }
          } else {
            if (usdmAddress < ethmAddress) {
              closePrice = price0 / price1;
            } else {
              closePrice = price1 / price0;
            }
          }

          // closePrice = price0 / price1;

          // const tempkLineTime = kLineObj[element.pairName].createdDate;
          const kLineTime: any = new Date(
            kLineObj[element.pairName].createdDate.setSeconds(0, 0),
          );
          const timeDiff: any = dateWithoutSecond - kLineTime;

          kLineObj[element.pairName].close = closePrice;

          if (timeDiff >= 60000) {
            kLineObj[element.pairName].open = closePrice;
            kLineObj[element.pairName].high = closePrice;
            kLineObj[element.pairName].low = closePrice;
          } else {
            if (kLineObj[element.pairName].high < closePrice) {
              kLineObj[element.pairName].high = closePrice;
            }
            if (kLineObj[element.pairName].low > closePrice) {
              kLineObj[element.pairName].low = closePrice;
            }
          }

          kLineObj[element.pairName].createdDate = dateNow;
        });

        // logger.info(currentPrice);
      }
    } catch (e) {
      logger.error(`loadPriceIntoMemory failed`);
      logger.error(e);
    }
  }

  async getLastKLine() {
    try {
      const dateNow = new Date();
      const dateWithoutSecond = new Date(new Date().setSeconds(0, 0));

      let kLineData: any = {};
      let kLine: any = {};

      const req: any = {};
      req['pairName'] = 'BTCM/USDM';
      req['dateFrom'] = dateWithoutSecond;
      req['dateTo'] = dateNow;
      req['recordPerPage'] = 1000;
      req['pageNo'] = 0;
      // req['timeInterval'] = '60';

      kLine = await this.priceService.getAllBlockPrice(req);
      kLineData['open'] = 0;
      kLineData['close'] = 0;
      kLineData['low'] = 0;
      kLineData['high'] = 0;

      let count = 0;
      let closePrice = 0;
      let price0 = 0;
      let price1 = 0;
      kLine.rows.forEach((element) => {
        price0 = element.reserve0 / 10 ** element.reserve0DecimalPlace;
        price1 = element.reserve1 / 10 ** element.reserve1DecimalPlace;

        if (usdmAddress < btcmAddress) {
          closePrice = price0 / price1;
        } else {
          closePrice = price1 / price0;
        }

        if (count == 0) {
          kLineData['open'] = closePrice;
        }
        kLineData['close'] = closePrice;

        if (closePrice > kLineData['high'] || count == 0) {
          kLineData['high'] = closePrice;
        }
        if (closePrice < kLineData['low'] || count == 0) {
          kLineData['low'] = closePrice;
        }

        count++;
      });
      kLineData['createdDate'] = dateWithoutSecond;

      kLineObj[req.pairName] = kLineData;

      req['pairName'] = 'ETHM/USDM';
      kLineObj[req.pairName] = {};

      kLine = {};
      kLineData = {};
      count = 0;
      closePrice = 0;
      price0 = 0;
      price1 = 0;
      kLine = await this.priceService.getAllBlockPrice(req);

      kLine.rows.forEach((element) => {
        price0 = element.reserve0 / 10 ** element.reserve0DecimalPlace;
        price1 = element.reserve1 / 10 ** element.reserve1DecimalPlace;

        if (usdmAddress < ethmAddress) {
          closePrice = price0 / price1;
        } else {
          closePrice = price1 / price0;
        }

        if (count == 0) {
          kLineData['open'] = closePrice;
        }
        kLineData['close'] = closePrice;

        if (closePrice > kLineData['high'] || count == 0) {
          kLineData['high'] = closePrice;
        }
        if (closePrice < kLineData['low'] || count == 0) {
          kLineData['low'] = closePrice;
        }

        count++;
      });
      kLineData['createdDate'] = dateWithoutSecond;

      kLineObj[req.pairName] = kLineData;
    } catch (e) {
      logger.error(`loadPriceIntoMemory failed`);
      logger.error(e);
    }
  }
}
