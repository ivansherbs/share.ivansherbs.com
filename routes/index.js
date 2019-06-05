var express = require('express');
var router = express.Router();

var tokens = require('../lib/tokens');
var shop = require('../lib/shop');

const SHOP_URL = 'https://freetrial.ivansherbs.com/detail/';

/* GET home page. */
router.get('/', function(req, res, next) {
    let params = Object.keys(req.query);

    if (params.length === 1 && req.query[params[0]] === '') {

        tokens.validateToken(params[0], (err, tokenDoc) => {
            if (err) {
                res.render('error', { error: { status: err.code } });
                return;
            }
            if (tokenDoc.email) {
                res.redirect(tokenDoc.url || SHOP_URL);
                return;
            }
            res.render('code');
        });
        return;
    }
    res.render('share');
});

/* POST email */
router.post('/', function(req, res, next) {
    if (!req.body || !req.body.email || !req.body.token) {
        res.send({ code: 'INVALID_REQUEST' });
        return;
    }
    tokens.associateEmail(req.body.token, req.body.email, (err, tokenDoc) => {

        // TODO generate shop article
        shop.addOneTimeArticle(req.body.email, (err, data) => {
            if (err) {
                console.error(err);
                res.send({ code: 'CONTACT_SUPPORT' });
                return;
            }

            res.send({ code: 'OK', url: SHOP_URL + data.id });
        });
    });
});

module.exports = router;
