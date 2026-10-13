/*

	DaymapGraphics.js 
	Copyright (C) 2026  apate98

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





/*
 * CHANGELOG
 * 6.0.0 *   Added changelog and introduced compatibility for Daymap's timetable view.
 * 6.0.1 *   Fixed a problem where opacity is reversed in timetable view.
 * 6.0.2 *   Changed the manual background change to apply to underlay rather than body. Increased speed of underlay rainbow.
 * 6.0.3 *   Allowed manual changing of the attendance indicator colour to anything, replacing the old background-color with background.
 * 6.1.0 *   Allows blurring behind the foreground cards, giving a glassy effect.
 * 6.1.1 *   Made header also change opacity and made logo transparent.
 * 7.0.0 *   Removed all jQuery usage to enable compatibility with new Daymap. Also basically rewrote a bunch of code to work with new Daymap.
 * 7.0.1 *   Fixed an issue to do with timetable view transparency. Also made transparent cards match with dark mode or light mode.
 * 7.0.2 *   Fixed transparency... again. This time for feed view.
 * 7.1.0 *   Made the header less obtrusive and made dark mode work properly.
 * 7.2.0 *   Added option to revert to original layout.
 * 7.2.1 *   Fixed a major bug which would cause Daymap to not load properly.
 * 7.2.2 *   Removed auto background option as it confused many new users. Background will now load regardless of checking the box. Also accounted for school removing messages.
 * 7.2.3 *   Fixed a major bug that would cause the menus to not work properly some of the time. Also fixed the dark mode cookie expiring after the session.
 * 7.3.0 *   Storing settings in synced storage rather than local storage, and added help on where to find instructions, added comments in code and fixed a minor issue in timetable view. Also fixed evil mode and made a new icon!
 * 7.3.1 *   Fixed evil mode again, and fixed a very old bug with evil mode.
 * 7.4.0 *   Removed all localStorage-related code.
 * 7.5.0 *   Introduced compatibility for all Daymap pages, changed rainbows to a constructor so that all indicators can be rainbow, added custom profile pictures, fixed the post ticker, fixed changing message pages, changed dark mode cookie path, and a few cool graphical and performance improvements.
 * 7.5.1 *   Fixed a bug with the rainbow (BUG CAPTURED: Rainbowix Lagginexia. Description: Rainbow no appear)
 * 7.5.2 *   Added the custom profile picture to the top right corner icon in the original layout.
 * 7.6.0 *   Moved settings to extension popup, removed top menu code due to the upcoming Daymap update that removes the top menu, fixed bug that led to the slow blur backdrop filter being applied even when unnecessary.
 * 8.0.0 *   Reworked the code, made stars a feature, performance improvements, and most changes can show up live.
 * 8.0.1 *   Fixed two bugs with the rainbow and a bug with the profile picture, preparations for release on Firefox-based browsers, original layout now changes the page live, added transitions to card elements to smooth out changes in sliders.
*/

/*
 * TODO:
 * Presets
 * Fix calendar opacity (?? haven't tested... no clue if it's still broken)
 * More animations
 * * Shimmery thingy
 * * Snowflakes
 * * Fireflies?
 * Change the way the profile picture URL is added to the header
*/

/*
 * COMPATIBILITY
 * Compatible (tested):
 * * Chromium (Blink/V8)
 * * Google Chrome (Blink/V8)
 * * MSEdge (Blink/V8)
 * Prepare for release on:
 * * Firefox (Gecko/Quantum/Servo/SpiderMonkey)
 * * MSEdge (Blink/V8)
 * * Opera (Blink/V8)
 * Test compatibility with:
 * * Brave (Blink/V8)
 * * Opera (Blink/V8)
*/

/*
 * STUFF THAT WON'T BE IMPLEMENTED:
 * Modules
 * WebKit compatibility
*/



// CHECKLIST BEFORE PUSHING UPDATE
// Change changelog
// Change version and changes variables
// Change manifest.json version
// Check popup.html










'use strict';

const version = "8.0";
const changes = "Daymap Graphics 8.0: Backgrounds can now be starry! More animations coming soon...";

