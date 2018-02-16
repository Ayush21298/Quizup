var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var PORT = 8000;
var bodyParser = require('body-parser');
var queno=-1;
var users=[];
var scores={};
var question;

const csvFilePath='public/csv/a.csv';
const csv=require('csvtojson');
csv()
.fromFile(csvFilePath)
.on('json',(jsonObj)=>{
    // console.log(JSON.stringify(jsonObj));
    question=jsonObj;
})
.on('done',(error)=>{
    console.log('end')
})

var question1 = [
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

app.post('/user_auth',function(req,res){
	// console.log(JSON.stringify(req.body));
	if(req.body.pass_text=="admin"){
		// console.log(req.body.user_text);
		// console.log(users);
		// console.log(users.indexOf(req.body.user_text));
		var user_text = req.body.user_text;
		if(users.indexOf(user_text)==-1){
			users.push(user_text);
			scores[user_text]=0;
			// console.log(JSON.stringify(scores));
		}
		res.json({user_auth:true,username:req.body.user_text});
	} else {
		res.json({user_auth:false,username:req.body.user_text});
	}
});

app.post('/answer',function(req,res){
	username=req.body.username;
	choice=req.body.choice;
	correct=question[queno].correct;
	// console.log(queno);
	if(choice==correct){
		// console.log("Correct");
		// console.log(scores);
		scores[username]+=1;
		console.log(JSON.stringify(scores));
		// console.log(scores[username]);
	}else{
		// console.log("Incorrect");
		console.log(JSON.stringify(scores));
	}
});

io.on('connection',function(socket){
	// console.log("New Client");
	socket.on('updateQuestion',function(data){
		console.log("Update Question : Question "+data);
		io.sockets.emit('updateQuestion',data);
	});
});