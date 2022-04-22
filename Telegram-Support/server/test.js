

const axios = require('axios');

beforeAll(async () => {
    const createDb = require('./util/createDb');
    const createDummyData = require('./util/createDummyData');
    
    await createDb.sync({ force: true });
    await createDummyData();
});

test('test get all users', () => {
    return axios.get('http://localhost:8000/users').then(response => {
        expect(response.data.result.length).toBe(2);
    })
    .catch(err => {
        expect(true).toBe(false);
    });
});

// test('test /bot/ticket/1', () => {
//     return axios.post(
//         'http://localhost:8000/bot/ticket/1',
//         {
//             ticketId: "t1", 
//             customerId: "c1", 
//             message: "content...."
//         }
//     ).then(response => {
//         expect(response.data.status).toBe(200);
//     })
//     .catch(err => {
//         console.log(err)
//         expect(true).toBe(false);
//     });  
// });