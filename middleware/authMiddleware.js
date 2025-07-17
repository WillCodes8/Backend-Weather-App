function requireLogin (req, res, next) {
    if(!req.session.userID) {
        return res.status(401).send('Please Login First')
    }
    next()
}

module.exports = requireLogin;