

class DatabaseService {

    client;
    models;

    constructor(sequelize) {
        this.client = sequelize;
        this.models = this.client.models;
    }

    async inTransaction(work) {
        const t = await this.client.transaction();
        try {
            let result = await work(t);
            t.commit();
            return result;
        }
        catch(error) {
            t.rollback();
            throw error;
        }
    }

}

module.exports = DatabaseService;
