const util = require('../utils/utils');
const {ENUM_TRANSFER_STATUS} = require('../utils/Constants');
const transferHistoryService = require('./transferHistoryService');

// test creation
test("test create", async () => {
    let db = await util.connectToPostgres();
    let transferHistory = new transferHistoryService(db);
    
    try {
        let element = {
            "amount": "1000000",
            "blockHash": "0xe8d29ff7faa66ebf9d478a83adba5dde62700d1ec32eac4d803337e0c56899bf",
            "blockNo": 11197711,
            "confirmStatus": 0,
            "networkCode": "EUN_dev",
            "onchainStatus": 0,
            "seqNo": 1000,
            "symbol": "USDT",
            "tag": "1000123",
            "txHash": "0x9b8af111285e5d942c774f1931676cea93c64b56e7f03a3588d29af932b27853"
        };

        await transferHistory.inTransaction(async (t) => {
            await transferHistory.create(element, t);
        });   

        const row = await transferHistory.getByPk(1000);
        expect(row.amount).toEqual("1000000");
    }
    finally {
        await transferHistory.delete(1000);
        db.close();
    }
});

async function CreateTwoRow() {
    let db = await util.connectToPostgres();
    let transferHistory = new transferHistoryService(db);
    
    try {
        let elements = [
            {
                "amount": "1000000",
                "blockHash": "0xe8d29ff7faa66ebf9d478a83adba5dde62700d1ec32eac4d803337e0c56899bf",
                "blockNo": 11197711,
                "confirmStatus": 0,
                "networkCode": "EUN_dev",
                "onchainStatus": 0,
                "seqNo": 1000,
                "symbol": "USDT",
                "tag": "1000123",
                "txHash": "0x9b8af111285e5d942c774f1931676cea93c64b56e7f03a3588d29af932b27853"
            },
            {
                "amount": "0",
                "blockHash": "0x0d6dcd6e6549aa6fa4e6f3dc924c38db068ea370f2b923acadbb328a1c30bbd0",
                "blockNo": 9941717,
                "confirmStatus": 1,
                "networkCode": "Rinkeby_dev",
                "onchainStatus": 2,
                "seqNo": 1001,
                "symbol": "mUSDT",
                "tag": "Valid payment",
                "txHash": "0x850c73c110623d3da4eb8f49f1e19f54dffaee86cc192e5fa26dbb0afdac2c92"
            }
        ]

        await transferHistory.inTransaction(async (t) => {
            await transferHistory.create(elements[0], t);
            await transferHistory.create(elements[1], t);
        });   
    }
    finally {
        db.close();
    }
}

// getAll
test('test getAll', async () => {
    await CreateTwoRow(); 

    let db = await util.connectToPostgres();
    let transferHistory = new transferHistoryService(db);

    try {
        const row = await transferHistory.getAll();
        expect(row.length).toEqual(2);
        expect(row[0].networkCode).toEqual("EUN_dev");
        expect(row[1].symbol).toEqual("mUSDT");
    }
    finally {
        await transferHistory.delete(1000);
        await transferHistory.delete(1001);
        db.close();
    }
});

// findLatestSeqNo
test('test findLatestSeqNo', async () => {
    await CreateTwoRow(); 

    let db = await util.connectToPostgres();
    let transferHistory = new transferHistoryService(db);

    try {
        const max = await transferHistory.findLatestSeqNo();
        expect(max).toEqual(1001);
    }
    finally {
        await transferHistory.delete(1000);
        await transferHistory.delete(1001);
        db.close();
    }
});

// isExist
test('test isExist', async () => {
    await CreateTwoRow(); 

    let db = await util.connectToPostgres();
    let transferHistory = new transferHistoryService(db);

    try {
        expect(await transferHistory.isExist(1000)).toBeTruthy();
    }
    finally {
        await transferHistory.delete(1000);
        await transferHistory.delete(1001);
        db.close();
    }
});

// transferComplete
test('test transferComplete', async () => {
    await CreateTwoRow(); 

    let db = await util.connectToPostgres();
    let transferHistory = new transferHistoryService(db);

    try {
        await transferHistory.inTransaction(async (t) => {
            await transferHistory.transferComplete(1000);
        });   
        const row = await transferHistory.getByPk(1000);
        expect(row.transferStatus).toEqual(ENUM_TRANSFER_STATUS.COMPLETED);
    }
    finally {
        await transferHistory.delete(1000);
        await transferHistory.delete(1001);
        db.close();
    }
});