// Set item in storage
const setItem = (key, value) => {
	browser.storage.sync.set({[key]: value});
};

const constrain = (num, min, max) => {
	return num < min ? min : num > max ? max : num;
}

var lessonStart, lessonEnd, date, classEls = [], i, anything = [], r50d = [], dark, translucentness, starInterval, stork, blr, attendanceRainbows = [], test, url, resources, formattingStuff = [], changed = 0;

// Because dark mode is the only cookie that Daymap Graphics can read, others are HTTP only
dark = (document.cookie.substr(document.cookie.length - 1, document.cookie.length) == "1" ? 1 : 0);

test = (window.location.href == browser.runtime.getURL("test.html")); // Because I can't access Daymap anymore for testing

// this function used to have around 40 lines checking each case individually using substr.
const timeOfDiaryEl = (lessonEl) => {
	let p0 = lessonEl.innerText.match(/\d+/g), p1 = lessonEl.innerText.match(/\wM/g);
	let p2 = [Number(p0[0] + p0[1]), Number(p0[2] + p0[3])];
	p2[0] += 1200 * (p1[0] == "PM" && p0[0] != "12");
	p2[1] += 1200 * (p1[1] == "PM" && p0[2] != "12");
	return p2;
}

// transformed uniform random distribution
// does the same as using minimum and maximum bounds
const rTrans = (y, x = 0) => {
	return Math.random() * y + x;
}

// each colour in the rainbow is stored as a point on a 2D colour space (point in a square in a euclidean space), not all colours are represented
// this is to make it look nicer by choice of the colour space
// "move" and "changeDirection" just change where the point is in that colour space (as if moving through a euclidean space)
function rainbow(el, speed, on) {
	this.el = el, this.speed = speed, this.data = [], this.on = on;
	for(let i = 0; i < 3; i++) {
		this.data[i] = [rTrans(400), rTrans(400), rTrans(0.5, 0.25), rTrans(0.5, 0.25)]; // Colour, colour, direction, direction
	}
	this.move = (num) => {
		this.data[num][0] += rTrans(1, -this.data[num][2]) * this.speed;
		this.data[num][1] += rTrans(1, -this.data[num][3]) * this.speed;
		this.data[num][0] = constrain(this.data[num][0], 0, 410);
		this.data[num][1] = constrain(this.data[num][1], 0, 410);
	};
	this.update = () => { // In case you were confused about those huge lines in the previous versions, this is sort of what they look like individually
		if(this.on) {
			let grad = "linear-gradient(" + this.data[0][0] + "deg";
			for(let i = 0; i < 3; i++) {
				this.move(i);
				grad += `,rgb(${(this.data[i][0])},${((400-this.data[i][0]+this.data[i][1])/2.5)},${(400-this.data[i][1])})${((i-1)*75)}%`;
			}
			this.el.style.backgroundImage = grad + ")";
		}
	};
	this.toggle = () => {
		this.on ^= 1;
		this.el.style.backgroundImage = "";
	}
	this.changeDirection = () => {
		for(let i = 0; i < 3; i++) {
			this.data[i][2] = rTrans(0.5, 0.25);
			this.data[i][3] = rTrans(0.5, 0.25);
		}
	}
};

// updates the stars once they're eventually created
const starInit = () => {
	starInterval = setInterval(() => {
		for(i = 0; i < document.querySelectorAll(".r50d").length; i++) {
			document.querySelectorAll(".r50d")[i].style.transform = "scale(" + r50d[i].split(",")[0] + ", " + r50d[i].split(",")[0] + ") rotate(" + r50d[i].split(",")[2] + "deg)";
			r50d[i] = (parseFloat(r50d[i].split(",")[0]) + parseFloat(r50d[i].split(",")[1])) + "," + (parseFloat(r50d[i].split(",")[0]) >= 1.1 ? Math.abs(parseFloat(r50d[i].split(",")[1])) * -1 : parseFloat(r50d[i].split(",")[0]) <= 0.9 ? Math.abs(r50d[i].split(",")[1]) : parseFloat(r50d[i].split(",")[1])) + "," + (parseFloat(r50d[i].split(",")[2]) + parseFloat(r50d[i].split(",")[3])) + "," + parseFloat(r50d[i].split(",")[3]); i = i >= r50d.length - 1 ? 0 : i + 1;
		}
	}, 30);
};

