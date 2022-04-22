const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (email, password) => {
    if (process.env.key === undefined) {
        throw new Error("encryption key not set!")
    } 

    const user = await User.findOne({
        where: {
            email: email
        }
    })
    if (user && bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            {
                userId: user.id.toString(),
                admin: user.admin
            },
            process.env.key 
        );

        return {
            token: token,
            userId: user.id,
            admin: user.admin
        }
    }
    else {
        throw new Error("login fail!")
    }
}


