const debug = require('debug')('lib:shop')
const crypto = require('crypto');
const fs = require('fs');
const config = require('config');

const hashKey = config.get('shops.share.hashKey');
const productDatabasePath = config.get('shops.share.productDatabasePath');
const productTemplatePath = config.get('shops.share.productTemplatePath');

/*
 * Generates a unique ID to be used in a one-time shop article.
 *
 * The ID is computed with the formula:
 *
 *      md5("email|isodate|hashKey")
 */
function generateUniqueProductId(email) {
    const hash = crypto.createHash('md5');
    hash.update(email);
    hash.update('|');
    hash.update(new Date().toISOString());
    hash.update('|');
    hash.update(hashKey);

    var hex = hash.digest('hex');
    debug('Generated product ID for email "%s": %s', email, hex);
    return hex;
}

/*
 * Generates a one-time product in the share shop with the give ID.
 */
function generateProduct(productId, email, callback) {

    debug('Reading product template file: %s', productTemplatePath);

    fs.readFile(productTemplatePath, (err, data) => {

        if (err) {
            debug('Error while reading product template file: %s', JSON.stringify(err));
            return callback(err);
        }

        debug('Read product template from file: %s', productTemplatePath);

        // configure dynamic product details
        var productObj = JSON.parse(data);
        productObj.linker = productId;
        // the shop will not validate the items if the ID is longer than 24 characters
        productObj.id = productId.substring(0, 23);
        productObj.datecreated = new Date().toISOString();

        debug('Adding product to the share shop');

        fs.appendFile(productDatabasePath, JSON.stringify(productObj) + '\n', (err) => {
            if (err) {
                debug('Failed to append the product to the product database file: %s', productDatabasePath);
                return callback(err);
            }

            debug('Product added to the share shop: %s', productDatabasePath);

            callback(null, productObj);
        });
    });
}


exports.generateProduct = generateProduct;
exports.generateUniqueProductId = generateUniqueProductId;
