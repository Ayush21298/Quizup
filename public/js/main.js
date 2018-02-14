var socket = io.connect("http://localhost:8000");
var username;
var user_auth=false;

socket.on('updateQuestion', function(data){
    alert(JSON.stringify(data));
});

$(document).ready(function(){
    console.log("Working");

    $.ajax({
        type:"GET",
        url:"/question",
        dataType:"json"
    }).done(function(data){
        $("#que").html(data.question.question);
        $("#op1").html(data.question.options[0]);
        $("#op2").html(data.question.options[1]);
        $("#op3").html(data.question.options[2]);
        $("#op4").html(data.question.options[3]);
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

    $("#next").click(function(){
        var username = prompt("Authentication - Username", "admin");
        var password = prompt("Authentication - Password", "admin");
        $.ajax({
            type:"POST",
            url:"/auth",
            dataType:"json",
            data:{username:username,password:password}
        }).done(function(data){
            // console.log(data.authentication);
            if(data.authentication){
                $("#check_text").html("Hello, Admin");
                console.log(JSON.stringify(data));
                $("#que").html(data.question.question);
                $("#op1").html(data.question.options[0]);
                $("#op2").html(data.question.options[1]);
                $("#op3").html(data.question.options[2]);
                $("#op4").html(data.question.options[3]);
            }
            else{
                $("#check_text").html("FuCk oFf !!!!");
            }
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