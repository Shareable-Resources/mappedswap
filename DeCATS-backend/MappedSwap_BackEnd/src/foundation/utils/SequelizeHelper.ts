import e from 'express';
import { Op, Sequelize, Transaction } from 'sequelize';

class SeqReplacementWhere {
  whereClauses: string[];
  replacement: any;
  constructor() {
    this.whereClauses = [];
    this.replacement = {};
  }
  push(whereClause: string, fieldName: string, fieldValue: string) {
    this.whereClauses.push(whereClause);
    this.replacement[fieldName] = fieldValue;
  }
  toSql() {
    if (this.whereClauses.length == 1) {
      return `where ${this.whereClauses[0]}`;
    } else if (this.whereClauses.length > 1) {
      return `where ${this.whereClauses.join(' AND ')}`;
    } else {
      return '';
    }
  }
}

const sequelizeHelper = {
  where: {
    generateStatement() {
      return {};
    },
    pushExactItemIfNotNull(whereStatement: any, fieldName: string, data: any) {
      if (data) {
        whereStatement[fieldName] = data;
      }
      return whereStatement;
    },
    pushLikeItemIfNotNull(whereStatement: any, fieldName: string, data: any) {
      if (data) {
        whereStatement[fieldName] = {
          [Op.like]: `%${data}%`,
        };
      }
      return whereStatement;
    },
    pushArrayItemIfNotNull(whereStatement: any, fieldName: string, data: any) {
      if (data && Array.isArray(data)) {
        whereStatement[fieldName] = {
          [Op.in]: data.map((x) => x),
        };
      }
      return whereStatement;
    },
  },
  whereQuery: {
    generateWhereClauses() {
      return new SeqReplacementWhere();
    },
  },
};

export default sequelizeHelper;
