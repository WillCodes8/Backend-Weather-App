function requireLogin (req, res, next) {

    console.log("Inside requireLogin. Session:", req.session);
    if(!req.session.userId) {
        return res.status(401).send('Please Login First')
    }
    console.log("User authenticated. Proceeding.");
    next()
}

module.exports = requireLogin;