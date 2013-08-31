require(['resize', 'talk'], function() {

    var entries = document.querySelectorAll(".article-holder");

    for(var i = 0, ii = entries.length; i < ii; i++){
        var entry = entries[i];
        entry.addEventListener('click', function() {
            location.href = this.querySelector("h2 a").getAttribute("href");
            return false;
        });
    }

    nunt.send(nunt.READY);

});
