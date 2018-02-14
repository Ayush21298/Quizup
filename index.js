var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var PORT = 8000;
var bodyParser = require('body-parser');
var queno=-1;

var question = [
	{
		id:1,
		question:"Question 1",
		options:["Option 1","Option 2","Option 3","Option 4"],
		correct:1
	},
	{
		id:2,
		question:"Question 2",
		options:["Option 1","Option 2","Option 3","Option 4"],
		correct:2
	},
	{
		id:3,
		question:"Question 3",
		options:["Option 1","Option 2","Option 3","Option 4"],
		correct:3
	},
	{
		id:4,
		question:"Question 4",
		options:["Option 1","Option 2","Option 3","Option 4"],
		correct:4
	}
];

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/public'));

server.listen(PORT);
console.log('Listening at : http://localhost:'+PORT);

app.get('/',function (req,res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/question',function(req,res){
	// console.log('requested question');
	res.json({question:question[queno]});
});

app.post('/auth',function(req,res){
	// console.log("USERNAME: "+req.body.username + " PASSWORD: "+req.body.password);
	if(req.body.username=="admin" && req.body.password=="admin"){
		// console.log("True");
		queno=queno+1;
		// socket.emit('updateQuestion',question[queno]);
		res.json({authentication:true,question:question[queno]});
	}
	else{
		// console.log("False");
		res.json({authentication:false});
	}
});

io.on('connection',function(socket){
	console.log("New Client");
	socket.on('updateQuestion',function(data){
		console.log("Update Question : Question "+data);
		io.sockets.emit('updateQuestion',data);
	});
});