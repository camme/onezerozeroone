//var moments = 
var fs = require('fs');
var indexHtml = fs.readFileSync('public/index.html', 'utf8');
var postsModel = require('./postsmodel');

exports.init = function(app) {
    app.get("/", index);
    app.get("/posts/:post", showPost);
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

    var parsedPost = {
        content: marked(post.content),
        title: post.title
    };

    res.render('post.html', {
        //locals: {
            //posts: postsModel.entries
        //},
        //partials: {
            //posts: postsModel.entries
        //},
        post: parsedPost
    });

    return;

}



function index(req, res) {

    var posts = [];

    postsModel.entries.forEach(function(post) {
        var parsedPost = {
            path: '/posts/' + post.path,
            excerpt: marked(post.excerpt),
            shortTitle: post.shortTitle
        };
        posts.push(parsedPost);
    });

    res.render('index.html', {
        //locals: {
            //posts: postsModel.entries
        //},
        //partials: {
            //posts: postsModel.entries
        //},
        posts: posts
    });

    return;

}