const setBackground = (bg) => {
	if(bg === "surprise me") {
		document.querySelector("#bodyUnderlay").style.background = resources.backgrounds[Math.floor(rTrans(3))];
	} else {
		document.querySelector("#bodyUnderlay").style.background = bg;
	}
}



// this is what the background thing modifies
let bodyUnderlay = document.createElement("div");
bodyUnderlay.setAttribute("id", "bodyUnderlay");
document.querySelector("head").innerHTML += "<style>#bodyUnderlay {position: fixed; width: 100%; height: 100%; top: 0; z-index: -2147483647;}</style>";
document.querySelector("body").appendChild(bodyUnderlay);

// adds stars but keeps them invisible and doesn't set the update interval
for(i = 0; i < 500; i++) {
	anything[0] = rTrans(7.5);
	anything[1] = rTrans(255);
	anything[2] = rTrans(100);
	anything[3] = rTrans(100);
	anything[4] = rTrans(1, 1);
	anything[5] = rTrans(90, -45);
	document.querySelector("#bodyUnderlay").innerHTML += "<div class='r50d' style='width:" + anything[0] + "px;height:" + anything[0] + "px;top:" + anything[2] + "vh;left:" + anything[3] + "vw;position:absolute;border-radius:" + constrain(Math.random() * 50, 0, 50) + "%;background-color:rgba(" + constrain(anything[1] * anything[4], 0, 255) + ", " + constrain((anything[1] > 127.5 ? (127.5 - anything[1]) : anything[1]) * anything[4], 0, 255) + ", " + constrain((255 - anything[1]) * anything[4], 0, 255) + ", " + Math.random() / 1.5 +");transform:rotate("+ anything[5] + "deg);opacity:0;'></div>";
	r50d.push("1," + Math.random() / 100 + "," + anything[5] + "," + (Math.random() - 0.5) * 15);
}

const handleTranslucentness = () => { // Yes I know it's written translucency
	for(i = 0; i < document.querySelectorAll(".card, .msg, .ditm, .Toolbar, #cntDiary, .tabPage").length; i++) {
		document.querySelectorAll(".card, .msg, .ditm, .Toolbar, #cntDiary, .tabPage")[i].style.background = thingy0();
	}
	for(i = 0; i < document.querySelectorAll(".item-container, .tabList div a, .rgGroupPanel td td").length; i++) {
		document.querySelectorAll(".item-container, .tabList div a, .rgGroupPanel td td")[i].style.background = "rgba(255, 255, 255, 0)";
	}
	for(i = 0; i < document.querySelectorAll(".hasDatepicker, #divInbox, .Left").length; i++) {
		document.querySelectorAll(".hasDatepicker, #divInbox, .Left")[i].style.backgroundColor = thingy0(37, 233, 0.7);
	}
	for(i = 0; i < document.querySelectorAll(".ditm, .Toolbar").length; i++) {
		document.querySelectorAll(".ditm, .Toolbar")[i].style.outline = "3px solid rgba(250, 250, 250, " + translucentness * 0.45 + ")";
	}
	if(document.querySelector("#bCalendar")) {
		document.querySelector("#bCalendar").style.backgroundColor = "rgba(31, 157, 217, " + translucentness * 1.6 + ")";
		document.querySelector("#btnDiary").style.backgroundColor = "rgba(31, 157, 217, " + translucentness * 1.6 + ")";
	}
	if(blr && blr != 0) {
		for(i = 0; i < document.querySelectorAll(".card, .Toolbar").length; i++) {
			document.querySelectorAll(".card, .Toolbar")[i].style.backdropFilter = "blur(" + blr + "px)";
		}
	}
	for(i = 0; i < document.querySelectorAll(".nav-container, .nav-user-container, .rgGroupPanel td").length; i++) {
		document.querySelectorAll(".nav-container, .nav-user-container, .rgGroupPanel td")[i].style.backgroundColor = thingy0(37, 233, 0.7);
	}
	if(document.querySelector("#headerThingy")) {
		let header = document.querySelector("#headerThingy");
		for(i = 0; i < header.querySelectorAll("td").length; i++) {
			header.querySelectorAll("td")[i].style.backgroundColor = thingy0(37, 233, 1.2);
		}
		header.querySelector(".header").style.backgroundColor = thingy0(37, 233, 1.3);
		header.querySelector(".header").style.backdropFilter = "blur(" + blr + "px)";
	}
	// Sometimes Daymap code loads slower than Daymap Graphics code does, so this just makes sure that the elements exist before changing them
	var headerInterval = window.setInterval(() => {
		try {
			document.querySelector("daymap-header").style.backgroundColor = "rgba(255, 255, 255, " + translucentness * 1.2 + ")";
			document.querySelector("daymap-header").style.backdropFilter = "blur(" + blr * 3 + "px)";
			for(i = 0; document.querySelectorAll("daymap-header div ul li").length; i++) {
				document.querySelectorAll("daymap-header div ul li")[i].style.backgroundColor = "rgba(255, 255, 255, " + translucentness * 0.8 + ")";
			}
			for(i = 0; i < document.querySelectorAll(".diaryEvents, #divDiaryDay, .PlanDay").length; i++) {
				document.querySelectorAll(".diaryEvents, #divDiaryDay, .PlanDay")[i].style.background = thingy0();
			}
		} catch {
			return;
		}
		window.clearInterval(headerInterval);
	}, 100);
}

