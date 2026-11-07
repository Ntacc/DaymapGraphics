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
 * 8.1.0 *   Used messages to sync changes live more smoothly than detecting storage changes, added effects menu, alongside the bubbles and background rainbow effects, added background script (Firefox)/service worker (Chromium) for message passing and setting storage when the popup menu is closed.
 * 8.1.1 *   Improved bubble performance by using 3D transformations and opacity in @keyframes instead of constantly modifying top, width, height, and background. Fixed an issue where closing a page caused the background script to break. Effects menu now always chooses the default colour generator when switching effects. transition: all; on script injection instead on settings change.


/*
 * TODO
 * PRI: 0 is maximum priority, 4 is minimum priority
 * CAT:
 * * 0 is a feature to be added or GUI change
 * * 1 is a bug
 * * 2 is safety (limiting unwanted behaviour in uncommon cases)
 * * 3 is anything else
 * 0 is minimum difficulty, 7 is maximum difficulty
 * PRI  CAT  TASK
 * 4    0    Presets
 * 2    1    Fix calendar opacity (?? haven't tested... no clue if it's still broken)
 * -    0    More animations
 * 3    -    * Shimmery thingy
 * 3    -    * Snowflakes
 * 4    -    * Fireflies?
 * 0    2    Change the way the profile picture URL is added to the header (in case of quotes)
 * 1    0    Detailed guide for CSS
 * 0    0    Display effects menu as a tree to allow space for different options
 * 0    2    Robust object comparator for setStorage2
 * 1    2    Get dark mode cookie by name
 * 2    1    Dark mode header is not translucent
 * 2    1    Dark mode original layout buttons are white on hover
 * 4    1    Original layout breaks when changed rapidly


/*
 * COMPATIBILITY
 * Compatible (tested):
 * * Chromium 148+ (Blink/V8)
 * * Google Chrome (Blink/V8)
 * * MSEdge (Blink/V8)
 * * Firefox (Gecko/Quantum/Servo/SpiderMonkey)
 * Prepare for release on:
 * * Firefox (Gecko/Quantum/Servo/SpiderMonkey)
 * * MSEdge (Blink/V8)
 * * Opera (Blink/V8)
 * Test compatibility with:
 * * Brave (Blink/V8)
 * * Opera (Blink/V8)


/*
 * STUFF THAT WON'T BE IMPLEMENTED
 * WebKit compatibility


/*
 * CHECKLIST BEFORE PUSHING UPDATE
 * Change changelog
 * Change version and changes variables
 * Change manifest.json version
 * Check popup.html
*/









'use strict';

const version = "8.1";
const changes = "Daymap Graphics 8.1: Effects menu and pastel theme!";

const constrain = (num, min, max) => {
	return num < min ? min : num > max ? max : num;
}

var lessonStart, lessonEnd, date, classEls = [], i, anything = [], r50d = [], dark, translucentness, starInterval, stork = {}, blr, attendanceRainbows = [], test, url, resources, formattingStuff = [], changed = 0, animations = new Map(), background, tickSpeed = 20, tickn = 0, storage = browser.storage.sync, scrollHeight;

//var port = browser.runtime.connect({name: "contentScript"});

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
const rTrans = (y, x = 0, p = 1) => {
	return Math.pow(Math.random(), p) * y + x;
}


// Ntacc's super awesome colour generator
const calc = (bias2, c, m = 255, y = 150) => {
	let bias4 = (bias2[0] + bias2[1] + bias2[2] - 3) / 4 + 1;
	return rTrans(y / bias2[c] / bias4, m - y / bias2[c] / bias4, bias2[c] + 1);
}

const ntcolourgen = (bias2, m = 255, y = 150) => {
	let bias3 = Math.min(bias2[0], bias2[1], bias2[2]) - 1;
	bias3 = (bias3 > 0.3 ? bias3 : 0);
	bias2 = [bias2[0] - bias3, bias2[1] - bias3, bias2[2] - bias3];
	let c;
	do {
		c = [Math.round(calc(bias2, 0, m, y)), Math.round(calc(bias2, 1, m, y)), Math.round(calc(bias2, 2, m, y))];
	} while (c.reduce((a, b) => {return Math.max(a, b)}) - c.reduce((a, b) => {return Math.min(a, b)}) < 20);
	return c;
}

