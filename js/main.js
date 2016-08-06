var currentMood;

// Get elements from DOM
var pageheader = $("#page-header")[0];
var pagecontainer = $("#page-container")[0];

// The html DOM object has been casted to a input element (as defined in index.html) as later we want to get specific fields that are only avaliable from an input element object
var imgSelector = $("#my-file-selector")[0];
var refreshbtn = $("#refreshbtn")[0];

// Register button listeners
imgSelector.addEventListener("change", function () {
    pageheader.innerHTML = "Just a sec while we analyse your mood...";
    processImage(function (file) {
        // Get emotions based on image
        sendEmotionRequest(file, function (emotionScores) {
            // Find out most dominant emotion
            currentMood = getCurrMood(emotionScores); //this is where we send out scores to find out the predominant emotion
            changeUI(); //time to update the web app, with their emotion!
            //Done!!
        });
    });
});

refreshbtn.addEventListener("click", function () {
    // TODO: Load random song based on mood
    alert("You clicked the button");
});

function processImage(callback) {
    var file = imgSelector.files[0];
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file); //used to read the contents of the file
    } else {
        console.log("Invalid file");
    }
    reader.onloadend = function () {
        //After loading the file it checks if extension is jpg or png and if it isnt it lets the user know.
        if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            pageheader.innerHTML = "Please upload an image file (jpg or png).";
        } else {
            //if file is photo it sends the file reference back up
            callback(file);
        }
    };
}

function changeUI() {
    //Show detected mood
    pageheader.innerHTML = "Your mood is: " + currentMood.name; //Remember currentMood is a Mood object, which has a name and emoji linked to it.

    //Show mood emoji
    var img = $("#selected-img")[0];
    img.src = currentMood.emoji; //link that area to the emoji of our currentMood.
    img.style.display = "block"; //just some formating of the emoji's location

    //Display song refresh button
    refreshbtn.style.display = "inline";

    //Remove offset at the top
    pagecontainer.style.marginTop = "20px";
}

// Refer to http://stackoverflow.com/questions/35565732/implementing-microsofts-project-oxford-emotion-api-and-file-upload
// and code snippet in emotion API documentation
function sendEmotionRequest(file, callback) {
    $.ajax({
        url: "https://api.projectoxford.ai/emotion/v1.0/recognize",
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "d342c8d19d4e4aafbf64ed9f025aecc8");
        },
        type: "POST",
        data: file,
        processData: false
    }).done(function (data) {
        if (data.length != 0) {
            // Get the emotion scores
            var scores = data[0].scores;
            callback(scores);
        } else {
            pageheader.innerHTML = "Hmm, we can't detect a human face in that photo. Try another?";
        }
    }).fail(function (error) {
        pageheader.innerHTML = "Sorry, something went wrong. :( Try again in a bit?";
        console.log(error.getAllResponseHeaders());
    });
}

// Section of code that handles the mood
//A Mood class which has the mood as a string and its corresponding emoji
var Mood = (function () {
    function Mood(mood, emojiurl) {
        this.mood = mood;
        this.emojiurl = emojiurl;
        this.name = mood;
        this.emoji = emojiurl;
    }
    return Mood;
})();

var happy = new Mood("happy", "http://emojipedia-us.s3.amazonaws.com/cache/a0/38/a038e6d3f342253c5ea3c057fe37b41f.png");
var sad = new Mood("sad", "https://cdn.shopify.com/s/files/1/1061/1924/files/Sad_Face_Emoji.png?9898922749706957214");
var angry = new Mood("angry", "https://cdn.shopify.com/s/files/1/1061/1924/files/Very_Angry_Emoji.png?9898922749706957214");
var neutral = new Mood("neutral", "https://cdn.shopify.com/s/files/1/1061/1924/files/Neutral_Face_Emoji.png?9898922749706957214");

// any type as the scores values is from the project oxford api request (so we dont know the type)
function getCurrMood(scores) {
    // In a practical sense, you would find the max emotion out of all the emotions provided. However we'll do the below just for simplicity's sake :P
    if (scores.happiness > 0.4) {
        currentMood = happy;
    } else if (scores.sadness > 0.4) {
        currentMood = sad;
    } else if (scores.anger > 0.4) {
        currentMood = angry;
    } else {
        currentMood = neutral;
    }
    return currentMood;
}

// Section of code that handles the music and soundcloud
//A Song class which has the song's name and URL on soundcloud
var Song = (function () {
    function Song(songtitle, songurl) {
        this.title = songtitle;
        this.url = songurl;
    }
    return Song;
})();
