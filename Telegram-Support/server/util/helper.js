const ResponseState = {
    Success: 200,
    Fail: 400
}

exports.formatRes = (res, data, message) => {
    res.status(200).json({
        result: data,
        status: 200,
        message: message
    });
}