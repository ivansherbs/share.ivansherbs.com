const debug = require('debug')('router:index')
const config = require('config');

var express = require('express');
var router = express.Router();

const tokens = require('../lib/tokens');
const shop = require('../lib/shop');

const SHOP_URL = config.get('shops.share.shopUrlBase');

/* GET home page. */
router.get('/', function(req, res, next) {
    let params = Object.keys(req.query);

    if (params.length === 1 && req.query[params[0]] === '') {

        debug('Requested to share with code: %s', params[0]);

        tokens.validateToken(params[0], (err, doc) => {
            if (err) {
                debug('The requested share code %s has an issue: %s', params[0], err.code);
                res.render('error', { error: { status: err.code } });
                return;
            }
            if (doc.email) {
                debug('Redirecting associated code (%s) to shop: %s', doc.token, doc.shopUrl);
                res.redirect(doc.shopUrl || SHOP_URL);
                return;
            }
            debug('Capturing email for non-associated code: %s', doc.token);
            res.render('code');
        });
        return;
    }

    debug('Requested to share with empty code');

    res.render('share');
});

/* POST email */
router.post('/', function(req, res, next) {

    if (!req.body || !req.body.email || !req.body.token) {
        res.send({ code: 'INVALID_REQUEST' });
        return;
    }

    var email = req.body.email;
    var productId = shop.generateUniqueProductId(email);
    debug('Generated product ID for the share shop: %s', productId);
    var productUrl = SHOP_URL + productId;

    var data = { email: email, shopUrl: productUrl };

    debug('Associating code with data: %s', JSON.stringify(data));

    tokens.associateData(req.body.token, data, (err, doc) => {

        debug('Generating product in the share shop');

        shop.generateProduct(productId, email, (err, data) => {

            if (err) {
                console.error(err);
                res.send({ code: 'CONTACT_SUPPORT' });
                return;
            }

            res.send({ code: 'OK', url: productUrl });
        });
    });
});


module.exports = router;
