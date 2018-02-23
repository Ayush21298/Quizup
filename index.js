var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var PORT = process.env.PORT || 8002;
var bodyParser = require('body-parser');
var queno = -1;
var userData = {};
var inverseSocketDict = {};
var question = [];
var sockets = [];
var TIME = new Date();

const csvFilePath = 'ignore/question.csv';
const adminFilePath = 'ignore/admin.json';
const userDataFile = 'public/result.json';

var setting;
const csv = require('csvtojson');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/public'));

server.listen(PORT);
console.log('Listening at : http://localhost:' + PORT);

function error(res, statusCode, msg) {
    res.status(statusCode).json({
        error: true,
        message: msg,
    })
}

function initialize() {
    csv()
        .fromFile(csvFilePath)
        .on('json', (jsonObj) => {
            console.log("Json: ", jsonObj);
            question.push(jsonObj);
        })
        .on('done', (error) => {
            console.log(error);
        });
    users = [];
    userData = [];
    question = [];
    sockets = [];
    TIME = new Date();
    queno = -1;
    setting = JSON.parse(fs.readFileSync(adminFilePath, 'utf8'));
}

function check_user_auth(passCode) {
    if(!passCode || passCode != setting.passCode) {
        return false;
    }
    return true;
}
function check_admin_auth(credential) {
    if (!credential || !credential.username || !credential.password) {
        return false;
    }
    if (credential.username in setting.admin && setting.admin[credential.username] == credential.password) {
        return true;
    }
    return false;
}

function saveUserData() {
    var data = JSON.stringify(userData);
    fs.writeFile(userDataFile, data, 'utf8', function (err,data){
        if(err)
            console.log("Err: ",err);
        else
            console.log("Write done!");
    });
}

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/question', function (req, res) {
    var ques = JSON.parse(JSON.stringify(question[queno]));
    delete ques["correct"];
    res.json({
        question: ques
    });
});

app.get('/result', function (req, res) {
    saveUserData();
    var scoreBoard = [];
    for(var username in userData) {
        scoreBoard.push({score: userData[username].score,username: userData[username].username});
    }
    scoreBoard.sort(function(a,b){
        if(a.score < b.score) return -1;
        else if(a.score > b.score) return 1;
        else if (a.username < b.username) return -1;
        else if (a.username > b.username) return 1;
        else return 0;
    });
    res.json({
        leaderboard: scoreBoard
    });
});


app.post('/nextQuestion', function (req, res) {
    saveUserData();
    if (!req.body.time) {
        return error(res,400,"Include time field in the request");
    }
    var quesTime = parseInt(req.body.time)
    if(quesTime==NaN) {
        return error(res,400,"time field should be an integer");
    }
    if (check_admin_auth(req.credential)) {
        queno = queno + 1;
        tt = new Date();
        tt.setSeconds(tt.getSeconds() + quesTime);
        TIME = tt;
        if (queno < question.length) {
            return res.json({
                // authentication: true,
                question: question[queno],
                // time: req.body.time
            });
        } else {
            return res.json({
                message: "End of Questions!",
                // authentication: true,
                question: {}
            });
        }
    } else {
        return error(res,401,"Incorrect admin credentials");
        // return res.json({
        //     authentication: false
        // });
    }
});

app.post('/login', function (req, res) {
    if (!req.body.username) {
        return error(req,400,"username field not set");
    }
    if (!req.body.passcode) {
        return error(req,400,"passcode field not set");
    }
    if (!req.body.id) {
        return error(req,400,"socket id not given");
    }
    if (check_user_auth(req.passcode)) {
        var username = req.body.username;
        if(!(username in userData)) {
            userData[username]={"disconnected":false,"history":{},"points":{},"score":0,"id":req.body.id};
            inverseSocketDict[req.body.id]=username;
            return res.json({
                "message": "User Created",
                "data": {
                    "score": userData[username].score,
                    "history": userData[username].history,
                    "points":  userData[username].points
                }
            });
        } else if (userData[username].disconnected) {
            userData[username].disconnected = false;
            userData.id = req.body.id;
            inverseSocketDict[req.body.id]=username;
            return res.json({
                "message": "User Reconnected",
                "data": {
                    "score": userData[username].score,
                    "history": userData[username].history,
                    "points":  userData[username].points
                }
            });
        } else {
            return error(res,403,"Username already taken");
            // return res.json({
            //     user_auth: false,
            //     username: req.body.username
            // });
        }
    } else {
        return error(res,401,"Wrong Pass Code");
        // res.json({
        //     user_auth: false,
        //     username: req.body.username
        // });
    }
});

app.post('/answer', function (req, res) {
    var choice,socketid;
    if(!req.body.id) {
        return error(res,400,"Socket Id not given");
    }
    if(!req.body.choice) {
        return error(res,400,"Choice not provided");
    }
    choice = parseInt(req.body.choice);
    socketid = req.body.id;

    if(!(socketid in inverseSocketDict) || userData[inverseSocketDict[socketid]].disconnected) {
        return error(res,403,"Socket id invalid or user has disconnected");
    }
    if(choice==NaN) {
        return error(res,400,"Choice should be an integer");
    }

    username = userData[inverseSocketDict[socketid]];
    if(userData[username].history[queno]) {
        return error(res,409,"Question already attempted");
    }
    if ((new Date) < TIME) {

        correctAns = parseInt(question[queno].correct);
        userData[username].history[queno] = choice;
        if (choice == correctAns) {
            userData[username].score += 10;
            userData[username].points[queno] = 1;
        } else {
            userData[username].points[queno] = 0;
        }
        return res.json({"message": "Question Marked"});
    } else {
        return error(res,403,"Time is up for this question");
    }
});

io.on('connection', function (socket) {
    sockets.push(socket.id);
    console.log(sockets);
    socket.on('updateQuestion', function (data) {
        console.log("Update Question : Question " + data);
        io.sockets.emit('updateQuestion', data);
    });
    socket.on('updateResult', function () {
        console.log("Update Result");
        io.sockets.emit('updateResult');
    });
    socket.on('disconnect', function () {
        var i = sockets.indexOf(socket.id);
        sockets.splice(i, 1);
    });
});