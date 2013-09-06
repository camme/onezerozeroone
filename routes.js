//var moments = 
var fs = require('fs');
var postsModel = require('./postsmodel');
var mustache = require('mustache');

exports.init = function(app) {
    app.get("/", index);
    app.get("/posts/:post", showPost);
    app.get("/:tag", showByTags);
}


var marked = require("marked");
var highlighter = require("highlight").Highlight;

marked.setOptions({
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    langPrefix: '',
    highlight: function(code, lang) {
        if (lang === 'js') {
            return highlighter(code);
        }
        return code;
    }
});

var lastMessage = null;

function showPost(req, res) {

    var post = postsModel.getEntryByPath(req.params.post);

    var parsed = marked(post.content);
    parsed = parsed.replace(/<p>---/g, "<p class='intro'>");
    parsed = parsed.replace(/---<\/p>/g, "</p>");

    var parsedPost = {
        content: parsed,
        title: post.title,
        tags: post.tags
    };

    render({post: parsedPost}, 'post.html', req, res);

    return;

}

function index(req, res) {

    var posts = [];

    postsModel.entries.forEach(function(post) {
        var parsedPost = {
            path: '/posts/' + post.path,
            excerpt: marked(post.excerpt),
            shortTitle: post.shortTitle,
            firstImage: post.firstImage
        };
        posts.push(parsedPost);
    });

    render({posts: posts}, 'index.html', req, res);

    return;

}

function showByTags(req, res) {

    var posts = [];

    postsModel.getEntriesByTag(req.params.tag).forEach(function(post) {
        var parsedPost = {
            path: '/posts/' + post.path,
            excerpt: marked(post.excerpt),
            shortTitle: post.shortTitle,
            firstImage: post.firstImage
        };
        posts.push(parsedPost);
    });

    render({posts: posts}, 'index.html', req, res);

    return;

}

function render(data, template, req, res) {

    var binary = fs.readFileSync('public/images/1001.png');
    var base64data = new Buffer(binary).toString('base64');
    data.logo64 =  base64data;

    data.tagline = "Javascript, nodejs and everything in between.";
    data.tags = postsModel.getAllTags();

    data.tags.forEach(function(tag) {
        if (tag.name == req.params.tag) {
            tag.active =true;
        }
    });

    var template = fs.readFileSync('public/' + template, 'utf8');
    var html = mustache.render(template, data);

    var parts = html.split('<!-- part -->');

    console.log("--------------");
    console.log("Total size: %s", html.length);
    console.log("Part 1 size: %s", parts[0].length);
    console.log("Part 2 size: %s", parts[1].length);

    res.setHeader('Transfer-Encoding', 'chunked');
    res.write(parts[0]);
    //res.end(parts[1]);

    setTimeout(function() {
        res.end(parts[1]);
    }, 2);

 

}


