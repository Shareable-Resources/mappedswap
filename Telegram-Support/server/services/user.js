const User = require('../models/user');

exports.getAll = async () => {
    return await User.findAll();
}

exports.getById = async (id) => {
    return await User.findByPk(id);
}

exports.create = async (obj) => {
    // return await User.create({
    //     name: obj.name
    // });
}

exports.update = async (obj) => {
    // const user = await User.findByPk(id);
    // if (user === null) {
    //     // throw error
    // }
    // else {
    //     user.name = obj.name;
    //     await user.save();
    // }
}

exports.delete = async (obj) => {
    // const user = await User.findByPk(id);
    // if (user === null) {
    //     // throw error
    // }
    // else {
    //     await user.destroy();
    // }
}