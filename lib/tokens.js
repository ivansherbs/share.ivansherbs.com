const MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb://localhost:27017';
const dbName = 'ivansherbs';
const colName = 'share.tokens';

function validateToken(token, callback) {

    MongoClient.connect(connectionString, { useNewUrlParser: true }, function(err, client) {

        client.db(dbName).collection(colName).find({ token: token }).toArray(function(err, docs) {

            client.close();

            if (docs.length !== 1) {
                return callback({ code: 'INVALID_TOKEN' });
            }
            if (docs[0].consumed) {
                return callback({ code: 'USED_TOKEN' });
            }

            callback(null, docs[0]);
        });
    });
}

function associateData(token, data, callback) {

    MongoClient.connect(connectionString, { useNewUrlParser: true }, function(err, client) {

        client.db(dbName).collection(colName).findOneAndUpdate({ token: token }, { $set: data }, { returnOriginal: false }, function(err, result) {

            client.close();

            if (err) {
                return callback({ code: 'SAD_ERROR' });
            }
            if (!result.value) {
                return callback({ code: 'INVALID_TOKEN' });
            }

            callback(null, result.value);
        });
    });
}


exports.validateToken = validateToken;
exports.associateData = associateData;