// each colour in the rainbow is stored as a point on a 2D colour space (point in a square in a euclidean space), not all colours are represented
// this is to make it look nicer by choice of the colour space, that I found in a program by @WeatherWonders on Khan Academy
// "move" and "changeDirection" just change where the point is in that colour space (as if moving through a euclidean space)
class Rainbow {
	constructor(el, speed, on, n, colourgen, m, y) {
		this.el = el, this.speed = speed, this.data = [], this.on = on, this.colours = [], this.targets = [], this.bias2 = [rTrans(4, 3, 1), rTrans(3, 3, 1), rTrans(1, 3, 1)], this.timer = Date.now(), this.n = n, this.rotate = true, this.colourgen = colourgen, this.m = m, this.y = y;
		for(let i = 0; i < this.n; i++) {
			this.data[i] = [rTrans(400), rTrans(400), rTrans(0.5, 0.25), rTrans(0.5, 0.25)]; // Colour, colour, direction, direction
			this.colours.push(ntcolourgen(this.bias2, this.m, this.y));
			this.targets.push(ntcolourgen(this.bias2, this.m, this.y));
		}
	}
	colour(i) {
		switch(this.colourgen.type) {
			case "weather":
				return `${(this.data[i][0])},${((400-this.data[i][0]+this.data[i][1])/2.5)},${(400-this.data[i][1])}`;
			case "custom":
				return `${this.colours[i][0]},${this.colours[i][1]},${this.colours[i][2]}`;
		}
	};
	move(num) {
		switch(this.colourgen.type) {
			case "weather":
				this.data[num][0] += rTrans(1, -this.data[num][2]) * this.speed;
				this.data[num][1] += rTrans(1, -this.data[num][3]) * this.speed;
				this.data[num][0] = constrain(this.data[num][0], 0, 400);
				this.data[num][1] = constrain(this.data[num][1], 0, 400);
				break;
			case "custom":
				for(let i = 0; i < this.n; i++) {
					for(let j = 0; j < 3; j++) {
						this.colours[i][j] += (this.targets[i][j] - this.colours[i][j]) * this.speed / 5000;
					}
				}
				break;
		}
	};
	update() { // In case you were confused about those huge lines in the previous versions, this is sort of what they look like individually
		if(this.on) {
			let grad = "linear-gradient(" + this.data[0][0] + "deg";
			for(let i = 0; i < this.n; i++) {
				this.move(i);
				grad += `,rgb(${this.colour(i)})${((i-1)*75)}%`;
			}
			this.el.style.backgroundImage = grad + ")";
			if(Date.now() > this.timer + 5000 * tickSpeed / this.speed) {
				this.changeDirection();
				this.timer = Date.now();
			}
		}
	};
	toggle(on = -1) {
		this.on = (on < 0 ? this.on ^ 1 : on);
		if(!this.on) {
			this.el.style.backgroundImage = "";
		}
	}
	changeDirection() {
		switch(this.colourgen.type) {
			case "weather":
				for(let i = 0; i < this.n; i++) {
					this.data[i][2] = rTrans(0.5, 0.25);
					this.data[i][3] = rTrans(0.5, 0.25);
				}
				break;
			case "custom":
				this.bias2 = [rTrans(4, 3, 1), rTrans(3, 3, 1), rTrans(1, 3, 1)];
				for(let i = 0; i < this.n; i++) {
					this.targets[i] = ntcolourgen(this.bias2, this.m, this.y);
				}
				break;
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
	}, 60);
};

