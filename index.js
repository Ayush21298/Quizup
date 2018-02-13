var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var PORT = 8000;
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/public'));

server.listen(PORT);
console.log('Listening at : http://localhost:'+PORT);

app.get('/',function (req,res) {
	res.sendFile(__dirname + '/index.html');
})

app.post('/auth',function(req,res){
	// console.log("USERNAME: "+req.body.username + " PASSWORD: "+req.body.password);
	if(req.body.username=="admin" && req.body.password=="admin"){
		// console.log("True");
		res.json({authentication:true});
	}
	else{
		// console.log("False");
		res.json({authentication:false});
	}
})