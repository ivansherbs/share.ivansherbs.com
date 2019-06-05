const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'ivansherbs';
const colName = 'share.tokens';

function validateToken(token, callback) {

	MongoClient.connect(url, function(err, client) {

		const db = client.db(dbName);
		const collection = db.collection(colName);

        collection.find({ token: token }).toArray(function(err, docs) {

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

function associateEmail(token, email, callback) {

	MongoClient.connect(url, function(err, client) {

		const db = client.db(dbName);
		const collection = db.collection(colName);

        collection.findOneAndUpdate({ token: token }, { $set: { email: email } }, { returnOriginal: false }, function(err, result) {

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
exports.associateEmail = associateEmail;
