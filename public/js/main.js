var socket = io.connect("http://localhost:8002");
var username;
var user_auth=false;
var logged_in=false;
var auth_post=false;

socket.on('updateQuestion', function(data){
    // alert(JSON.stringify(data));
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
    // alert(JSON.stringify(data));
    // alert("yo");
    $.ajax({
        type:"GET",
        url:"/result",
        dataType:"json"
    }).done(function(data){
        $(".options").prop('disabled',false);
        $("#que").html(JSON.stringify(data.scores));
        $("#op1").html("");
        $("#op2").html("");
        $("#op3").html("");
        $("#op4").html("");
        alert(JSON.stringify(data.scores));
    });
});

$(document).ready(function(){
    console.log("Working");

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
    
    // $(".intro").hide();

    $(".admin").hide();

    if(user_auth==false){
        $("#toggle_login").html("Login");
        $(".question").hide();
        $(".login").show();
        $(".logout").hide();
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

    $("#toggle_question").click(function(){
        $(".admin").hide();
        $(".question").show();
        $(".login").hide();
        $(".logout").hide();
    })

    $("#toggle_login").click(function(){
        $(".admin").hide();
        $(".question").hide();
            if(user_auth==false){
                $(".login").show();
                $(".logout").hide();
            }else{
                $(".login").hide();
                $(".logout").show();
            }
    })

    $("#log_btn").click(function(){
        // alert("ayush");
        user_text = $("#user_text").val();
        pass_text = $("#pass_text").val();
        $("#user_text").val("");
        $("#pass_text").val("");
        $.ajax({
            type:"POST",
            url:"/user_auth",
            dataType:"json",
            data:{user_text:user_text,pass_text:pass_text}
        }).done(function(data){
            // alert(JSON.stringify(data));
            if(data.user_auth==true){
                user_auth=true;
                username=data.username;
                $(".login").hide();
                $(".question").show();
                $("#toggle_login").html("Logout");
            } else {
                alert("Wrong username or password")
            }
        });
    });

    $("#logout_btn").click(function(){
        user_auth=false;
        $(".login").show();
        $(".logout").hide();
        $(".question").hide();
        $("#toggle_login").html("Login");
    });

    $("#op1").click(function(){
        if(user_auth==true){
            $.ajax({
                type:"POST",
                url:"/answer",
                dataType:"json",
                data:{username:username,choice:1}
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
        if(user_auth==true){
            $.ajax({
                type:"POST",
                url:"/answer",
                dataType:"json",
                data:{username:username,choice:2}
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
        if(user_auth==true){
            $.ajax({
                type:"POST",
                url:"/answer",
                dataType:"json",
                data:{username:username,choice:3}
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
        if(user_auth==true){
            $.ajax({
                type:"POST",
                url:"/answer",
                dataType:"json",
                data:{username:username,choice:4}
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
        if(!logged_in){
            logged_in = true;
            var username = prompt("Authentication - Username", "admin");
            var password = prompt("Authentication - Password", "admin");
            time_text = $("#time_text").val();
            time = time_text;
            auth_post = true;    
        }
        if(auth_post){
            $.ajax({
                type:"POST",
                url:"/auth",
                dataType:"json",
                data:{username:username,password:password,time:time}
            }).done(function(data){
                // console.log(data.authentication);
                if(data.authentication){
                    $("#check_text").html("Hello, Admin");
                    // console.log(JSON.stringify(data));
                    if(data.question.id!=null){
                        $("#que").html(data.question.question);
                        $("#op1").html(data.question.option1);
                        $("#op2").html(data.question.option2);
                        $("#op3").html(data.question.option3);
                        $("#op4").html(data.question.option4);
                        $("#question_text").html("Question updated to no. "+data.question.id);
                        socket.emit('updateQuestion',data.question.id);
                    } else {
                        socket.emit('updateResult');
                    }
                }
                else{
                    $("#check_text").html("Invalid Credentials!!!!");
                }
            });
            $.ajax({
                type:"POST",
                url:"/result",
                dataType:"json"
            }).done(function (data){
                // console.log(JSON.stringify(data));
                $("#leader").empty();
                for (var i in data.scores) {
                    var player = data.scores[i];
                    var player_score = 0;
                    for(var ques in player) {
                        player_score += player[ques];
                    }
                    console.log(i+" "+player_score);
                    var tr = document.createElement("tr");
                    var td1 = document.createElement("td");
                    var td2 = document.createElement("td");
                    td1.append(document.createTextNode(i));
                    td2.append(document.createTextNode(player_score));
                    td1.setAttribute("class","td1");
                    td2.setAttribute("class","td2");
                    tr.append(td1);
                    tr.append(td2);
                    $("#leader").append(tr);
                }
            });
        }
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