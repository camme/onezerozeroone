var everyauth = require('everyauth');
var users = require('user-data');

exports.init = function(app) {


    everyauth.dropbox

        .consumerKey('wky5toz3cbvmwza')
        .consumerSecret('62r1feb703muurw')

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

