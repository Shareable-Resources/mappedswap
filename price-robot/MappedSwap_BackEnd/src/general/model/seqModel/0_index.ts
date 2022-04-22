import { Model, ModelCtor } from 'sequelize/types';
import { PriceHistoryRefFactory } from './PriceHistoryRef';

export enum name {
  PriceHistoryRef = 't_decats_price_histories_ref',
  Prices = 'Prices',
}

export interface ModelCtors {
  [name.PriceHistoryRef]: ModelCtor<Model>;
}

export const factory = {
  PriceHistoryRefFactory,
};

export const associaion = {};
export default { name, factory, associaion };