class Bubble {
	constructor() {
		this.r = rTrans(50, 50);
		this.speed = rTrans(100, 50);
		this.end = Date.now() + this.speed * 1000;
		this.c = [rTrans(255), rTrans(255), rTrans(255), rTrans(1/20, 0.02)];
		this.el = document.createElement("div");
		this.el.style.borderRadius = "50%";
		this.el.style.position = "absolute";
		this.el.style.animation = `bubbleAnimation ${this.speed}s ease-in`;
		this.el.style.left = rTrans(document.body.scrollWidth + this.r * 2, -this.r) + "px";
		this.el.style.top = document.body.scrollHeight + this.r + "px";
		this.el.style.width = this.r + "px";
		this.el.style.height = this.r + "px";
		this.el.style.background = "rgba(" + this.c[0] + "," + this.c[1] + "," + this.c[2] + "," + this.c[3] + ")";
		this.el = document.querySelector("#bubbles").appendChild(this.el);
		this.id = Bubble.counter;
		Bubble.list.set(Bubble.counter, this);
		Bubble.counter++;
	}
	static collectGarbage() {
		Bubble.list.forEach(bubble => {
			let now = Date.now();
			if(now > bubble.end) {
				bubble.el.remove();
				Bubble.list.delete(bubble.id);
			}
		});
	}
	static list = new Map();
	static counter = 0;
	static on = 0;
	static tickrate = 2;
	static updateAll() {
		//Bubble.list.forEach(bubble => bubble.update());
		if(Math.random() <= 0.01 * Bubble.tickrate) {
			new Bubble();
		}
	}
	static toggle(on) {
		Bubble.on = on;
		if(on) {
			document.querySelector("#bubbles").style.visibility = "visible";
		} else {
			document.querySelector("#bubbles").style.visibility = "hidden";
		}
	}
}

const setBackground = (bg, exists) => {
	let bg2 = (exists ? background : bg);
	if(!exists) {
		background = bg;
	}
	if(bg2 == "surprise me") {
		document.querySelector("#bodyUnderlay").style.background = resources.backgrounds[Math.floor(rTrans(3))];
	} else {
		document.querySelector("#bodyUnderlay").style.background = bg2;
	}
}



// this is what the background thing modifies
let bodyUnderlay = document.createElement("div");
bodyUnderlay.setAttribute("id", "bodyUnderlay");
bodyUnderlay.appendChild(document.createElement("div"));
bodyUnderlay.querySelector("div").setAttribute("id", "bubbles");
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
	r50d.push("1," + Math.random() / 100 + "," + anything[5] + "," + (Math.random() - 0.5) * 5);
}

const iterate = (selector, cb, scope = document) => {
	for(let i = 0; i < scope.querySelectorAll(selector).length; i++) {
		cb(scope.querySelectorAll(selector)[i]);
	}
}

