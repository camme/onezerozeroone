var everyauth = require('everyauth');
var users = require('user-data');
var config = require('./config');

exports.init = function(app) {


    everyauth.dropbox

        .consumerKey(config.dropbox.key)
        .consumerSecret(config.dropbox.secret)

        .findOrCreateUser( function (sess, accessToken, accessSecret, user) {

            var current = users.getByEmail(user.email);

            // if we already have a user, we just update it
            if (current) {
                console.log("Exist");
                current.dropbox = {
                    accessToken: accessToken,
                    accessSecret: accessSecret,
                    id: user.id
                };
                users.save();
            }
            
            // if not, create it
            else {

                console.log("Create");
                current = users.add({
                    name: user.display_name,
                    email: user.email,
                    dropbox: {
                        accessToken: accessToken,
                        accessSecret: accessSecret,
                        id: user.id
                    }
                });

            }

            console.log("----- current", user, current);
            return current;

        })
        .redirectPath('/');
}

