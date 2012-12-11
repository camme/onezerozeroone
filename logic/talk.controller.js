var nunt = require('nunt');
var talkItems = [
    "Hello. ",
    "Hej.", 
    "Thank you for being the *123* vistor of my blog. ", 
    "If you are a machine, please let me know so I can exlude you from my stats.", 
    "By the way, if you let me know where you are, I'll let you know how far we are from eachother.", 
    "You are *1500 km* away from me. ", 
    "Ah, my espresso machine is on right now.", 
    "Ah, the lamps *in our livingroom* are on right now. Cool. ", 
    "My son thinks he is the king because Jupier begins with his first letter, as in Julius.", 
    "Javascript, javascript lalala.", 
    'And now something from my twitter: "lorem ipsum…; ', 
    "I just tweeted my *1454* tweet. ", 
    "Javascript for president.", 
    "I love to develop event driven javascript applications.", 
    "The ultimate wordpress plugin: fortune cookies. a browser cookie telling you your fortune. ", 
]

var currentTalks = talkItems.concat([]);


function runTalk() {

    var randomIndex = Math.round(Math.random() * (currentTalks.length - 1));

    var talk = currentTalks.splice(randomIndex, 1)[0];

    if (typeof talk == 'string') {
        nunt.send("talk.show", {content: talk});
    }
    else {
    }

    if (currentTalks.length == 0) {
        currentTalks = talkItems.concat([]);
    }


}

nunt.on('talk.done', runTalk);
nunt.on(nunt.CONNECTED, runTalk);


