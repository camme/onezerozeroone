//var moments = 
var fs = require('fs');
var users = require('user-data');
var dbox  = require("dbox")
var dropboxApp   = dbox.app({ "app_key": "wky5toz3cbvmwza", "app_secret": "62r1feb703muurw" }) 
var dropboxClient = dropboxApp.client({ 
    oauth_token: users.getList()[0].dropbox.accessToken,
    oauth_token_secret: users.getList()[0].dropbox.accessSecret
});

var entries = [];
var entriesByTag = {};
var entriesByPath = {};

var postList = fs.readdirSync(__dirname + '/posts');
postList.forEach(function(file) {
    if (file.indexOf('.json') > -1) {
        var entry = JSON.parse(fs.readFileSync(__dirname + '/posts/' + file, 'utf8'));
        entries.push(entry);
        entriesByPath[entry.path] = entry;
        console.log("Read post " + entry.shortTitle);
    }
});

exports.entries = entries;

exports.getEntriesByTag = function(tag) {
    return entriesByTag[tag];;
};

exports.getEntryByPath = function(path) {
    var entry = entriesByPath[path];
    console.log("PATH %s", path, entry);
    return entry;
}

//console.log(users.getList()[0].dropbox.accessToken);

function syncPosts() {

    console.log("Beginning to sync with dropbox...");

    dropboxClient.readdir( '/', function(status, list) {

        console.log("\nSyncing %s items", list.length);

        if (status == 200) {

            entries = [];
            entriesByTag = [];

            list.forEach(function(item) {
                dropboxClient.get(item, function(status, reply, metadata){

                    //console.log(item, status, metadata);

                    if (status == 200) {

                        if (!metadata.is_dir && item.lastIndexOf("/") == 0) {

                            var content = reply.toString();
                            content = content.replace(/(!\[image\]\()/gi, "$1/");

                            var metaRe = /!!!([\w\W]+?)!!!/g;
                            var metaContentMatch = metaRe.exec(content);
                            var metaContent = metaContentMatch ? metaContentMatch[1] : '';
                            var parsedContent = content.replace(metaRe, '');

                            var shortTitle = /(.*?)\n/.exec(metaContent)[1].replace(/^\s+/g, '').replace(/\s+$/g, '');
                            var urlName = shortTitle.toLowerCase().replace(/[ ]/g, '-').replace(/['"´`]/g, '');
                            var tags = /tags:(.*)\n/i.exec(metaContent)[1].split(",");
                            var excerpt = metaContent.replace(/tags:(.*)\n/i, '').replace(/(.*)\n/, '');

                            var tags = tags.map(function(tag) {
                                var tag = tag.replace(/^\s+/g, '').replace(/\s+$/g, '').toLowerCase();

                                if (!entriesByTag[tag]) {
                                    entriesByTag[tag] = [];
                                }

                                return tag;
                            });

                            var entry = {
                                file: item,
                                path: urlName,
                                shortTitle: shortTitle,
                                excerpt: excerpt,
                                tags: tags,
                                content: parsedContent
                            };

                            tags.forEach(function(tag) {
                                entriesByTag[tag].push(entry);
                            });

                            entries.push(entry);

                            entriesByPath[entry.path] = entry;

                            console.log("");
                            console.log(JSON.stringify(entry, null, '    '));

                            fs.writeFileSync('./posts' + item.replace('md', 'json'), JSON.stringify(entry, null, '    '), 'utf8');

                        }
                        else if (!metadata.is_dir) {

                            var folders = item.match(/\/(\w+?)\//gi);
                            var current = folders.shift();
                            var path = "./public";

                            while(current) {

                                var folder = current.replace(/\/$/g, "");
                                path += folder;
                                if (!fs.existsSync(path)) {
                                    fs.mkdirSync(path);
                                }
                                current = folders.shift();

                            }

                            fs.writeFileSync('./public' + item, reply, 'binary');

                        }

                    }

                });
            });

            console.log(" ");

        }
        else {
            console.log("ERROR FROM DROPBOX");
        }

    });

}

syncPosts();

exports.init = function(app) {
    app.get("/sync", syncPosts);
}


