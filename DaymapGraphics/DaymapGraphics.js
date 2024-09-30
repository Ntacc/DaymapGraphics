/*

	DaymapGraphics.js 
	Copyright (C) 2022  apate98

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/





// Changelog
// 6.0.0: Added changelog and introduced compatibility for Daymap's timetable view.
// 6.0.1: Fixed a problem where opacity is reversed in timetable view.
// 6.0.2: Changed the manual background change to apply to underlay rather than body. Increased speed of underlay rainbow.
// 6.0.3: Allowed manual changing of the attendance indicator colour to anything, replacing the old background-color with background.
// 6.1.0: Allows blurring behind the foreground cards, giving a glassy effect.
// 6.1.1: Made header also change opacity and made logo transparent.
// 7.0.0: Removed all jQuery usage to enable compatibility with new Daymap. Also basically rewrote a bunch of code to work with new Daymap.
// 7.0.1: Fixed an issue to do with timetable view transparency. Also made transparent cards match with dark mode or light mode.
// 7.0.2: Fixed transparency... again. This time for feed view.
// 7.1.0: Made the header less obtrusive and made dark mode work properly.
// 7.2.0: Added option to revert to original layout.
// 7.2.1: Fixed a major bug which would cause Daymap to not load properly.
// 7.2.2: Removed auto background option as it confused many new users. Background will now load regardless of checking the box. Also accounted for school removing messages.
// 7.2.3: Fixed a major bug that would cause the menus to not work properly some of the time. Also fixed the dark mode cookie expiring after the session.
// 7.3.0: Storing settings in synced storage rather than local storage, and added help on where to find instructions, added comments in code and fixed a minor issue in timetable view. Also fixed evil mode and made a new icon!
// 7.3.1: Fixed evil mode again, and fixed a very old bug with evil mode.
// 7.4.0: Removed all localStorage-related code.
// 7.5.0: Introduced compatibility for all Daymap pages, changed rainbows to a constructor so that all indicators can be rainbow, added custom profile pictures, fixed the post ticker, fixed changing message pages, changed dark mode cookie path, and a few cool graphical and performance improvements.
// 7.5.1: Fixed a bug with the rainbow (BUG CAPTURED: Rainbowix Lagginexia. Description: Rainbow no appear)
// 7.5.2: Added the custom profile picture to the top right corner icon in the original layout.
// 7.6.0: Moved settings to extension popup, removed top menu code due to the upcoming Daymap update that removes the top menu, fixed bug that led to the slow blur backdrop filter being applied even when unnecessary.

// Credits and thanks:
// Special thanks to Kelvin for troubleshooting many issues when transferring to the new Daymap, whom without I could not have solved any of the problems.
// Also special thanks to Nugget (aka Tuesday) (aka actually a lot of different names) for coming up with the idea of, and designing the bug book.
// And to everyone who helped promote this extension, thank you very much for all of your support!

// TODO:
// Presets
// Fix calendar opacity

// I've tried to implement modules to make the code easier to read, and it would be possible, but it's just incredibly difficult to do in an extension. I don't foresee doing so any time soon.




// CHECKLIST BEFORE PUSHING UPDATE
// Change changelog
// Change version and changes variables
// Change manifest.json version
// Check popup.html










var version = "7.6";
//var changes = "Daymap Graphics 7.6.0: Daymap Graphics now has a minigame! Find some bugs and collect them in the bug book! (special thanks to [someone] for coming up with the idea and drawing the bugs!)";
var changes = "Daymap Graphics 7.6.0: Moved the settings to the extension popup (most likely the top right corner of your browser). Also fixed a major bug that was making Daymap really slow.";

// Set item in storage
var setItem = (key, value) => {
	chrome.storage.sync.set(JSON.parse(`{"${key}": "${value}"}`));
};

// Constrain function from Processing
constrain = (num, min, max) => {
	return num < min ? min : num > max ? max : num;
}

var lessonStart, lessonEnd, date, classEls = [], i, anything = [], r50d = [], dark, translucentness;

// Get time described by the diary.
function timeOfDiaryEl (lessonEl) {
	if(lessonEl.innerText.substr(1, 1) === ":" && lessonEl.innerText.substr(12, 1) !== ":") {
		lessonStart = lessonEl.innerText.substr(0, 1) + lessonEl.innerText.substr(2, 2);
		lessonEnd = lessonEl.innerText.substr(11, 2) + lessonEl.innerText.substr(14, 2);
		if(lessonEl.innerText.substr(5, 1) === "P") {
			lessonStart = Number(lessonStart) + 1200;
		}
	}
	if(lessonEl.innerText.substr(1, 1) === ":" && lessonEl.innerText.substr(12, 1) === ":") {
		lessonStart = lessonEl.innerText.substr(0, 1) + lessonEl.innerText.substr(2, 2);
		lessonEnd = lessonEl.innerText.substr(11, 1) + lessonEl.innerText.substr(13, 2);
		if(lessonEl.innerText.substr(5, 1) === "P") {
			lessonStart = Number(lessonStart) + 1200;
		}
		if(lessonEl.innerText.substr(16, 1) === "P") {
			lessonEnd = Number(lessonEnd) + 1200;
		}
	}
	if(lessonEl.innerText.substr(1, 1) !== ":" && lessonEl.innerText.substr(13, 1) !== ":") {
		lessonStart = lessonEl.innerText.substr(0, 2) + lessonEl.innerText.substr(3, 2);
		lessonEnd = lessonEl.innerText.substr(12, 2) + lessonEl.innerText.substr(15, 2);
	}
	if(lessonEl.innerText.substr(1, 1) !== ":" && lessonEl.innerText.substr(13, 1) === ":") {
		lessonStart = lessonEl.innerText.substr(0, 2) + lessonEl.innerText.substr(3, 2);
		lessonEnd = lessonEl.innerText.substr(12, 1) + lessonEl.innerText.substr(14, 2);
		if(lessonEl.innerText.substr(17, 1) === "P") {
			lessonEnd = Number(lessonEnd) + 1200;
		}
	}
	return [lessonStart, lessonEnd];
}

// Rainbow constructor
function rainbow(el, speed, on) {
	this.el = el;
	this.speed = speed;
	this.data = [];
	this.on = on;
	for(let i = 0; i < 3; i++) {
		this.data[i] = [Math.random() * 400, Math.random() * 400, Math.random() / 2 + 0.25, Math.random() / 2 + 0.25]; // Colour, colour, direction, direction
	}
	this.move = (num) => {
		this.data[num][0] += (Math.random() - this.data[num][2]) * this.speed;
		this.data[num][1] += (Math.random() - this.data[num][3]) * this.speed;
		this.data[num][0] = this.data[num][0] < 0 ? 0 : this.data[num][0] > 410 ? 410 : this.data[num][0];
		this.data[num][1] = this.data[num][1] < 0 ? 0 : this.data[num][1] > 410 ? 410 : this.data[num][1];
	};
	this.update = () => { // In case you were confused about those huge lines in the previous versions, this is sort of what they look like individually
		if(this.on) {
			this.move(0);
			this.move(1);
			this.move(2);
			let grad = "linear-gradient(";
			grad += this.data[0][0] + "deg";
			grad += ", rgb(" + (this.data[0][0]) + "," + ((400 - this.data[0][0] + this.data[0][1]) / 2.5) + "," + (400-this.data[0][1]) + ") -75%";
			grad += ", rgb(" + (this.data[1][0]) + "," + ((400 - this.data[1][0] + this.data[1][1]) / 2.5) + "," + (400-this.data[1][1]) + ") 50%";
			grad += ", rgb(" + (this.data[2][0]) + "," + ((400 - this.data[2][0] + this.data[2][1]) / 2.5) + "," + (400-this.data[2][1]) + ") 175%";
			grad += ")";
			this.el.style.backgroundImage = grad;
		}
	};
	this.changeDirection = () => {
		for(let i = 0; i < 3; i++) {
			this.data[i][2] = Math.random() / 2 + 0.25;
			this.data[i][3] = Math.random() / 2 + 0.25;
		}
	}
};

// Probably bad practice but this was the only way I could find to get the storage and use it without .then every time or making the entire code asynchronous (which would break the code).
(async () => {
	return JSON.stringify(await chrome.storage.sync.get());
})()
	.then(storage => {
		'use strict';
		// Defining function to get item from storage.
		let getItem = (key) => {
			let something = storage.substr(storage.indexOf(key + "\":\"") + (key + "\":\"").length);
			something = something.substr(0, something.indexOf("\",\"") != -1 ? something.indexOf("\",\"") : something.indexOf("\"}"));
			return something;
		};
		
		// The instructions to find the guide from version 7.3.0
		if(getItem("used") != "1") {
			document.querySelector("head").appendChild((() => {let something = document.createElement("style"); something.innerHTML = `
				#guide {
					top: 30vh;
					left: 40vw;
					background: linear-gradient(to bottom right, azure, floralwhite, snow, ghostwhite, ivory);
					position: fixed;
					width: 20vw;
					height: 17vh;
					padding: 2.5vh;
					color: #1A1C1E;
					font-size: 2vh;
					text-align: center;
				}
				#closeGuide {
					float: right;
					color: rgb(200, 200, 200);
					font-size: 1.25vw;
					cursor: pointer;
					background-color: rgba(255, 255, 255, 0.6);
					border-radius: 50%;
					width: 1.5vw;
					height: 1.5vw;
					text-align: center;
					vertical-align: baseline;
					line-height: 1.4vw;
				}
			`; return something;})());
			document.querySelector(".main-layout").appendChild((() => {let something = document.createElement("div"); something.innerHTML = `
				<div id='closeGuide' onclick='document.querySelector("#guide").style.display="none";'>×</div>
				<span id='instructions'>Click on the extensions icon in the top right of your browser and then click on the Daymap Graphics icon for a guide!</span>
			`; something.setAttribute("id", "guide"); return something;})());
			setItem("used", 1)
		}
		// Changelog on new version
		if(getItem("version") != version && getItem("used")) {
			console.log(getItem("version"));
			document.querySelector("head").appendChild((() => {let something = document.createElement("style"); something.innerHTML = `
				#guide {
					top: 30vh;
					left: 40vw;
					background: linear-gradient(to bottom right, azure, floralwhite, snow, ghostwhite, ivory);
					position: fixed;
					width: 20vw;
					height: 18.9vh;
					padding: 2.5vh;
					color: #1A1C1E;
					font-size: 2vh;
					text-align: center;
				}
				#closeGuide {
					float: right;
					color: rgb(200, 200, 200);
					font-size: 1.25vw;
					cursor: pointer;
					background-color: rgba(255, 255, 255, 0.6);
					border-radius: 50%;
					width: 1.5vw;
					height: 1.5vw;
					text-align: center;
					vertical-align: baseline;
					line-height: 1.4vw;
				}
			`; return something;})());
			document.querySelector(".main-layout").appendChild((() => {let something = document.createElement("div"); something.innerHTML = `
				<div id='closeGuide' onclick='document.querySelector("#guide").style.display="none";'>×</div>
				<span id='instructions'>` + changes + `</span>
			`; something.setAttribute("id", "guide"); return something;})());
			setItem("version", "7.6")
		}
		
		document.querySelector("body").style.fontFamily='Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif'; // Just makes Daymap look better
		
		// Easter eggs :D
		let bodyUnderlay = document.createElement("div");
		bodyUnderlay.setAttribute("id", "bodyUnderlay");
		document.querySelector("head").innerHTML += "<style>#bodyUnderlay {position: fixed; width: 100%; height: 100%; top: 0; z-index: -2147483647;}</style>";
		document.querySelector("body").appendChild(bodyUnderlay);
		//let shosty = "https://cdn.discordapp.com/attachments/1162609296362704907/1216998409823850567/shostakovich.png?ex=66026d17&is=65eff817&hm=bb4cb284c14fe5ca2b91a3c5f43982c669b0c100929e135ef361f0f077b68487&";
		if(getItem("bodyBackground") != "" && getItem("bodyBackground") != undefined) {
			if(getItem("bodyBackground") === "surprise me") {
				let backgrounds = [
					"url('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg') 0 0 / contain no-repeat",
					"linear-gradient(to bottom right, yellow, black, black, black)",
					"url('https://www.nasa.gov/sites/default/files/thumbnails/image/main_image_star-forming_region_carina_nircam_final-5mb.jpg') 0 0 / cover"
				];
				document.querySelector("#bodyUnderlay").style.background = backgrounds[Math.floor(Math.random() * 3)];
			} else {
				document.querySelector("#bodyUnderlay").style.background=getItem("bodyBackground");
			}
			if(getComputedStyle(document.querySelector("#bodyUnderlay")).backgroundImage === "linear-gradient(to right bottom, rgb(255, 255, 0), rgb(0, 0, 0), rgb(0, 0, 0), rgb(0, 0, 0))") {
				document.querySelector("#bodyUnderlay").innerHTML += "<style></style>";
				for(i = 0; i < 500; i ++) {
					anything[0] = Math.random() * 7.5;
					anything[1] = Math.random() * 255;
					anything[2] = Math.random() * 100;
					anything[3] = Math.random() * 100;
					anything[4] = Math.random() + 1;
					anything[5] = (Math.random() - 0.5) * 90;
					if((anything[2] < 37.5 && anything[3] < 37.5) || ((anything[2] < 50 && Math.random() < 0.5) && (anything[3] < 50 && Math.random() < 0.5))) {
						continue;
					}
					document.querySelector("#bodyUnderlay").innerHTML += "<div class='r50d' style='width:" + anything[0] + "px;height:" + anything[0] + "px;top:" + anything[2] + "vh;left:" + anything[3] + "vw;position:absolute;border-radius:" + constrain(Math.random() * 50, 0, 50) + "%;background-color:rgba(" + constrain(anything[1] * anything[4], 0, 255) + ", " + constrain((anything[1] > 127.5 ? (127.5 - anything[1]) : anything[1]) * anything[4], 0, 255) + ", " + constrain((255 - anything[1]) * anything[4], 0, 255) + ", " + Math.random() / 1.5 +");transform:rotate("+ anything[5] + "deg);'></div>";
					r50d.push("1," + Math.random() / 100 + "," + anything[5] + "," + (Math.random() - 0.5) * 15);
				}
				setInterval(() => {
					for(i = 0; i < document.querySelectorAll(".r50d").length; i++) {
						document.querySelectorAll(".r50d")[i].style.transform = "scale(" + r50d[i].split(",")[0] + ", " + r50d[i].split(",")[0] + ") rotate(" + r50d[i].split(",")[2] + "deg)";
						r50d[i] = (parseFloat(r50d[i].split(",")[0]) + parseFloat(r50d[i].split(",")[1])) + "," + (parseFloat(r50d[i].split(",")[0]) >= 1.1 ? Math.abs(parseFloat(r50d[i].split(",")[1])) * -1 : parseFloat(r50d[i].split(",")[0]) <= 0.9 ? Math.abs(r50d[i].split(",")[1]) : parseFloat(r50d[i].split(",")[1])) + "," + (parseFloat(r50d[i].split(",")[2]) + parseFloat(r50d[i].split(",")[3])) + "," + parseFloat(r50d[i].split(",")[3]); i = i >= r50d.length - 1 ? 0 : i + 1;
					}
				}, 30);
			}
			if(getItem("bodyBackground") === "url('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg')") {
				setItem("bodyBackground", "black url('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg')");
				window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
			}
		}
		
		// Be honest, you probably did actually submit it on Turnitin.
		// As far as I remember, this is the oldest feature of the entire extension, along with changing the colour of the attendance indicator.
		for(i = 0; i < document.querySelectorAll(".itm .Error").length; i ++) {
			document.querySelectorAll(".itm .Error")[i].innerText = "Uh did you submit on Turnitin or something?";
		}
		// RAINBOW
		var attendanceEls = document.querySelectorAll(".sdIndicator");
		for(i = 0; i < attendanceEls.length; i++) {
			attendanceEls[i].classList.add("attendance");
		}
		var attendanceRainbows = [];
		for(i = 0; i < attendanceEls.length; i++) {
			attendanceRainbows.push(new rainbow(attendanceEls[i], getItem("rainbowSpeed"), getItem("autoAttendanceRainbow") != 0 && getItem("autoAttendanceRainbow") ? 1 : 0))
		}
		// To make random numbers into colours that actually look good, there is a method by @WeatherWonders: https://www.khanacademy.org/computer-programming/the-randomish-quiz/6515084802260992
		setInterval(() => {for(let i = 0; i < attendanceRainbows.length; i++) {attendanceRainbows[i].update();}}, 20);
		setInterval(() => {for(let i = 0; i < attendanceRainbows.length; i++) {attendanceRainbows[i].changeDirection();}}, 5000);
		// Getting the element that describes the current time
		if(document.querySelector(".diaryWeek")) {
			document.querySelector(".diaryWeek").addEventListener("click", () => {
				alert("rgb(" + attendanceRainbow[0] + "," + (400 - attendanceRainbow[0] + attendanceRainbow[1]) / 2.5 + "," + (400 - attendanceRainbow[1]) + ")");
			});
		}
		if(document.querySelector(".diaryDay")) {
			let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			date = Date().substr(11, 4) + "-" + (months.indexOf(Date().substr(4, 3)) < 10 ? "0" : "") + (months.indexOf(Date().substr(4, 3)) + 1) + "-" + Date().substr(8, 2);
			let time = Number(Date().substr(16, 2) + Date().substr(19, 2));
			if(document.querySelector(".diaryDay[data-date='"+date+"']")) {
				let lessonEls = [];
					for(i = 0; i < document.querySelector(".diaryDay[data-date='"+date+"']").parentNode.childNodes.length; i++) {
						lessonEls.push(document.querySelector(".diaryDay[data-date='"+date+"']").parentNode.childNodes[i]);
					}
				var lessonEl;

				i = 0;
				while (!lessonEl && i < lessonEls.length) {
					if (lessonEls[i]) {
						if (timeOfDiaryEl(lessonEls[i])[0] < time && timeOfDiaryEl(lessonEls[i])[1] >= time) {
							lessonEl = lessonEls[i];
						}
					}
					i ++;
				}
			}
			// LangLit is evil (as is TOK)
			var evilEl;
			for(var i = 0; i < document.querySelectorAll(".L").length; i++) {
				let evils = ["ELZ", "ENG", "LLS", "LLH", "TTK"];
				let something = document.querySelectorAll(".L")[i];
				if(evils.indexOf(something.childNodes[1].childNodes[0].innerText.substr(0, 3)) != -1) {
					something.classList.add("evil");
				}
			}
			if(lessonEl != undefined) {
				lessonEl.style.transformOrigin = "50% 50%";
				lessonEl.style.borderRadius = "5px";
				lessonEl.innerHTML += "<style>@keyframes lessonAnimation {from, to {border-left: 5px solid #64b0e3} 50% {border-left: 5px solid #5eb0e6}} .lessonEl {animation: lessonAnimation 10s infinite;}</style>";
				lessonEl.classList.add("lessonEl");
				document.querySelector(".lessonEl .t").addEventListener("click", () => {
					lessonEl.style.borderRadius = prompt("Enter the radius", "5px");
				});
			}
			for(i = 0; i < document.querySelectorAll(".evil").length; i++) {
				document.querySelectorAll(".evil .t")[i].addEventListener("click", () => {
					if(confirm("Are you sure you would like to enable evil mode? You will need to refresh the page to revert this.")) {
						document.querySelector("daymap-menu div, .header").style.background = "rgb(85, 2, 2)";
						//document.querySelector(".menu-list li").style.background = "rgb(85, 2, 2)";
						//document.querySelector("daymap-menu div, .header").style.borderBottom = "rgb(0, 0, 0)";
						document.querySelector("#bodyUnderlay").style.background = "rgb(85, 10, 10)";
						{
							let something = document.createElement("div");
							something.setAttribute("class", "bodyOverlay");
							something.setAttribute("style", "background-color:rgba(113,13,13,0.5);width:100vw; height: 100vh; position:fixed; pointer-events: none; bottom: 0px;");
							document.querySelector(".main-layout").appendChild(something);
							document.querySelector("head").innerHTML += "<style>.bodyOverlay {background-color:rgba(113,13,13,0.5);width:100vw; height: 100vh; position:fixed;}</style>";
						}
						document.querySelector(".Toolbar").style.background = "rgb(100, 20, 20)";
						for (i = 0; i < document.querySelectorAll(".grid div").length; i++) {
							document.querySelectorAll(".grid div")[i].style.background = "rgb(100, 20, 40)";
						};
						for (i = 0; i < document.querySelectorAll(".list-item-heading").length; i++) {
							document.querySelectorAll(".list-item-heading")[i].innerText = "Mua ha ha ha!";
						};
						for (i = 0; i < document.querySelectorAll(".list-item-meta").length; i++) {
							document.querySelectorAll(".list-item-meta")[i].innerText = "Always.";
						};
						for (i = 0; i < document.querySelectorAll(".description").length; i++) {
							document.querySelectorAll(".description")[i].innerText = "Daymap bows down to my power.";
						};
					}
				});
			}
		}
		
		// Translucency effect
		if(getItem("translucentMode") && parseFloat(getItem("translucentMode")) < 1) {
			var dark = document.cookie.substr(document.cookie.length - 1, document.cookie.length); // Because dark mode is the only cookie that Daymap Graphics can read, others are HTTP only
			dark = dark == "1" ? 1 : 0;
			var translucentness = parseFloat(getItem("translucentMode")); // Upon rereading the code, this is probably supposed to be spelt "translucency". But I can't be bothered to fix it.
			for(i = 0; i < document.querySelectorAll(".card, .msg, .ditm, .Toolbar, #cntDiary, .tabPage").length; i ++) {
				document.querySelectorAll(".card, .msg, .ditm, .Toolbar, #cntDiary, .tabPage")[i].style.background = "rgba(" + (dark ? "37, 37, 37," : "237, 235, 233,") + translucentness + ")";
			}
			for(i = 0; i < document.querySelectorAll(".item-container, .tabList div a, .rgGroupPanel td td").length; i ++) {
				document.querySelectorAll(".item-container, .tabList div a, .rgGroupPanel td td")[i].style.background = "rgba(255, 255, 255, 0)";
			}
			for(i = 0; i < document.querySelectorAll(".hasDatepicker, #divInbox, .Left").length; i ++) {
				document.querySelectorAll(".hasDatepicker, #divInbox, .Left")[i].style.backgroundColor = "rgba(" + (dark ? "37, 37, 37," : "237, 235, 233,") + translucentness * 0.7 + ")";
			}
			for(i = 0; i < document.querySelectorAll(".ditm, .Toolbar").length; i ++) {
				document.querySelectorAll(".ditm, .Toolbar")[i].style.outline = "3px solid rgba(250, 250, 250, " + translucentness * 0.45 + ")";
			}
			if(document.querySelector("#bCalendar")) {
				document.querySelector("#bCalendar").style.backgroundColor = "rgba(31, 157, 217, " + translucentness * 1.6 + ")";
				document.querySelector("#btnDiary").style.backgroundColor = "rgba(31, 157, 217, " + translucentness * 1.6 + ")";
			}
			// Turns out a lot of the things here were unnecessarily blurred, but even with just cards and the toolbar, it's really slow.
			if(getItem("blurAmount") && getItem("blurAmount") != 0) {
				for(i = 0; i < document.querySelectorAll(".card, .Toolbar").length; i ++) {
					document.querySelectorAll(".card, .Toolbar")[i].style.backdropFilter = "blur(" + getItem("blurAmount") + "px)";
				}
			}
			for(i = 0; i < document.querySelectorAll(".nav-container, .nav-user-container, .rgGroupPanel td").length; i++) {
				document.querySelectorAll(".nav-container, .nav-user-container, .rgGroupPanel td")[i].style.backgroundColor = "rgba(" + (dark ? "37, 37, 37," : "237, 235, 233,") + translucentness * 0.7 + ")";
			}
			// Sometimes Daymap code loads slower than Daymap Graphics code does, so this just makes sure that the elements exist before changing them
			window.setTimeout(() => {
				document.querySelector("daymap-header").style.backgroundColor = "rgba(255, 255, 255, " + translucentness * 1.2 + ")";
				document.querySelector("daymap-header").style.backdropFilter = "blur(" + getItem("blurAmount") * 3 + "px)";
				for(i = 0; document.querySelectorAll("daymap-header div ul li").length; i++) {
					document.querySelectorAll("daymap-header div ul li")[i].style.backgroundColor = "rgba(255, 255, 255, " + translucentness * 0.8 + ")";
				}
				for(i = 0; i < document.querySelectorAll(".diaryEvents, #divDiaryDay, .PlanDay").length; i ++) {
					document.querySelectorAll(".diaryEvents, #divDiaryDay, .PlanDay")[i].style.background = "rgba(" + (dark ? "37, 37, 37," : "237, 235, 233,") + translucentness + ")";
				}
			}, 500);
		}
		window.setInterval(() => { // 0-1ms per iteration, 7-8ms if condition is met
			// Reverting the messages to how they looked previously.
			if(document.querySelector(".fa-mail-bulk") ? document.querySelector(".fa-mail-bulk").outerHTML.indexOf("img") == -1 : 0) {
				let length = document.querySelectorAll(".fa-mail-bulk").length;
				for(i = 0; i < length; i++) {
					document.querySelector(".fa-mail-bulk").outerHTML = "<img src='https://qasmt.eq.daymap.net/Daymap/images/coms/post32.png'/>";
				}
				length = document.querySelectorAll(".img-container .fa-comment-alt").length;
				for(i = 0; i < length; i++) {
					document.querySelector(".img-container .fa-comment-alt").outerHTML = "<img src='https://qasmt.eq.daymap.net/Daymap/images/coms/newmsg.png'/>";
				}
				length = document.querySelectorAll(".fa-comment-alt-dots").length;
				for(i = 0; i < length; i++) {
					document.querySelector(".fa-comment-alt-dots").outerHTML = "<img src='https://qasmt.eq.daymap.net/Daymap/images/coms/newmsg.png'/>";
				}
				length = document.querySelectorAll(".fa-paperclip").length;
				for(i = 0; i < length; i++) {
					document.querySelector(".fa-paperclip").outerHTML = "<img src='https://qasmt.eq.daymap.net/Daymap/images/buttons/attachment.gif'/>";
				}
				for(i = 0; i < document.querySelectorAll(".msg").length; i ++) {
					document.querySelectorAll(".msg")[i].style.border = "3px solid rgba(220, 220, 220, " + translucentness * 0.45 + ")";
				}
				for(i = 0; i < document.querySelectorAll(".msg").length; i ++) {
					document.querySelectorAll(".msg")[i].style.background = "rgba(" + (dark ? "37, 37, 37," : "237, 235, 233,") + translucentness + ")";
				}
				if(getItem("blurAmount") && getItem("blurAmount") != 0) {
					for(i = 0; i < document.querySelectorAll(".msg").length; i ++) {
						document.querySelectorAll(".msg")[i].style.backdropFilter = "blur(" + getItem("blurAmount") + "px)";
					}
				}
				for(i = 0; i < document.querySelectorAll(".item-container").length; i ++) {
					document.querySelectorAll(".item-container")[i].style.background = "rgba(255, 255, 255, 0)";
				}
			}
			// Portfolio page
			for(i = 0; i < document.querySelectorAll(".body-114").length; i++) {
				document.querySelectorAll(".body-114")[i].style.background = "rgba(255, 255, 255, 0)";
			}
			if(document.querySelector(".msgBody")) {
				document.querySelector(".msgBody").style.background = "rgba(" + (dark ? "37, 37, 37," : "237, 235, 233,") + translucentness + ")";
			}
			if(document.querySelectorAll(".data-table, #tblAttendanceRate, #tblClasses, .rgMasterTable")) {
				for(i = 0; i < document.querySelectorAll(".data-table tbody tr th, #tblAttendanceRate tbody tr th, #tblClasses tbody tr th, .rgMasterTable thead tr th").length; i++) {
					document.querySelectorAll(".data-table tbody tr th, #tblAttendanceRate tbody tr th, #tblClasses tbody tr th, .rgMasterTable thead tr th")[i].style.backgroundColor = "rgba(0, 108, 190, " + (1 - (1 - translucentness) / 2) + ")";
				}
				for(i = 0; i < document.querySelectorAll(".data-table tbody tr:nth-child(even) td, #tblAttendanceRate tbody tr:nth-child(even) td, #tblClasses tbody tr:nth-child(even) td, .rgMasterTable tbody tr:nth-child(even) td").length; i++) {
					document.querySelectorAll(".data-table tbody tr:nth-child(even) td, #tblAttendanceRate tbody tr:nth-child(even) td, #tblClasses tbody tr:nth-child(even) td, .rgMasterTable tbody tr:nth-child(even) td")[i].style.backgroundColor = (!dark ? "rgba(243, 242, 241, " : "rgba(21, 21, 21, ") + getItem("translucentMode") * 1.25 + ")";
				}
				for(i = 0; i < document.querySelectorAll(".data-table tbody tr:nth-child(odd) td, #tblAttendanceRate tbody tr:nth-child(odd) td, #tblClasses tbody tr:nth-child(odd) td, .rgMasterTable tbody tr:nth-child(odd) td").length; i++) {
					document.querySelectorAll(".data-table tbody tr:nth-child(odd) td, #tblAttendanceRate tbody tr:nth-child(odd) td, #tblClasses tbody tr:nth-child(odd) td, .rgMasterTable tbody tr:nth-child(odd) td")[i].style.backgroundColor = (!dark ? "rgba(237, 235, 233, " : "rgba(37, 37, 37, ") + getItem("translucentMode") * 1.25 + ")";
				}
			}
		}, 100);
		// Reverts Daymap to the (better) original layout.
		console.log(getItem("originalLayout"));
		if(getItem("originalLayout") && getItem("originalLayout") != 0) {
			let megaphone = window.setInterval(() => {
				if(document.querySelector(".atooltip")) { // If there's an announcement, it moves it to the post ticker
					let link = document.createElement("div");
					link.innerHTML = `
					<div class="post-ticker">
						<div id="ctl00_divTickerPosts"><div class="post-subject current"><a id="divBulletinContainer" href="` + document.querySelector("#bulletin_ .atooltip").attributes.href.value + `">` + document.querySelector("#bulletin_ .atooltip").innerText + `</a></div></div>
						<div class="post-nav">
							<i class="mdi mdi-chevron-left" aria-hidden="true" id="postNavPrev"></i>
							<span id="postCounter">1/1</span>
							<i class="mdi mdi-chevron-right" aria-hidden="true" id="postNavPrev"></i>
						</div>
					</div>
					<style>
					.post-ticker {
						position: fixed;
						top: 74px;
						margin-top: 2px;
						right: -4px;
						height: 34px;
						display: flex;
						align-items: center;
						flex-flow: row;
						background-color: rgb(31, 157, 217);
						box-shadow: rgba(31, 157, 217, 0.7) 0px 0px 8px 1px;
						padding-left: 15px;
						padding-right: 18px;
						border-radius: 3px;
						z-index: 1080;
						color: rgb(255, 255, 255);
						transition: top 0.5s ease 0s;
					}
					</style>
					`;
					document.querySelector(".main-layout").appendChild(link);
					window.clearInterval(megaphone);
					if(document.querySelector("header")) {
						document.querySelector("header").remove();
					}
				} else if (!document.querySelector(".header-announcements[style='display:block']")) {
					window.clearInterval(megaphone);
					if(document.querySelector("header")) {
						document.querySelector("header").remove();
					}
				}
			}, 100);
			// Adds the header from the old Daymap after the other one's been removed
			let headerInterval = window.setInterval(() => {
				if(document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count")) {
					document.querySelector("body").prepend((() => {
						let header = document.createElement("div");
						header.innerHTML = `
						<div class="header" style="background-color: rgba(255, 255, 255, 0.416); backdrop-filter: blur(0px);">
							<div role="navigation" class="menuContainer" id="menuContainer">
								<div id="mnu"><table class="lpMenuTop"> <!-- Moving the table tag onto the next line breaks it. I have no idea why. -->
									<tbody>
										<tr>
											<td href="/daymap/student/portfolio.aspx">Portfolio</td>
											<td href="/daymap/default.aspx?hideNav=1" menuid="1">Day Plan</td>
											<td href="/daymap/student/classes.aspx" menuid="2">Classes</td>
											<td menuid="3">Assessment</td>
											<td menuid="4">Communications</td>
											<td menuid="5">Calendars</td>
											<td href="javascript:window.open('/Depot/', '_blank');">Depot</td>
										</tr>
									</tbody>
								</table></div>
							</div>
							<div class="header-logo">
								<div class="landing-button" id="divLandingButton">
									<i class="mdi mdi-menu" aria-hidden="true"></i>
								</div>
								<a href="/daymap">
									<img src="https://portal-beta.daymap.net/daymapidentity/logo.png" class="logo" alt="" style="margin-top: -1.5px; margin-left: 43px; width: 122px;" class="logo-img">
								</a>
							</div>
							<div class="header-user">
								<div class="notification">
									<a href="/daymap/coms/Messaging.aspx" id="divAlertCount"><i class="mdi mdi-message" title="Go to my messages"></i>` + (!document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count.hidden") ? `<div class="notification-amount" title="New messages"> ${(document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count").innerHTML ? document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count").innerHTML : ``)}</div>` : ``) + `</a>
								</div>
								<div id="divUserAvatar" class="avatar" style="background-Image: url('/DayMap/Images/profile-icon-grey.png'), url('/DayMap/Images/profile-icon-grey.png');" tabindex="1">
								<div class="vertical-menu open-from-right user-menu" style="top:45px"><a class="menu-label">Logged in as ` + document.querySelector(".name-text").innerHTML + `</a><a tabindex="3">Sign Out</a><a tabindex="4">My Details</a></div></div>
							</div>
						</div>
						<style>
							 .header {
								 transition: all 0.5s ease 0s;
								 position: fixed;
								 left: 0px;
								 right: 0px;
								 top: 0px;
								 height: 78px;
								 box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 1em 0.5em;
								 border-bottom: 1px solid gainsboro;
								 background-color: rgb(255, 255, 255);
								 z-index: 1100;
								 text-align: center;
								 display: flex;
								 flex-flow: row wrap;
								 justify-content: space-between;
								 align-items: center;
							}
							.menuContainer {
								width: 100%;
								font-size: .8rem;
								position: relative;
							}
							.menuContainer .lpMenuTop {
								cursor: pointer;
							}
							.menuContainer .lpMenuTop:hover td, .menuContainer .lpMenuTop.active td {
								color: #6f6f6f;
							}
							.menuContainer .lpMenuTop td {
								color: #bcbcbc;
								background-color: white;
								border-bottom: 1px solid white;
								border-left: 2px solid transparent;
								padding: 4px 9px 7px 9px;
								transition: border-bottom .5s, color .2s;
								white-space: nowrap;
							}
							.menuContainer .lpMenuTop td:hover, .menuContainer .lpMenuTop td.active {
								border-left: 2px solid #1F9DD9;
								background-color: #f0f0f0;
								color: #000;
							}
							.menuContainer div.lpMenu {
								cursor: pointer;
								position: absolute;
								box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 8px rgba(0, 0, 0, 0.2);
								z-index: 1425;
							}
							.menuContainer div.lpMenu table.lpMenu {
								background-color: white;
								color: #3c3c3c;
							}
							.menuContainer div.lpMenu table.lpMenu tr .lpMenuTd1, .menuContainer div.lpMenu table.lpMenu tr .lpMenuTd1a {
								display: none;
							}
							.menuContainer div.lpMenu table.lpMenu tr .lpMenuTd2, .menuContainer div.lpMenu table.lpMenu tr .lpMenuTd2a {
								text-align: left;
								padding: 7px 11px;
							}
							.menuContainer div.lpMenu table.lpMenu tr .lpMenuTd2 {
								border-left: 2px solid #a0d7f1;
							}
							.menuContainer div.lpMenu table.lpMenu tr .lpMenuTd2a {
								border-left: 2px solid #1F9DD9;
							}
							.menuContainer div.lpMenu table.lpMenu tr:hover {
								background-color: #f0f0f0;
								color: #000;
							}
						</style>`;
						document.querySelector("daymap-nav").remove();
						document.querySelector("daymap-menu").remove();
						document.querySelector(".main-layout").style.marginLeft = "0px";
						document.querySelector(".main-layout").style.marginTop = "38.2px";
						for(i = 0; i < document.querySelectorAll(".card").length; i ++) {
							document.querySelectorAll(".card")[i].style.border = "1px solid " + (dark ? "gray" : "gainsboro");
							document.querySelectorAll(".card")[i].style.borderRadius = "4px";
						}
						for(i = 0; i < header.querySelectorAll("td").length; i++) {
							header.querySelectorAll("td")[i].style.backgroundColor = "rgba(" + (dark ? "37, 37, 37," : "237, 235, 233,") + getItem("translucentMode") * 1.2 + ")";
						}
						if(getItem("url")) {
							header.querySelector("#divUserAvatar").style.background = "url(" +  getItem("url") + ") center / cover no-repeat";
						}
						header.querySelector(".header").style.backgroundColor = "rgba(" + (dark ? "37, 37, 37," : "237, 235, 233,") + getItem("translucentMode") * 1.3 + ")";
						header.querySelector(".header").style.backdropFilter = "blur(" + getItem("blurAmount") + "px)";
						return header;
					})());
				} else {
					clearInterval(headerInterval);
				}
			}, 50);
			// Making the header's dropdown menus work.
			window.setTimeout(() => {
				let lpmenuScript = document.createElement("script");
				lpmenuScript.src = chrome.runtime.getURL("/headerMenus.js");
				document.querySelector("body").appendChild(lpmenuScript);
			}, 1000);
		}
		// For timetable view
		if(document.querySelector("#ctl00_cp_spnTimetable")) {
			for(i = 0; i < document.querySelectorAll("#tblTt tbody tr td").length; i++) {
				if(document.querySelectorAll("#tblTt tbody tr:nth-child(even) td")[i]) {
					document.querySelectorAll("#tblTt tbody tr:nth-child(even) td")[i].style.backgroundColor = (!dark ? "rgba(243, 242, 241, " : "rgba(21, 21, 21, ") + getItem("translucentMode") + ")";
				}
				if(document.querySelectorAll("#tblTt tbody tr:nth-child(odd) td")[i]) {
					document.querySelectorAll("#tblTt tbody tr:nth-child(odd) td")[i].style.backgroundColor = (!dark ? "rgba(237, 235, 233, " : "rgba(37, 37, 37, ") + getItem("translucentMode") + ")";
				}
			}
			for(i = 0; i < document.querySelectorAll(".ttCell").length; i++) {
				document.querySelectorAll(".ttCell")[i].style.boxShadow = "0.5px 0.75px 1px rgba(0, 0, 0, 0.25)"
			}
		}
		// Profile picture thingy
		if(getItem("url") && document.querySelector(".photoThumb")) {
			document.querySelector(".photoThumb").style.background = "url(" + (getItem("url") == "shosty" ? shosty : getItem("url")) + ") 0 0 / contain no-repeat";
			document.querySelector(".photoThumb").style.width = "100px";
			document.querySelector(".photoThumb").style.height = "120px";
		}
	});