const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const fs = require('fs');
const bodyParser = require('body-parser');
const csv = require('csvtojson');

const PORT = process.env.PORT || 8002;
const csvFilePath = 'ignore/question.csv';
const settingFilePath = 'ignore/setting.json';
const userDataFile = 'public/result/user.json';
const userBackupFile = 'public/result/user_bak.json';

var setting={};
var question = [];
var inverseSocketDict = {};
var userData = {};
var QUESNO = -1;
var TIME = new Date();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/public'));


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
    QUESNO = -1;
    setting = JSON.parse(fs.readFileSync(settingFilePath, 'utf8'));
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
function saveUserData(path) {
    var data = JSON.stringify(userData);
    fs.writeFile(path, data, 'utf8', function (err,data){
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
    var ques = JSON.parse(JSON.stringify(question[QUESNO]));
    delete ques["correct"];
    res.json({
        question: ques
    });
});

app.get('/result', function (req, res) {
    saveUserData(userDataFile);
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
    return res.json({
        leaderboard: scoreBoard
    });
});

app.post('/reset',function(req,res){
    saveUserData(userBackupFile);
    if (check_admin_auth(req.credential)) {
        initialize();
        return res.json({message: "QuizUp Successfully Restarted"});
    } else {
        return error(res,401,"Incorrect admin credentials");
    }
})

app.post('/nextQuestion', function (req, res) {
    saveUserData(userDataFile);
    if (!req.body.time) {
        return error(res,400,"Include time field in the request");
    }
    var quesTime = parseInt(req.body.time)
    if(quesTime==NaN) {
        return error(res,400,"time field should be an integer");
    }
    if (check_admin_auth(req.credential)) {
        QUESNO = QUESNO + 1;
        tt = new Date();
        tt.setSeconds(tt.getSeconds() + quesTime);
        TIME = tt;
        if (QUESNO < question.length) {
            return res.json({
                // authentication: true,
                question: question[QUESNO],
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
    if(userData[username].history[QUESNO]) {
        return error(res,409,"Question already attempted");
    }
    if ((new Date) < TIME) {
        correctAns = parseInt(question[QUESNO].correct);
        userData[username].history[QUESNO] = choice;
        if (choice == correctAns) {
            userData[username].score += 10;
            userData[username].points[QUESNO] = 1;
        } else {
            userData[username].points[QUESNO] = 0;
        }
        return res.json({"message": "Question Marked"});
    } else {
        return error(res,403,"Time is up for this question");
    }
});

io.on('connection', function (socket) {
    socket.on('updateQuestion', function (data) {
        console.log("Update Question : Question " + data);
        io.sockets.emit('updateQuestion', data);
    });
    socket.on('updateResult', function () {
        console.log("Update Result");
        io.sockets.emit('updateResult');
    });
    socket.on('disconnect', function () {
        if(socketid in inverseSocketDict)
            userData[inverseSocketDict[socketid]].disconnected = true;
    });
});

initialize();
server.listen(PORT);
console.log('Listening at : http://localhost:' + PORT);