const debug = require('debug')('lib:subscribers')
const fs = require('fs');
const config = require('config');

var Mailchimp = require('mailchimp-api-v3')
var mailchimp = new Mailchimp(config.get('mailchimp.apiKey'));

function add(email, listConfigKey, data, callback) {
    // validate email
    if (!email) {
        return callback('Invalid email address for subscriber');
    }

    if (typeof data === 'function') {
        callback = data;
        data = {};
    }

    var mergeFields = {};
    if (data.code) {
        merge_fields.CODE = data.code;
    }

    var requestObj = {
        path: '/lists/{list_id}/members',
        path_params: {
            list_id: config.get(listConfigKey)
        },
        body: {
            email_address: email,
            status: 'subscribed',
            merge_fields: mergeFields
        }
    };

    debug('Sending the following request to MailChimp: %s', JSON.stringify(requestObj));

    // add the user to the MailChimp list
    mailchimp.post(requestObj, (err, result) => {

        if (err) {
            debug('MailChimp replied with an error: %s', JSON.stringify(err));
            // accepted errors
            if (err.title === 'Member Exists') {
                err = null;
            }
            return callback(err);
        }

        return callback(null);
    });
}


exports.add = add;
