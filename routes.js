//var moments = 
var fs = require('fs');
var indexHtml = fs.readFileSync('public/index.html', 'utf8');

exports.init = function(app) {
    app.get("/", index);
    app.get("/:postName", showPost);
}

function index(req, res) {

  
    var posts = [];
    var indexHtml = fs.readFileSync('public/index.html', 'utf8');

    var startPath = './posts';
    var files = fs.readdirSync(startPath);
    for (var i = 0, ii = files.length; i < ii; i++) {
        var currentFile = startPath + "/" + files[i];

        var fileStat = fs.statSync(currentFile);
        if (!fileStat.isDirectory()) {
            if (currentFile.match(/\.md/)) {
                var postMd = fs.readFileSync(currentFile, 'utf8');
                currentFile = currentFile.replace(startPath, '');
                currentFile = currentFile.replace(/\.md/g, '');
                posts.push({content: postMd, file: currentFile});
            }
        }
    }

    var postMetaList = [];

    posts.forEach(function(post, index) {

        var re = /### meta(|\s)+\n([.\s:,\w\/]*?)\n### end-meta/g;
        var metaResult = re.exec(post.content);
        meta = {};
        if (metaResult && metaResult.length == 3) {
            var metaParts = metaResult[2].split("\n");
            metaParts.forEach(function(metaRow, jindex) {
                var metaData = (/(\w.+):(|\s)+([.\w\s,\/]*)?(\n|$)/gi).exec(metaRow);
                if (metaData.length >= 4) {
                    if (metaData[1] == "tags") {
                        meta[metaData[1]] = metaData[3].split(",").map(function(content) {
                            return content.replace(/^(\s+)/g, '');
                        });
                    }
                    else {
                        meta[metaData[1]] = metaData[3];
                    }
                }
            });
        }

        postMetaList.push({file: post.file, meta: meta});

    });

    var articleTemplate = '';
    articleTemplate += '<a href="{link}" class="article-holder">';
    articleTemplate += '<article style="background: url({media}) no-repeat">';
    articleTemplate += '<div class="date">5th of november 2012</div>';
    articleTemplate += '<h2>{title}</h2>';
    articleTemplate += '<div class="tags">';
    articleTemplate += '<span class="tag">javascript</span>';
    articleTemplate += '<span class="tag">nodejs</span>';
    articleTemplate += '<span class="tag">wordpress</span>';
    articleTemplate += '</div>';
    articleTemplate += '<div class="intro">{intro}</div>';
    articleTemplate += '</article>';
    articleTemplate += '</a>';

    var articlesHtml = '';

    postMetaList.forEach(function(post) {

        var articleHtml = articleTemplate;
        articleHtml = articleHtml.replace("{intro}", post.meta.intro); 
        articleHtml = articleHtml.replace("{media}", post.meta.image); 
        articleHtml = articleHtml.replace("{title}", post.meta.title); 
        articleHtml = articleHtml.replace("{link}", "/" + post.file);
        articlesHtml += articleHtml;

    });


    var re = /<!-- \{main-list\} -->[\w\W]+<!-- \{main-list-end\} -->/g;

    indexHtml = indexHtml.replace(re, articlesHtml);

    res.send(indexHtml);
}

function showPost(req, res) {
    res.send(indexHtml);
}


