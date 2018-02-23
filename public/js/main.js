var socket = io.connect();
var sessionid;

var username;
var user_logged_in=false;

var admin_logged_in=false;
var admin_username,admin_password;

var users={};

socket.on('connect', function(){
    sessionid = socket.id;
})

socket.on('updateQuestion', function(data){
    $.ajax({
        type:"GET",
        url:"/question",
        dataType:"json"
    }).done(function(data){
        $(".options").prop('disabled',false);
        $("#que").html(data.question.question);
        $("#op1").html(data.question.option1);
        $("#op2").html(data.question.option2);
        $("#op3").html(data.question.option3);
        $("#op4").html(data.question.option4);
    });
});

socket.on('updateResult', function(){
    $.ajax({
        type:"GET",
        url:"/result",
        dataType:"json"
    }).done(function(data){
        $(".options").prop('disabled',false);
        // $("#que").html(JSON.stringify(data.scores));
        $("#que").html("");
        $("#op1").html("");
        $("#op2").html("");
        $("#op3").html("");
        $("#op4").html("");
    });
});

$(document).ready(function(){

    $.ajax({
        type:"GET",
        url:"/question",
        dataType:"json"
    }).done(function(data){
        if(data.question!=null){
            $(".options").prop('disabled',false);
            $("#que").html("Question No. "+data.question.id);
            $("#op1").html(data.question.option1);
            $("#op2").html(data.question.option2);
            $("#op3").html(data.question.option3);
            $("#op4").html(data.question.option4);
        }
    });
    
    $(".admin").hide();
    $(".leaderborad").hide();

    if(user_logged_in==false){
        $("#toggle_login").html("Login");
        $(".question").hide();
        $(".login").show();
        $(".logout").hide();
        $(".leaderboard").hide();
        $(".countdown").hide();
    }else{
        $("#toggle_login").html("Logout");
        $(".question").show();
        $(".login").hide();
        $(".logout").hide();
    }

    $("#toggle_admin").click(function(){
        $(".admin").show();
        $(".question").hide();
        $(".login").hide();
        $(".logout").hide();
    })

    // $("#toggle_question").click(function(){
    //     $(".admin").hide();
    //     $(".question").show();
    //     $(".login").hide();
    //     $(".logout").hide();
    // })

    $("#toggle_login").click(function(){
        $(".admin").hide();
        $(".question").hide();
            if(user_logged_in==false){
                $(".login").show();
                $(".logout").hide();
            }else{
                $(".login").hide();
                $(".logout").show();
            }
    })

    $("#log_btn").click(function(){
        user_text = $("#user_text").val();
        passcode = $("#pass_text").val();
        $("#user_text").val("");
        $("#pass_text").val("");
        $.ajax({
            type:"POST",
            url:"/login",
            dataType:"json",
            data:{username:user_text,passcode:passcode,id:sessionid}
        }).done(function(data){
            user_logged_in=true;
            username=user_text;
            $(".login").hide();
            $(".question").show();
            $("#toggle_login").html("Logout");
        }).fail(function(data){
            alert(data.message);
        });
    });

    $("#logout_btn").click(function(){
        user_logged_in=false;
        $(".login").show();
        $(".logout").hide();
        $(".question").hide();
        $("#toggle_login").html("Login");
    });

    $("#op1").click(function(){
        if(user_logged_in==true){
            $.ajax({
                type:"POST",
                url:"/answer",
                dataType:"json",
                data:{choice:1,id:sessionid}
            });
            $('.options').prop('disabled', true);
        }
        else{
            alert("Login To Submit !!!!");
            $(".admin").hide();
            $(".question").hide();
            $(".login").show();
            $(".logout").hide();
        }
    });

    $("#op2").click(function(){
        if(user_logged_in==true){
            $.ajax({
                type:"POST",
                url:"/answer",
                dataType:"json",
                data:{choice:2,id:sessionid}
            });
            $('.options').prop('disabled', true);
        }
        else{
            alert("Login To Submit !!!!");
            $(".admin").hide();
            $(".question").hide();
            $(".login").show();
            $(".logout").hide();
        }
    });

    $("#op3").click(function(){
        if(user_logged_in==true){
            $.ajax({
                type:"POST",
                url:"/answer",
                dataType:"json",
                data:{choice:3,id:sessionid}
            });
            $('.options').prop('disabled', true);
        }
        else{
            alert("Login To Submit !!!!");
            $(".admin").hide();
            $(".question").hide();
            $(".login").show();
            $(".logout").hide();
        }
    });

    $("#op4").click(function(){
        if(user_logged_in==true){
            $.ajax({
                type:"POST",
                url:"/answer",
                dataType:"json",
                data:{choice:4,id:sessionid}
            });
            $('.options').prop('disabled', true);
        }
        else{
            alert("Login To Submit !!!!");
            $(".admin").hide();
            $(".question").hide();
            $(".login").show();
            $(".logout").hide();
        }
    });

    $("#next").click(function(){

        $(".leaderboard").show();
        var time_text = $("#time_text").val();
        if(!admin_logged_in){
            admin_username = prompt("Authentication - Admin Username", "");
            admin_password = prompt("Authentication - Admin Password", "");
        }
        $.ajax({
            type:"POST",
            url:"/nextQuestion",
            dataType:"json",
            data:{credential:{username:admin_username,password:admin_password},time:time_text}
        }).done(function(data){
            admin_logged_in = true;
            if(data.question!=null){
                $("#que").html(data.question.id);
                $("#op1").html(data.question.option1);
                $("#op2").html(data.question.option2);
                $("#op3").html(data.question.option3);
                $("#op4").html(data.question.option4);
                $("#question_text").html(data.question.question);
                $(".countdown").show();
                var countdown_time = time_text
                var distance = (countdown_time*1 + 1) * 1000;
                var x = setInterval(function() {
                    distance = distance - 1000;
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    document.getElementById("timer").innerHTML = seconds + "s "; 
                    if (distance < 0) {
                        clearInterval(x);
                        document.getElementById("timer").innerHTML = "Time Up!!!";
                        $.ajax({
                            type:"POST",
                            url:"/result",
                            dataType:"json"
                        }).done(function (data){
                            $("#leader").empty();
                            for(var i =0 ; i < data.length;i++){
                                var tr = document.createElement("tr");
                                var td_rank = document.createElement("td");                                
                                var td_username = document.createElement("td");
                                var td_score = document.createElement("td");
                                td_rank.append(document.createTextNode(i+1));                                
                                td_username.append(document.createTextNode(data[i].username));
                                td_score.append(document.createTextNode(data[i].score));
                                td_rank.setAttribute("class","td1");
                                td_username.setAttribute("class","td2");
                                td_score.setAttribute("class","td3");                                
                                tr.append(td_rank);
                                tr.append(td_username);
                                tr.append(td_score);
                                $("#leader").append(tr);
                            }
                        });
                    }
                }, 1000);
                socket.emit('updateQuestion',data.question.id);
            } else {
                socket.emit('updateResult');
            }
        }).fail(function(data){
            alert(data.message)
            $("#check_text").html(data.message);
        });
    });

});

var TxtType = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
};

TxtType.prototype.tick = function() {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

        var that = this;
        var delta = 200 - Math.random() * 100;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
        }

        setTimeout(function() {
        that.tick();
        }, delta);
};

window.onload = function() {
        var elements = document.getElementsByClassName('typewrite');
        for (var i=0; i<elements.length; i++) {
            var toRotate = elements[i].getAttribute('data-type');
            var period = elements[i].getAttribute('data-period');
            if (toRotate) {
              new TxtType(elements[i], JSON.parse(toRotate), period);
            }
        }
        // INJECT CSS
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
        document.body.appendChild(css);
};