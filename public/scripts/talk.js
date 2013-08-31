define(['nunt'], function() {

    var timeoutRef = -1;
    
    nunt.on(nunt.READY, function() {

        nunt.on("talk.show", talkLoaded);

        var container = document.querySelector(".talk");
        var goalContent = "";
        var displayContent = "";
        var displayIndex = 0;

        function talkLoaded(e) {
            showTalk(e.content);
        }

        function showTalk(content) {
            goalContent = content;
            displayContent = "";
            displayIndex = 0;
            nextCharachter();
        }

        function nextCharachter() {

            var next = goalContent[displayIndex];

            if (next) {

                var char = next;
                displayContent += char;

                var parsedContent = displayContent;
                parsedContent = parsedContent.replace(/\*([\w\s\W]+)?\*/gm, "<span class='interesting'>$1</span>");
                parsedContent = parsedContent.replace(/\*([\w\s\W]+)?$/g, "<span class='interesting'>$1</span>");

                container.innerHTML = parsedContent;
            }
            displayIndex++;

            if (displayIndex <= goalContent.length) {

                var delay = 100;

                if (next == " ") {
                    delay = 200;
                }
                else if (next == "\n") {
                    delay = 50;
                }
                else if (next == ".") {
                    delay = 500;
                }

                setTimeout(nextCharachter, delay);
            }
            else {
                clearTimeout(timeoutRef);
                timeoutRef = setTimeout(function(){
                    nunt.send("talk.done");
                }, 5000);
            }

        }


    });

});
