const path = require('path');
const { checkServerIdentity } = require("tls");

const https = require("https");
const io = require("socket.io");
const fs = require("fs");

var domain = "dobbergps";
var certDir = "C:\\Certbot\\live\\"+domain+"\\";

var options = {
  key: fs.readFileSync(certDir+"privkey.pem"),
  cert: fs.readFileSync(certDir+"fullchain.pem")
  };

var https_server = https.createServer(options)
socket_listener = io.listen(https_server);
https_server.listen(3000);

socket_listener.sockets.on("connection", function(socket) {
  console.log("user connected: " + socket.request.connection.remoteAddress);
});

var dataDir = ".\\data\\";
fs.watch(dataDir,"utf8",handleDataChange);

function handleDataChange(event, trigger)
{
  if(event != "change")
  {
    console.log("Skipped file event: " + event + " : " + trigger);
    return;
  }
  console.log(event+" : "+trigger);
  if(!fs.existsSync(dataDir+"\\"+trigger))
  {
    console.log("Skipped file event: " + event + " : " + trigger);
    console.log(dataDir+"\\"+trigger + " does not exist.");
    return;
  }
  var fileData = fs.readFileSync(dataDir+"\\"+trigger);
  try {
    var jsonData = JSON.parse(fileData);  
  }
  catch (e) 
  {
    console.error(e);
    return;
  }
  
  var fileName = path.basename(trigger,".txt");
  jsonData.key = fileName;
  socket_listener.sockets.emit('server_message', jsonData);
}