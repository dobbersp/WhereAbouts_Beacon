const path = require('path');
const https = require("https");
const io = require("socket.io");
const fs = require("fs");

var certDir = "./certs/";
var dataDir = "./data/";

var markers = loadDataFileContents("markers.txt");
var routes = loadDataFileContents("routes.txt");

var options = {
  key: fs.readFileSync(certDir+"privkey.pem"),
  cert: fs.readFileSync(certDir+"fullchain.pem")
};

var https_server = https.createServer(options);
socket_listener = io.listen(https_server);
https_server.listen(3000);
console.log("Starting https server on port 3000.");

socket_listener.sockets.on("connection", function(client) {
  console.log("user connected: " + client.request.connection.remoteAddress);
  //send current state only to the client connecting (not broadcast to all connected clients.)
  if(markers != -1)
    client.emit("markers",markers);
  if(routes != -1)
    client.emit("routes",routes);
});

function loadDataFileContents(filename)
{
  if(!fs.existsSync(dataDir+"/"+filename))
  {
    console.log(filename+ " does not exist.");
    return -1;
  }
  
  var fileData = fs.readFileSync(dataDir+"/"+filename);
  try {
    var jsonData = JSON.parse(fileData);  
  }
  catch (e) 
  {
    console.error(e);
    return -1;
  }
  return jsonData;
}

fs.watch(dataDir,"utf8",handleDataChange);

function handleDataChange(event, trigger)
{
  if(event != "change" && event != "rename")
  {
    console.log("Skipped file event: " + event + " : " + trigger);
    return;
  }
  if(trigger.endsWith(".temp"))
  {
    console.log("Skipping change to temp file: " + trigger);
    return;
  }
  console.log("Handling event: " + event + " for " + trigger);  

  var fileName = path.basename(trigger);
  var messageType = path.basename(trigger,path.extname(trigger)); //message type is just the filename with no file extension.
  console.log("Loading file: " + fileName + " with messageType of: " + messageType);
  data = loadDataFileContents(fileName);
  if(data != -1)
  {
    if(messageType == "markers")
      markers = data;
    else if(messageType == "routes")
      routes = data;
    else
      return; //bad filename, don't send a message.
    console.log("Emitting update " + messageType + " : " + data);
    socket_listener.sockets.emit(messageType, data); //broadcast update to all clients.
  }   
}