const handleTranslucentness = () => { // Yes I know it's written translucency
	iterate(".card, .msg, .ditm, .Toolbar, #cntDiary, .tabPage", a => {a.style.background = thingy0()});
	iterate(".item-container, .tabList div a, .rgGroupPanel td td", a => {a.style.background = "rgba(255, 255, 255, 0)"});
	iterate(".hasDatepicker, #divInbox, .Left", a => {a.style.backgroundColor = thingy0(37, 233, 0.7)});
	iterate(".ditm, .Toolbar", a => {a.style.outline = "3px solid rgba(250, 250, 250, " + translucentness * 0.45 + ")"});
	if(document.querySelector("#bCalendar")) {
		document.querySelector("#bCalendar").style.backgroundColor = "rgba(31, 157, 217, " + translucentness * 1.6 + ")";
		document.querySelector("#btnDiary").style.backgroundColor = "rgba(31, 157, 217, " + translucentness * 1.6 + ")";
	}
	if(blr && blr != 0) {
		iterate(".card, .Toolbar", a => {a.style.backdropFilter = "blur(" + blr + "px)"});
	}
	iterate(".nav-container, .nav-user-container, .rgGroupPanel td", a => {a.style.backgroundColor = thingy0(37, 233, 0.7)});
	if(document.querySelector("#headerThingy")) {
		let header = document.querySelector("#headerThingy");
		iterate("td", a => {a.style.backgroundColor = thingy0(37, 233, 1.2)}, header);
		header.querySelector(".header").style.backgroundColor = thingy0(37, 233, 1.3);
		header.querySelector(".header").style.backdropFilter = "blur(" + blr + "px)";
	}
	// Sometimes Daymap code loads slower than Daymap Graphics code does, so this just makes sure that the elements exist before changing them
	var headerInterval = window.setInterval(() => {
		try {
			document.querySelector("daymap-header").style.backgroundColor = "rgba(255, 255, 255, " + translucentness * 1.2 + ")";
			document.querySelector("daymap-header").style.backdropFilter = "blur(" + blr * 3 + "px)";
			iterate("daymap-header div ul li", a => {a.style.backgroundColor = "rgba(255, 255, 255, " + translucentness * 0.8 + ")"});
			iterate(".diaryEvents, #divDiaryDay, .PlanDay", a => {a.style.background = thingy0()});
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
	let bugs = (await storage.get()).bugs;
	if(!(bugs >> id & 1)) {
		storage.set({"bugs": (bugs | (1 << id))});
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
			iterate("header", a => {
				a.classList.add("stuffToAddBack");
				a.style.display = "none";
			});
		} else if (!document.querySelector(".header-announcements[style='display:block']")) {
			window.clearInterval(megaphone);
			iterate("header", a => {
				a.classList.add("stuffToAddBack");
				a.style.display = "none";
			});
		}
	}, 100);
	// Adds the header from the old Daymap after the other one's been removed
	let headerInterval2 = window.setInterval(() => {
		if(document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count") || test) {
			document.querySelector("body").prepend((() => {
				let header = document.createElement("div");
				header.setAttribute("id", "headerThingy");
				header.innerHTML = resources.header[0] + (!document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count.hidden") ? `<div class="notification-amount" title="New messages"> ${(document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count") ? document.querySelector("daymap-nav-item[menu-id='1151'] .menu-item-container .menu-item .menu-message-count").innerHTML : ``)}</div>` : ``) + (url ? resources.header[1].replaceAll("/DayMap/Images/profile-icon-grey.png", url) : resources.header[1]) + (document.querySelector(".name-text") ? document.querySelector(".name-text").innerHTML : "") + resources.header[2];
				iterate("daymap-nav", a => {
					a.classList.add("stuffToAddBack");
					a.style.display = "none";
				});
				iterate("daymap-menu", a => {
					a.classList.add("stuffToAddBack");
					a.style.display = "none";
				});
				formattingStuff = [document.querySelector(".main-layout").style.marginLeft, document.querySelector(".main-layout").style.marginTop, [], []];
				document.querySelector(".main-layout").style.marginLeft = "0px";
				document.querySelector(".main-layout").style.marginTop = "38.2px";
				iterate(".card", a => {
					formattingStuff[2].push(a.style.border);
					formattingStuff[3].push(a.style.borderRadius);
					a.style.border = "1px solid " + (dark ? "gray" : "gainsboro");
					a.style.borderRadius = "4px";
				});
				iterate("td", a => {a.style.backgroundColor = thingy0(37, 233, 1.2)}, header);
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

function tick() {
	for(let i = 0; i < attendanceRainbows.length; i++) {
		attendanceRainbows[i].update();
	}
	if(Bubble.on && tickn % Bubble.tickrate == 0) {
		Bubble.updateAll();
	}
	if(Bubble.on && tickn % 1000 == 0) {
		Bubble.collectGarbage();
	}
	if(document.body.scrollHeight != scrollHeight) {
		scrollHeight = document.body.scrollHeight;
		document.querySelector("#scrollHeight").innerHTML = `
			:root {
				--scrollHeight: ${scrollHeight}px;
			};`
	}
	tickn++;
}

document.querySelector("head").appendChild((() => {
	let something = document.createElement("style");
	something.setAttribute("id", "scrollHeight");
	return something;
})());

// Probably bad practice but this was the only way I could find to get the storage and use it without .then every time or making the entire code asynchronous (which would break the code).
(async () => {
	return [await storage.get(), JSON.parse((await (await window.fetch(browser.runtime.getURL("resources.json"))).text()).replaceAll(/\n/g,""))];
})()
	.then(inputs => {
		let stor2 = inputs[0];
		Object.assign(stork, inputs[0]);
		resources = inputs[1];
		blr = stor2.blurAmount;
		url = stor2.url;
		if(!stor2.animations) {
			stor2.animations = [];
		}
		if(stor2.autoAttendanceRainbow) {
			stor2.animations.push({type: "indicator", colourgen: {type: "weather"}});
			storage.remove("autoAttendanceRainbow");
		} else if (stor2.autoAttendanceRainbow !== undefined) {
			storage.remove("autoAttendanceRainbow");
		}
		if(stor2.starry) {
			stor2.animations.push({type: "starry", colourgen: {type: "uniform"}});
			storage.remove("starry");
		} else if (stor2.starry !== undefined) {
			storage.remove("starry");
		}
		for(let i = 0; i < stor2.animations.length; i++) {
			animations.set(stor2.animations[i].type, stor2.animations[i]);
		}
		storage.set({animations: stor2.animations});

		document.querySelector("head").appendChild((() => {
			let something = document.createElement("style");
			something.innerHTML = resources.generalCSS;
			return something;
		})());

		// guide for first-time users and version info when there's an update
		if(stor2.version != version || !stor2.version) {
			document.querySelector(".main-layout").appendChild((() => {
				let something = document.createElement("div"); something.innerHTML = resources.guidePart + (stor2.version ? changes : resources.instructions) + "</span>";
				something.setAttribute("id", "guide");
				something.querySelector("#closeGuide").addEventListener("click", () => {document.querySelector("#guide").style.display="none";});
				return something;
			})());
			storage.set({"version": version});
		}

		if(stor2.bodyBackground != "" && stor2.bodyBackground != undefined) {
			setBackground(stor2.bodyBackground, 0);
		}

		// Stars!!
		if(animations.get("starry")) {
			starInit();
			for(i = 0; i < document.querySelectorAll(".r50d").length; i++) {
				document.querySelectorAll(".r50d")[i].style.opacity = 1;
			}
		}

		if(animations.get("bubbles")) {
			Bubble.on = 1;
		}

		// Be honest, you probably did actually submit it on Turnitin.
		// As far as I remember, this is the oldest feature of the entire extension, along with changing the colour of the attendance indicator.
		iterate(".itm .error", a => {a.innerText = "Uh did you submit on Turnitin or something?"});

		// RAINBOW
		var attendanceEls = document.querySelectorAll(".sdIndicator");
		for(i = 0; i < attendanceEls.length; i++) {
			attendanceRainbows.push(new Rainbow(attendanceEls[i], stor2.rainbowSpeed, animations.get("indicator") != 0 && animations.get("indicator") ? 1 : 0, 3, (animations.get("indicator") ? animations.get("indicator").colourgen : {type: "custom"}), 220, 70));
		}
		attendanceRainbows.push(new Rainbow(document.querySelector("#bodyUnderlay"), stor2.rainbowSpeed, (animations.get("background") ? 1 : 0), 3, (animations.get("background") ? animations.get("background").colourgen : {type: "custom"}), 255, 150));

		// Getting the element that describes the current time
		if(document.querySelector(".diaryDay")) {
			const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			let date = Date().substr(11, 4) + "-" + (months.indexOf(Date().substr(4, 3)) < 10 ? "0" : "") + (months.indexOf(Date().substr(4, 3)) + 1) + "-" + Date().substr(8, 2);
			let time = Number(Date().substr(16, 2) + Date().substr(19, 2));
			if(document.querySelector(".diaryDay[data-date='"+date+"']")) {
				let lessonEls = [];
					// to do: check if there's a way to rewrite this as siblings
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
			iterate(".L", a => {
				let evils = ["ELZ", "ENG", "LLS", "LLH", "TTK"];
				if(evils.indexOf(a.childNodes[1].childNodes[0].innerText.substr(0, 3)) != -1) {
					a.classList.add("evil");
					a.title = "Warning: this subject is evil. Clicking on its name will enable evil mode.";
				}
			});
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
						iterate(".grid div", a => {a.style.background = "rgb(100, 20, 40)"});
						iterate(".list-item-heading", a => {a.innerText = "Mua ha ha ha!"});
						iterate(".list-item-meta", a => {a.innerText = "Always."});
						iterate(".description", a => {a.innerText = "Daymap bows down to my power."});
					}
				});
			}
		}

		// Translucency effect
		if(stor2.translucentMode && parseFloat(stor2.translucentMode) < 1) {
			translucentness = parseFloat(stor2.translucentMode);
			handleTranslucentness();
		}
		window.setInterval(() => { // 0-1ms per iteration, 7-8ms if condition is met
			// Reverting the messages to how they looked previously.
			if(document.querySelector(".fa-mail-bulk") ? document.querySelector(".fa-mail-bulk").outerHTML.indexOf("img") == -1 : 0) {
				iterate(".fa-mail-bulk", a => {a.outerHTML = "<img src='https://qasmt.eq.daymap.net/Daymap/images/coms/post32.png'/>"});
				iterate(".img-container .fa-comment-alt", a => {a.outerHTML = "<img src='https://qasmt.eq.daymap.net/Daymap/images/coms/newmsg.png'/>"});
				iterate(".fa-comment-alt-dots", a => {a.outerHTML = "<img src='https://qasmt.eq.daymap.net/Daymap/images/coms/newmsg.png'/>"});
				iterate(".fa-paperclip", a => {a.outerHTML = "<img src='https://qasmt.eq.daymap.net/Daymap/images/buttons/attachment.gif'/>"});
				iterate(".msg", a => {a.style.border = "3px solid rgba(220, 220, 220, " + translucentness * 0.45 + ")"; a.style.background = thingy0();});
				if(blr && blr != 0) {
					iterate(".msg", a => {a.style.backdropFilter = "blur(" + blr + "px)"});
				}
				iterate(".item-container", a => {a.style.background = "rgba(255, 255, 255, 0)"});
			}
			// Portfolio page
			iterate(".body-114", a => {a.style.background = "rgba(255, 255, 255, 0)"});
			iterate(".msgBody", a => {a.style.background = thingy0()});
			if(document.querySelector(".data-table, #tblAttendanceRate, #tblClasses, .rgMasterTable")) {
				iterate(".data-table tbody tr th, #tblAttendanceRate tbody tr th, #tblClasses tbody tr th, .rgMasterTable thead tr th", a => {a.style.backgroundColor = "rgba(0, 108, 190, " + (1 - (1 - translucentness) / 2) + ")"});
				iterate(".data-table tbody tr:nth-child(even) td, #tblAttendanceRate tbody tr:nth-child(even) td, #tblClasses tbody tr:nth-child(even) td, .rgMasterTable tbody tr:nth-child(even) td", a => {a.style.backgroundColor = thingy0(21, 241, 1.5)});
				iterate(".data-table tbody tr:nth-child(odd) td, #tblAttendanceRate tbody tr:nth-child(odd) td, #tblClasses tbody tr:nth-child(odd) td, .rgMasterTable tbody tr:nth-child(odd) td", a => {a.style.backgroundColor = thingy0(37, 233, 1.5)});
			}
		}, 100);
		// Reverts Daymap to the (better) original layout.
		if(stor2.originalLayout && stor2.originalLayout != 0) {
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
			iterate(".ttCell", a => {a.style.boxShadow = "0.5px 0.75px 1px rgba(0, 0, 0, 0.25)"});
		}
		// Profile picture thingy
		if(stor2.url && document.querySelector(".photoThumb")) {
			document.querySelector(".photoThumb").style.background = `url(${stor2.url}) 0 0 / contain no-repeat`;
			document.querySelector(".photoThumb").style.width = "100px";
			document.querySelector(".photoThumb").style.height = "120px";
		}
		iterate(".nav-user-image", a => {a.style.backgroundImage = `url(${url}) center / cover no-repeat`});
	});

setInterval(tick, tickSpeed);

function onChanged(changes) {
	if(!changed) {
		//document.querySelector("head").appendChild((() => {let something = document.createElement("style"); something.innerHTML = resources.generalCSS2; return something;})());
		changed = 1;
	}
	for(let i = 0; i < Object.keys(changes).length; i++) {
		let z0 = Object.entries(changes)[i][1];
		//Object.assign(stork[Object.entries(changes)[i][0]], z0);
		switch(Object.entries(changes)[i][0]) {
			case "blurAmount":
				//completed
				iterate(".msg", a => {a.style.backdropFilter = `blur(${z0}px)`});
				iterate(".card, .Toolbar", a => {a.style.backdropFilter = `blur(${z0}px)`});
				iterate("#headerThingy .header", a => {a.style.backdropFilter = `blur(${z0}px)`});
				blr = z0;
				handleTranslucentness();
				break;
			case "bodyBackground":
				//completed
				setBackground(z0, 0);
				break;
			case "originalLayout":
				//completed i guess
				if(!z0) {
					document.querySelector("#headerThingy").style.display = "none";
					document.querySelector(".main-layout").style.marginLeft = formattingStuff[0];
					document.querySelector(".main-layout").style.marginTop = formattingStuff[1];
					for(let j = 0; j < document.querySelectorAll(".card").length; j++) {
						document.querySelectorAll(".card")[i].style.border = formattingStuff[2][i];
						document.querySelectorAll(".card")[i].style.borderRadius = formattingStuff[3][i];
					}
					iterate(".stuffToAddBack", a => {a.style.display = "block"});
				} else if(z0) {
					if(!document.querySelector("#headerThingy")) {
						originalLayout();
					} else {
						document.querySelector(".main-layout").style.marginLeft = "0px";
						document.querySelector(".main-layout").style.marginTop = "38.2px";
						iterate(".card", a => {
							a.style.border = "1px solid " + (dark ? "gray" : "gainsboro");
							a.style.borderRadius = "4px";
						});
						document.querySelector("#headerThingy").style.display = "block";
					}
				}
				break;
			case "rainbowSpeed":
				//completed
				for(let j = 0; j < attendanceRainbows.length; j++) {
					attendanceRainbows[j].speed = Number(z0);
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
					iterate(".nav-user-image", a => {a.style.background = `url(${url}) center / cover no-repeat`});
				break;
			case "animations":
				animations = new Map();
				for(let j = 0; j < z0.length; j++) {
					animations.set(z0[j].type, z0[j]);
				}
				if(animations.get("indicator")) {
					for(let j = 0; j < attendanceRainbows.length - 1; j++) {
						attendanceRainbows[j].colourgen = animations.get("indicator").colourgen;
						attendanceRainbows[j].toggle(1);
					}
				} else {
					for(let j = 0; j < attendanceRainbows.length - 1; j++) {
						attendanceRainbows[j].toggle(0);
					}
				}
				if(animations.get("background")) {
					attendanceRainbows[attendanceRainbows.length - 1].colourgen = animations.get("background").colourgen;
					attendanceRainbows[attendanceRainbows.length - 1].toggle(1);
				} else {
					attendanceRainbows[attendanceRainbows.length - 1].toggle(0);
					setBackground(1, 1);
				}
				if(!animations.get("starry") && starInterval) {
					window.clearInterval(starInterval); // saves resources
					for(let j = 0; j < document.querySelectorAll(".r50d").length; j++) {
						document.querySelectorAll(".r50d")[j].style.opacity = 0;
					}
				} else if(animations.get("starry")) {
					starInit();
					for(let j = 0; j < document.querySelectorAll(".r50d").length; j++) {
						document.querySelectorAll(".r50d")[j].style.opacity = 1;
					}
				}
				if(animations.get("bubbles")) {
					Bubble.toggle(1);
				} else {
					Bubble.toggle(0);
				}
				break;
		}
	}
};

browser.runtime.sendMessage({origin: "contentScript"});

browser.runtime.onMessage.addListener((message) => {
	if(message.origin == "background") {
		if(message.message.changes) {
			onChanged(message.message.changes);
		}
	}
});
