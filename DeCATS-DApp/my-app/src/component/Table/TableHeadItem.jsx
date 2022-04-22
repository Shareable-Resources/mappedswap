import React from 'react';

const TableHeadItem = ({ header }) => {
  return (
    <td title={header}>
        {header}
    </td>
  );
};

export default TableHeadItem;