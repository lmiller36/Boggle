	function getTimeRemaining(endtime){
		var t = Date.parse(endtime) - Date.parse(new Date());
		var seconds = Math.floor( (t/1000) % 60 );
		var minutes = Math.floor( (t/1000/60) % 60 );
		var hours = Math.floor( (t/(1000*60*60)) % 24 );
		var days = Math.floor( t/(1000*60*60*24) );

		return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		};
	}

	function initializeClock(){
		setClock("00","00","clockdiv_game");
		var timeinterval = setInterval(function(){
			var endtime = document.endtime;
			var t = getTimeRemaining(endtime);

			setClock(t.minutes,t.seconds,"clockdiv_game");

			if(t.total<=0){
				clearInterval(timeinterval);
				endGame();
			}
		},1000);
		document.timeinterval = timeinterval;
	}

	function setClock(minutes,seconds,divId){
		var clock = document.getElementById(divId);

		if(minutes == 0)minutes = "00";
		else if(minutes <= 9)minutes = "0" + minutes;
		if(seconds == 0) seconds = "00";
		else if(seconds <= 9) seconds = "0" + seconds;

		var minutesSpan = clock.querySelector('.minutes');
		var secondsSpan = clock.querySelector('.seconds');
		minutesSpan.innerHTML = minutes;
		secondsSpan.innerHTML = seconds;
	}

	function setClock_setup_multi(minutes,seconds){
		var clock = document.getElementById("");
		if(minutes == 0)minutes = "00";
		else if(minutes <= 9)minutes = "0" + minutes;
		if(seconds == 0) seconds = "00";
		else if(seconds <= 9) seconds = "0" + seconds;

		var minutesSpan = clock.querySelector('.minutes');
		var secondsSpan = clock.querySelector('.seconds');
		minutesSpan.innerHTML = minutes;
		secondsSpan.innerHTML = seconds;
	}