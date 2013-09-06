require(['text!/css/social.css', 'text!/css/1001-webfont.css', 'text!/css/style.css', 'resize', 'talk'], function(socialCss, webfontCss, styleCss) {

    var css = socialCss + webfontCss + styleCss;

    document.querySelector("head").innerHTML = "<style>" + css + "</style>";

    var entries = document.querySelectorAll(".article-holder");

    // Remove the loading info
    document.body.removeChild(document.querySelectorAll(".loading")[0]);

    for(var i = 0, ii = entries.length; i < ii; i++){
        var entry = entries[i];
        entry.addEventListener('click', function() {
            location.href = this.querySelector("h2 a").getAttribute("href");
            return false;
        });
    }

    document.querySelector(".about-link").addEventListener("click", function() {
        var parentDom = document.querySelector(".other-info");
        var current = parentDom.getAttribute("class");
        var aboutIsOn = current.indexOf("about-on") > 0;

        if (aboutIsOn) {
            var newClass = current.replace(" about-on", "");
        }
        else {
            var newClass = current + " about-on";
        }

        parentDom.setAttribute("class", newClass);
    }, false);

    nunt.send(nunt.READY);

});
