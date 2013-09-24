//var moments = 
var fs = require('fs');
var users = require('user-data');
var dbox  = require("dbox")
var config = require('./config');
var dropboxApp   = dbox.app({ "app_key": config.dropbox.key, "app_secret": config.dropbox.secret }) 
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
        //console.log("Read post " + entry.shortTitle);

        entry.tags.forEach(function(tag) {
            var tag = tag.replace(/^\s+/g, '').replace(/\s+$/g, '').toLowerCase();

            if (!entriesByTag[tag]) {
                entriesByTag[tag] = [];
            }

        });

        entry.tags.forEach(function(tag) {
            entriesByTag[tag].push(entry);
        });


    }
});

exports.entries = entries;

exports.getEntriesByTag = function(tag) {
    var entries = entriesByTag[tag];
    return entries ? entries : [];
};

exports.getEntryByPath = function(path) {
    var entry = entriesByPath[path];
    //console.log("PATH %s", path, entry);
    return entry;
}

exports.getAllTags = function() {
    var tags = [];
    for(var tag in entriesByTag) {
        tags.push({
            name: tag,
            count: entriesByTag[tag].length
        });
    }
    return tags;
}

//console.log(users.getList()[0].dropbox.accessToken);

function syncPosts() {

    console.log("Beginning to sync with dropbox...");

    dropboxClient.readdir( '/', function(status, list) {

        //console.log("\nSyncing %s items", list.length);

        if (status == 200) {

            entries = [];
            entriesByTag = [];

            list.forEach(function(item) {
                dropboxClient.get(item, function(status, reply, metadata){

                    //console.log(item, status, metadata);

                    if (status == 200) {

                        if (!metadata.is_dir && item.lastIndexOf("/") == 0) {

                            var content = reply.toString();
                            var entry = parseEntry(item, content, entriesByTag, entriesByPath);

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

function parseEntry(item, content, entriesByTag, entriesByPath) {


    content = content.replace(/(!\[image\]\()/gi, "$1/");

    var metaRe = /!!!([\w\W]+?)!!!/g;
    var metaContentMatch = metaRe.exec(content);
    var metaContent = metaContentMatch ? metaContentMatch[1] : '';
    var parsedContent = content.replace(metaRe, '');

    var shortTitle = /(.*?)\n/.exec(metaContent)[1].replace(/^\s+/g, '').replace(/\s+$/g, '');
    var urlName = shortTitle.toLowerCase().replace(/[ ]/g, '-').replace(/['"´`]/g, '');
    var tags = /tags:(.*)\n/i.exec(metaContent)[1].split(",");
    var publishedData = /hide:(.*)\n/i.exec(metaContent);
    var published = publishedData ? publishedData[0] == "true" : false;
    var excerpt = metaContent.replace(/tags:(.*)\n/i, '').replace(/(.*)\n/, '');

    var imagesRe = /!\[image\]\((.*?)\)/g;
    var imagesMatch = imagesRe.exec(content);
    var images = imagesMatch ? imagesMatch.splice(1) : [];

    //var introRe = /---([\w\W]+?)---/g;
    //var introContentMatch = introRe.exec(parsedContent);
    //var intro = introContentMatch ? introContentMatch[1] : '';
    //var parsedContent = parsedContent.replace(metaRe, '');

    var tags = tags.map(function(tag) {
        var tag = tag.replace(/^\s+/g, '').replace(/\s+$/g, '').toLowerCase();

        if (!entriesByTag[tag]) {
            entriesByTag[tag] = [];
        }

        return tag;
    });

    var entry = {
        file: item,
        excerpt: excerpt,
        content: parsedContent,
        images: images,
        firstImage: images.length > 0 ? images[0] : null,
        path: urlName,
        shortTitle: shortTitle,
        tags: tags
    };


    tags.forEach(function(tag) {
        entriesByTag[tag].push(entry);
    });

    entries.push(entry);

    entriesByPath[entry.path] = entry;

    return entry;
}

function loadParsedEntry(entry) {

    tags.forEach(function(tag) {
        entriesByTag[tag].push(entry);
    });

    entries.push(entry);

    entriesByPath[entry.path] = entry;

}

syncPosts();

exports.init = function(app) {
    app.get("/sync", syncPosts);
}


