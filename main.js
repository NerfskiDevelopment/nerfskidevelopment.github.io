const socket = new WebSocket('wss://server.ghoulvalley.com:4505');

var prompts = [
    '',
    '',
    ''
]

var responses = []

socket.onopen = function(event) {
  // Handle connection open
  console.log("opened");
  //making it so we can connect
  document.getElementById('loading').style.display = "none";
  document.getElementById('join').style.display = "block";
};

socket.onmessage = function(event) {
  // Handle received message
  console.log(event.data);

  //getting json
  var data = JSON.parse(event.data);
  //getting message data
  var type = data['type'];
  var messages = data['messages'];

  //checking the type of message
  if(type == 'error'){
    document.getElementById("errorText").innerHTML = messages[0];
    //alert(messages[0]);
   }
   //joined room successfully
    else if(type == 'connected'){
        document.getElementById('join').style.display = "none";
        document.getElementById('connected').style.display = "block";
        
        document.getElementById('codeInput').value = "";
    }
    //game starting
    else if(type == 'starting'){
        document.getElementById('connected').style.display = "none";
        document.getElementById('pick').style.display = "none";
        document.getElementById('starting').style.display = "block";
    }
    //pick -> pick a prompt 1-3
    else if(type == 'pick'){
        document.getElementById('starting').style.display = "none";
        document.getElementById('pick').style.display = "block";

        prompts[0] = messages[0];
        prompts[1] = messages[1];
        prompts[2] = messages[2];

        //change buttons
        document.getElementById('pick1').innerHTML = prompts[0];
        document.getElementById('pick2').innerHTML = prompts[1];
        document.getElementById('pick3').innerHTML = prompts[2];
    }
    //type in a message from a prompt
    else if(type == 'prompt'){
        document.getElementById('prompt').style.display = "block";
        document.getElementById('starting').style.display = "none";

        prompts[0] = messages[0];

        //changing UI
        document.getElementById('promptHere').innerHTML = prompts[0];
    }
    //host left room or room is closed
    else if(type == 'disconnected'){
        document.getElementById('join').style.display = "block";

        document.getElementById('starting').style.display = "none";
        document.getElementById('pick').style.display = "none";
        document.getElementById('connected').style.display = "none";
    }
    //vote on the best answer
    else if(type == 'vote'){
        document.getElementById('starting').style.display = "none";
        document.getElementById('vote').style.display = "block";
        
        //clearing the listing
        document.getElementById("voteListing").innerHTML = "";
        responses = messages;

        //getting each answer
        for(var i = 0; i < messages.length; i++){
            var prefab = '<button class="border" onclick="voteAnswer(' + i + ');">' + messages[i] + '</button>';
            document.getElementById("voteListing").innerHTML += prefab;
            document.getElementById("voteListing").innerHTML += "<br><br>";

        }
    }
};

socket.onclose = function(event) {
  // Handle connection close
  console.log("closed");
};


function sendMessage(_type, _messages) {
  var msg = {
    type: _type,
    messages: _messages
  }
  socket.send(JSON.stringify(msg));
}


function choosePrompt(_id){
    sendMessage("choosePrompt", [prompts[_id], ""]);

    document.getElementById('starting').style.display = "block";
    document.getElementById('pick').style.display = "none";
}

function voteAnswer(_id){
    sendMessage("voteAnswer", [responses[_id], ""]);


    document.getElementById('starting').style.display = "block";
    document.getElementById('vote').style.display = "none";

}

function submitPrompt(){
    sendMessage("submitPrompt", [prompts[0], document.getElementById('promptInput').value]);

    document.getElementById('starting').style.display = "block";
    document.getElementById('prompt').style.display = "none";

    //resetting
    document.getElementById('promptInput').value = "";
}


//action buttons
function joinGame(){
    var game_id = document.getElementById('codeInput').value.toUpperCase();
    var name = document.getElementById('nameInput').value;

    sendMessage("connect", [game_id, name]);
}


//called when the window is loaded
window.addEventListener("load", (event) => {
    document.getElementById('loading').style.display = "block";
});