const thingy0 = (a = 37, b = 233, c = 1) => { // Random motif that appears a bunch of times, smth to do with dark mode
	//return "rgba(" + (dark ? "37, 37, 37," : "237, 235, 233,") + translucentness + ")";
	return "rgba(" + (dark ? `${a},${a},${a},` : `${b+4},${b+2},${b},`) + translucentness * c + ")";
}

async function addBug(id) {
	let bugs = (await browser.storage.sync.get()).bugs;
	if(!(bugs >> id & 1)) {
		setItem("bugs", (bugs | (1 << id)));
	}
}

const originalLayout = () => {
	document.querySelector("body").style.fontFamily='Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif';
	let megaphone = window.setInterval(() => {
		if(document.querySelector(".atooltip")) { // If there's an announcement, it moves it to the post ticker
			let link = document.createElement("div");
			link.innerHTML = resources.postTicker[0] + document.querySelector("#bulletin_ .atooltip").attributes.href.value + `">` + document.querySelector("#bulletin_ .atooltip").innerText + resources.postTicker[1];
			document.querySelector(".main-layout").appendChild(link);
			window.clearInterval(megaphone);
			if(document.querySelector("header")) {
				document.querySelector("header").classList.add("stuffToAddBack");
				document.querySelector("header").style.display = "none";
			}
		} else if (!document.querySelector(".header-announcements[style='display:block']")) {
			window.clearInterval(megaphone);
			if(document.querySelector("header")) {
				document.querySelector("header").classList.add("stuffToAddBack");
				document.querySelector("header").style.display = "none";
			}
		}
	}, 100);
	// Adds the header from the old Daymap after the other one's been removed
	let headerInterval2 = window.setInterval(() => {
		if(document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count") || test) {
			document.querySelector("body").prepend((() => {
				let header = document.createElement("div");
				header.setAttribute("id", "headerThingy");
				header.innerHTML = resources.header[0] + (!document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count.hidden") ? `<div class="notification-amount" title="New messages"> ${(document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count") ? document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count").innerHTML : ``)}</div>` : ``) + (url ? resources.header[1].replaceAll("/DayMap/Images/profile-icon-grey.png", url) : resources.header[1]) + (document.querySelector(".name-text") ? document.querySelector(".name-text").innerHTML : "") + resources.header[2];
				if(document.querySelector("daymap-nav")) {
					document.querySelector("daymap-nav").classList.add("stuffToAddBack");
					document.querySelector("daymap-nav").style.display = "none";
				}
				if(document.querySelector("daymap-menu")) {
					document.querySelector("daymap-menu").classList.add("stuffToAddBack");
					document.querySelector("daymap-menu").style.display = "none";
				}
				formattingStuff = [document.querySelector(".main-layout").style.marginLeft, document.querySelector(".main-layout").style.marginTop, [], []];
				document.querySelector(".main-layout").style.marginLeft = "0px";
				document.querySelector(".main-layout").style.marginTop = "38.2px";
				for(i = 0; i < document.querySelectorAll(".card").length; i++) {
					formattingStuff[2].push(document.querySelectorAll(".card")[i].style.border);
					formattingStuff[3].push(document.querySelectorAll(".card")[i].style.borderRadius);
					document.querySelectorAll(".card")[i].style.border = "1px solid " + (dark ? "gray" : "gainsboro");
					document.querySelectorAll(".card")[i].style.borderRadius = "4px";
				}
				for(i = 0; i < header.querySelectorAll("td").length; i++) {
					header.querySelectorAll("td")[i].style.backgroundColor = thingy0(37, 233, 1.2);
				}
				if(url) {
					header.querySelector("#divUserAvatar").style.background = `url(${url}) center / cover no-repeat`;
				}
				header.querySelector(".header").style.backgroundColor = thingy0(37, 233, 1.3);
				header.querySelector(".header").style.backdropFilter = "blur(" + blr + "px)";
				return header;
			})());
			// yeah idk why i put this on a timeout before instead of just doing this??
			//window.setTimeout(() => {
				if(!test) {
					let lpmenuScript = document.createElement("script");
					lpmenuScript.src = browser.runtime.getURL("/headerMenus.js");
					document.querySelector("body").appendChild(lpmenuScript);
				}
			//}, 1000);
			clearInterval(headerInterval2);
		} else {
			// i don't remember what this line was for
			//clearInterval(headerInterval2);
		}
	}, 50);
	// Making the header's dropdown menus work.
	/*window.setTimeout(() => {
		let lpmenuScript = document.createElement("script");
		lpmenuScript.src = browser.runtime.getURL("/headerMenus.js");
		document.querySelector("body").appendChild(lpmenuScript);
	}, 1000);*/
}

