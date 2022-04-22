import React from 'react';
import { getTokenList } from '../../store';
import { shortenHash } from '../../utils';
import { amountDivideDecimals, floorPrecised } from '../../web3';

const TableRow = ({ rank, percentageOfPrice, address, profitAndLoss }) => {
  const tokenList = getTokenList();

  return (
    <tr>
      <td>{rank}</td>
      <td>{percentageOfPrice}%</td>
      <td>{address && shortenHash(address)}</td>
      <td>{profitAndLoss ? "$" : ""}{profitAndLoss && floorPrecised(amountDivideDecimals(profitAndLoss, tokenList.find((token) => token.tokenName === "USD").decimal), 2)}</td>
    </tr>
  );
};

export default TableRow;