// Probably bad practice but this was the only way I could find to get the storage and use it without .then every time or making the entire code asynchronous (which would break the code).
(async () => {
	return [await browser.storage.sync.get(), JSON.parse((await (await window.fetch(browser.runtime.getURL("resources.json"))).text()).replaceAll(/\n/g,""))];
})()
	.then(inputs => {
		const getItem = (key) => {return inputs[0][key]};
		Object.assign(inputs[0], stork);
		resources = inputs[1];
		blr = getItem("blurAmount");
		url = getItem("url");

		// guide for first-time users and version info when there's an update
		if(getItem("version") != version || !getItem("version")) {
			document.querySelector("head").appendChild((() => {let something = document.createElement("style"); something.innerHTML = resources.guideCSS; return something;})());
			document.querySelector(".main-layout").appendChild((() => {
				let something = document.createElement("div"); something.innerHTML = resources.guidePart + (getItem("version") ? changes : resources.instructions) + "</span>";
				something.setAttribute("id", "guide");
				something.querySelector("#closeGuide").addEventListener("click", () => {document.querySelector("#guide").style.display="none";});
				return something;
			})());
			setItem("version", version);
		}
		
		if(getItem("bodyBackground") != "" && getItem("bodyBackground") != undefined) {
			setBackground(getItem("bodyBackground"));
		}

		// Stars!!
		if(getItem("starry") == 1) {
			starInit();
			for(i = 0; i < document.querySelectorAll(".r50d").length; i++) {
				document.querySelectorAll(".r50d")[i].style.opacity = 1;
			}
		}
		
		// Be honest, you probably did actually submit it on Turnitin.
		// As far as I remember, this is the oldest feature of the entire extension, along with changing the colour of the attendance indicator.
		for(i = 0; i < document.querySelectorAll(".itm .Error").length; i++) {
			document.querySelectorAll(".itm .Error")[i].innerText = "Uh did you submit on Turnitin or something?";
		}

		// RAINBOW
		var attendanceEls = document.querySelectorAll(".sdIndicator");
		/*for(i = 0; i < attendanceEls.length; i++) {
			attendanceEls[i].classList.add("attendance");
		}*/
		for(i = 0; i < attendanceEls.length; i++) {
			attendanceRainbows.push(new rainbow(attendanceEls[i], getItem("rainbowSpeed"), getItem("autoAttendanceRainbow") != 0 && getItem("autoAttendanceRainbow") ? 1 : 0));
		}
		setInterval(() => {for(let i = 0; i < attendanceRainbows.length; i++) {attendanceRainbows[i].update();}}, 20);
		setInterval(() => {for(let i = 0; i < attendanceRainbows.length; i++) {attendanceRainbows[i].changeDirection();}}, 5000);
		// Getting the element that describes the current time
		if(document.querySelector(".diaryWeek")) {
			document.querySelector(".diaryWeek").addEventListener("click", () => {
				alert("rgb(" + attendanceRainbow[0] + "," + (400 - attendanceRainbow[0] + attendanceRainbow[1]) / 2.5 + "," + (400 - attendanceRainbow[1]) + ")");
			});
		}
		if(document.querySelector(".diaryDay")) {
			const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			let date = Date().substr(11, 4) + "-" + (months.indexOf(Date().substr(4, 3)) < 10 ? "0" : "") + (months.indexOf(Date().substr(4, 3)) + 1) + "-" + Date().substr(8, 2);
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
					i++;
				}
			}
			// LangLit is evil (as is TOK)
			var evilEl;
			for(var i = 0; i < document.querySelectorAll(".L").length; i++) {
				let evils = ["ELZ", "ENG", "LLS", "LLH", "TTK"];
				let something = document.querySelectorAll(".L")[i];
				if(evils.indexOf(something.childNodes[1].childNodes[0].innerText.substr(0, 3)) != -1) {
					something.classList.add("evil");
					something.title = "Warning: this subject is evil. Clicking on its name will enable evil mode.";
				}
			}
			if(lessonEl != undefined) {
				lessonEl.style.transformOrigin = "50% 50%";
				lessonEl.style.borderRadius = "5px";
				// might change this one day
				lessonEl.innerHTML += "<style>" + resources.lessonAnimation + ".lessonEl {animation: lessonAnimation 10s infinite;}</style>";
				lessonEl.classList.add("lessonEl");
				document.querySelector(".lessonEl .t").addEventListener("click", () => {
					lessonEl.style.borderRadius = prompt("Enter the radius", "5px");
				});
			}
			for(i = 0; i < document.querySelectorAll(".evil").length; i++) {
				document.querySelectorAll(".evil .t")[i].addEventListener("click", () => {
					if(confirm("Are you sure you would like to enable evil mode? You will need to refresh the page to revert this.")) {
						addBug(1);
						if(document.querySelector("daymap-menu div, .header")) {
							document.querySelector("daymap-menu div, .header").style.background = "rgb(85, 2, 2)";
						}
						//document.querySelector(".menu-list li").style.background = "rgb(85, 2, 2)";
						//document.querySelector("daymap-menu div, .header").style.borderBottom = "rgb(0, 0, 0)";
						document.querySelector("#bodyUnderlay").style.background = "rgb(85, 10, 10)";
						{
							let something = document.createElement("div");
							something.setAttribute("class", "bodyOverlay");
							something.setAttribute("style", "background-color:rgba(113,13,13,0.5);width:100vw;height:100vh;position:fixed;pointer-events:none;bottom: 0px;");
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
			translucentness = parseFloat(getItem("translucentMode"));
			handleTranslucentness();
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
				for(i = 0; i < document.querySelectorAll(".msg").length; i++) {
					document.querySelectorAll(".msg")[i].style.border = "3px solid rgba(220, 220, 220, " + translucentness * 0.45 + ")";
				}
				for(i = 0; i < document.querySelectorAll(".msg").length; i++) {
					document.querySelectorAll(".msg")[i].style.background = thingy0();
				}
				if(blr && blr != 0) {
					for(i = 0; i < document.querySelectorAll(".msg").length; i++) {
						document.querySelectorAll(".msg")[i].style.backdropFilter = "blur(" + blr + "px)";
					}
				}
				for(i = 0; i < document.querySelectorAll(".item-container").length; i++) {
					document.querySelectorAll(".item-container")[i].style.background = "rgba(255, 255, 255, 0)";
				}
			}
			// Portfolio page
			for(i = 0; i < document.querySelectorAll(".body-114").length; i++) {
				document.querySelectorAll(".body-114")[i].style.background = "rgba(255, 255, 255, 0)";
			}
			if(document.querySelector(".msgBody")) {
				document.querySelector(".msgBody").style.background = thingy0();
			}
			if(document.querySelectorAll(".data-table, #tblAttendanceRate, #tblClasses, .rgMasterTable")) {
				for(i = 0; i < document.querySelectorAll(".data-table tbody tr th, #tblAttendanceRate tbody tr th, #tblClasses tbody tr th, .rgMasterTable thead tr th").length; i++) {
					document.querySelectorAll(".data-table tbody tr th, #tblAttendanceRate tbody tr th, #tblClasses tbody tr th, .rgMasterTable thead tr th")[i].style.backgroundColor = "rgba(0, 108, 190, " + (1 - (1 - translucentness) / 2) + ")";
				}
				for(i = 0; i < document.querySelectorAll(".data-table tbody tr:nth-child(even) td, #tblAttendanceRate tbody tr:nth-child(even) td, #tblClasses tbody tr:nth-child(even) td, .rgMasterTable tbody tr:nth-child(even) td").length; i++) {
					document.querySelectorAll(".data-table tbody tr:nth-child(even) td, #tblAttendanceRate tbody tr:nth-child(even) td, #tblClasses tbody tr:nth-child(even) td, .rgMasterTable tbody tr:nth-child(even) td")[i].style.backgroundColor = thingy0(21, 241, 1.5);
				}
				for(i = 0; i < document.querySelectorAll(".data-table tbody tr:nth-child(odd) td, #tblAttendanceRate tbody tr:nth-child(odd) td, #tblClasses tbody tr:nth-child(odd) td, .rgMasterTable tbody tr:nth-child(odd) td").length; i++) {
					document.querySelectorAll(".data-table tbody tr:nth-child(odd) td, #tblAttendanceRate tbody tr:nth-child(odd) td, #tblClasses tbody tr:nth-child(odd) td, .rgMasterTable tbody tr:nth-child(odd) td")[i].style.backgroundColor = thingy0(37, 233, 1.5);
				}
			}
		}, 100);
		// Reverts Daymap to the (better) original layout.
		if(getItem("originalLayout") && getItem("originalLayout") != 0) {
			originalLayout();
		}
		// For timetable view
		if(document.querySelector("#ctl00_cp_spnTimetable")) {
			for(i = 0; i < document.querySelectorAll("#tblTt tbody tr td").length; i++) {
				if(document.querySelectorAll("#tblTt tbody tr:nth-child(even) td")[i]) {
					document.querySelectorAll("#tblTt tbody tr:nth-child(even) td")[i].style.backgroundColor = thingy0(21, 241);
				}
				if(document.querySelectorAll("#tblTt tbody tr:nth-child(odd) td")[i]) {
					document.querySelectorAll("#tblTt tbody tr:nth-child(odd) td")[i].style.backgroundColor = thingy0();
				}
			}
			for(i = 0; i < document.querySelectorAll(".ttCell").length; i++) {
				document.querySelectorAll(".ttCell")[i].style.boxShadow = "0.5px 0.75px 1px rgba(0, 0, 0, 0.25)"
			}
		}
		// Profile picture thingy
		if(getItem("url") && document.querySelector(".photoThumb")) {
			document.querySelector(".photoThumb").style.background = `url(${getItem("url")}) 0 0 / contain no-repeat`;
			document.querySelector(".photoThumb").style.width = "100px";
			document.querySelector(".photoThumb").style.height = "120px";
		}
	});



browser.storage.onChanged.addListener((changes, areaName) => {
	if(areaName != "sync") {
		// Maybe something else in a future version?
		return;
	}
	if(!changed) {
		document.querySelector("head").appendChild((() => {let something = document.createElement("style"); something.innerHTML = resources.generalCSS2; return something;})());
		changed = 1;
	}
	for(let i = 0; i < Object.keys(changes).length; i++) {
		let z0 = Object.entries(changes)[i][1].newValue;
		//Object.assign(stork[Object.entries(changes)[i][0]], z0);
		switch(Object.entries(changes)[i][0]) {
			case "autoAttendanceRainbow":
				//completed
				for(let i = 0; i < attendanceRainbows.length; i++) {
					attendanceRainbows[i].toggle();
				}
				break;
			case "blurAmount":
				//completed
				for(i = 0; i < document.querySelectorAll(".msg").length; i++) {
					document.querySelectorAll(".msg")[i].style.backdropFilter = `blur(${z0}px)`;
				}
				for(i = 0; i < document.querySelectorAll(".card, .Toolbar").length; i++) {
					document.querySelectorAll(".card, .Toolbar")[i].style.backdropFilter = `blur(${z0}px)`;
				}
				if(document.querySelector("#headerThingy")) {
					document.querySelector("#headerThingy").querySelector(".header").style.backdropFilter = `blur(${z0}px)`;
				}
				blr = z0;
				handleTranslucentness();
				break;
			case "bodyBackground":
				//completed
				setBackground(z0);
				break;
			case "originalLayout":
				//completed...? TODO: test
				//location.reload(); // temp fix, people will probably not like this
				if(!z0) {
					document.querySelector("#headerThingy").style.display = "none";
					document.querySelector(".main-layout").style.marginLeft = formattingStuff[0];
					document.querySelector(".main-layout").style.marginTop = formattingStuff[1];
					for(i = 0; i < document.querySelectorAll(".card").length; i++) {
						document.querySelectorAll(".card")[i].style.border = formattingStuff[2][i];
						document.querySelectorAll(".card")[i].style.borderRadius = formattingStuff[3][i];
					}
					for(let i = 0; i < document.querySelectorAll(".stuffToAddBack").length; i++) {
						document.querySelectorAll(".stuffToAddBack")[i].style.display = "block";
					}
				} else if(z0) {
					if(!document.querySelector("#headerThingy")) {
						originalLayout();
					} else {
						document.querySelector(".main-layout").style.marginLeft = "0px";
						document.querySelector(".main-layout").style.marginTop = "38.2px";
						for(i = 0; i < document.querySelectorAll(".card").length; i++) {
							document.querySelectorAll(".card")[i].style.border = "1px solid " + (dark ? "gray" : "gainsboro");
							document.querySelectorAll(".card")[i].style.borderRadius = "4px";
						}
						document.querySelector("#headerThingy").style.display = "block";
					}
				}
				break;
			case "rainbowSpeed":
				//completed
				for(let i = 0; i < attendanceRainbows.length; i++) {
					attendanceRainbows[i].speed = Number(z0);
				}
				break;
			case "starry":
				//completed
				if(!z0 && starInterval) {
					window.clearInterval(starInterval); // saves resources
					for(i = 0; i < document.querySelectorAll(".r50d").length; i++) {
						document.querySelectorAll(".r50d")[i].style.opacity = 0;
					}
				} else if(z0) {
					starInit();
					for(i = 0; i < document.querySelectorAll(".r50d").length; i++) {
						document.querySelectorAll(".r50d")[i].style.opacity = 1;
					}
				}
				break;
			case "translucentMode":
				//completed
				translucentness = parseFloat(z0);
				handleTranslucentness();
				break;
			case "url":
				//completed
				url = (z0 ? z0 : "/DayMap/Images/profile-icon-grey.png");
				if(document.querySelector("#divUserAvatar")) {
					document.querySelector("#headerThingy").querySelector("#divUserAvatar").style.background = `url(${url}) center / cover no-repeat`;
				}
				if(document.querySelector(".photoThumb")) {
					document.querySelector(".photoThumb").style.background = `url(${url}) 0 0 / contain no-repeat`;
					document.querySelector(".photoThumb").style.width = "100px";
					document.querySelector(".photoThumb").style.height = "120px";
				}
				break;
		}
	}
})
