// this code has turned into a mess



"use strict";

const effects = {
    list: [
		[
			"blank",
			{
				colourgens: ["blank"],
				displayName: "-"
			}
		],
		[
			"starry",
			{
				colourgens:["uniform"],
				displayName: "Starry"
			}
		],
		[
			"indicator",
			{
				colourgens: ["weather", "custom"],
				displayName: "Rainbow indicators"
			}
		],
		[
			"bubbles", {
				colourgens: ["uniform"],
				displayName: "Bubbles"
			}
		],
		[
			"background",
			{
				colourgens: ["custom", "weather"],
				displayName: "Rainbow background"
			}
		 ]
	],
	colourgens: [
		[
			"blank",
			{
				displayName: "-",
				options: []
			}
		],
		[
			"uniform",
			{
				displayName: "Uniform random",
				options: []
			}
		],
		[
			"custom",
			{
				displayName: "Pastels",
				options: [
					{speed: 20}
				]
			}
		],
		[
			"weather",
			{
				displayName: "Classic",
				options: [
					{speed: 5}
				]
			}
		]
	]
};

/*const equals = (obj1, obj2) => {
	if(obj1 instanceof Iterator) {
		if(obj2 instanceof Iterator) {
			//if(obj1)
		}
		return 0;
	}
	if(obj1 instanceof Object) {
		if(obj2 instanceof Object) {
			let len, type;
			if(Object.getPrototypeOf(obj1) == Object.getPrototypeOf(obj2)) {
				if(Object.getPrototypeOf(obj1) == Object.prototype) {
					len = Object.keys(obj1).length;
					type = 0;
				} else {
					len = obj1.size;
				}
			} else {
				return 0;
			}
			if(obj1 instanceof Set && obj2 instanceof Set) {

			}
			for(; i < Object.keys(obj1).length; i++) {
				let entry = Object.entries(obj1)
				//if(obj1 instanceof)
			}
		}
		return 0;
	}
}*/

const calc = (bias2, c) => {
	let bias4 = (bias2[0] + bias2[1] + bias2[2] - 3) / 4 + 1;
	return rTrans(bias2[c] + 1, 100 / bias2[c] / bias4, 133 - 100 / bias2[c] / bias4);
}

const rTrans = (p, y, x) => {
	return Math.pow(Math.random(), p) * y + x;
}

const constrain = (num, min, max) => {
	return num < min ? min : num > max ? max : num;
}

var timeout = 0, lastChanged = 0, stor2, beforeunload = 0, r50d = [];

var port = browser.runtime.connect({name: "popup"}), storage = browser.storage.sync;

/*port.onDisconnect.addListener(() => {
	port = browser.runtime.connect({name: "popup"});
});*/

// Colour generation using Ntacc's super awesome colour generator
var bias2;

const squarinit = () => {
	bias2 = [rTrans(4, 3, 1), rTrans(3, 3, 1), rTrans(1, 3, 1)];
	let bias3 = Math.min(bias2[0], bias2[1], bias2[2]) - 1;
	bias3 = (bias3 > 0.3 ? bias3 : 0);
	bias2 = [bias2[0] - bias3, bias2[1] - bias3, bias2[2] - bias3];
}

squarinit();
var square, counter = 0, w = window.innerWidth, n = Math.floor(w / 40), m = n * 6, bugs;
for(let i = 0; i < m; i++) {
	let c = [Math.round(calc(bias2, 0)), Math.round(calc(bias2, 1)), Math.round(calc(bias2, 2))];
	square = document.createElement("div"),
	square.setAttribute("class", "square");
	square.setAttribute("style", "background: rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + ((i % n) / Math.pow(n, 4)) * Math.pow(i / 100 * n, 3.5) + ")");
	document.querySelector("#squares").appendChild(square);
}

square = document.querySelectorAll(".square");
const squareset = () => {
	let c = [Math.round(calc(bias2, 0)), Math.round(calc(bias2, 1)), Math.round(calc(bias2, 2))];
	while(square[counter].style.background.split(",")[3] == " 0)") {
		counter++;
	}
	square[counter].style.background = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + ((counter % n) / Math.pow(n, 4)) * Math.pow(counter / 100 * n, 3.5) + ")";
	counter++;
	if(counter >= m) {
		counter = 0;
		squarinit();
	}
}

async function addBug(id) {
	let bugs = (await browser.storage.sync.get()).bugs;
	if(!(bugs >> id & 1)) {
		storage.set({bugs: (bugs | (1 << id))});
	}
}

window.setInterval(squareset, 100);

const updateStor = (stor9) => {
	let stor8 = {};
	Object.assign(stor8, stor9);
	document.forms["toolbox"]["blurAmount"].value = parseFloat(document.forms["toolbox"]["blur"].value);
	document.forms["toolbox"]["rainbowSpeedAmount"].value = Math.round(parseFloat(Math.exp(document.forms["toolbox"]["rainbowSpeed"].value * 1)) * 1000) / 1000;
	document.forms["toolbox"]["translucent"].setAttribute("title", Math.round(document.forms["toolbox"]["translucent"].value * 100) + "%");
	stor8.bodyBackground = document.forms["toolbox"]["bodyBackground"].value;
	stor8.translucentMode = document.forms["toolbox"]["translucent"].value;
	stor8.blurAmount = document.forms["toolbox"]["blur"].value;
	stor8.rainbowSpeed = Math.round(parseFloat(Math.exp(document.forms["toolbox"]["rainbowSpeed"].value * 1)) * 1000) / 1000;
	stor8.url = document.forms["toolbox"]["url"].value;
	stor8.originalLayout = document.forms["toolbox"]["originalLayout"].checked ? 1 : 0;
	//stor8.cardColour = document.forms["toolbox"]["card"].value;
	Animation.map.forEach((animation) => {
		animation.getValues();
	});
	stor8.animations = Animation.export();
	return stor8;
}

const setStorage = () => {
	let stor0 = {};
	Object.assign(stor0, stor2);
	stor2 = updateStor(stor2);
	storage.set(setStorage2(stor0, stor2));
	//port.postMessage({newStor: stor2});
	browser.runtime.sendMessage({newStor: stor2, origin: "popup"});
	lastChanged = Date.now();
	timeout = 0;
}

// firefox and similar browsers set all the keys in the object, not just the ones that are different from the existing storage
// so we need to filter out the changes
const setStorage2 = (stor, stor5) => {
	let stor3 = {}, stor4 = {};
	/*for(let i = 0; i < Object.keys(stor).length; i++) {
		stor4[Object.keys(stor)[i]] = 1;
	}*/
	for(let i = 0; i < Object.keys(stor5).length; i++) {
		stor4[Object.keys(stor5)[i]] = 1;
	}
	stor4 = Object.keys(stor4);
	for(let i = 0; i < stor4.length; i++) {
		if(JSON.stringify(stor[stor4[i]]) != JSON.stringify(stor5[stor4[i]])) {
			stor3[stor4[i]] = stor5[stor4[i]];
		}
	}
	return stor3;
}

class Animation {
	constructor(type = "blank", colourgen = {type: "blank"}, args = null) {
		this.type = type;
		this.oldType = type;
		this.colourgen = colourgen;
		this.args = args;
		this.id = Animation.counter.toString();
		this.display();
		Animation.counter++;
		Animation.added.set(this.type, 1);
		if(Animation.map.size >= Animation.list.size - 2) {
			document.querySelector("#addAnimation").style.display = "none";
		}
		// not sure why, but creating a new Animation causes the event listeners for all the other ones to disappear
		Animation.map.forEach(animation => animation.addListener());
	}
	remove() {
		Animation.map.delete(this.id);
		Animation.added.delete(this.type);
		document.querySelector(`#animation${this.id}`).remove();
		document.querySelector("#addAnimation").style.display = "block";
		handleUpdate();
	}
	static list = new Map(effects.list);
	static colourgens = new Map(effects.colourgens);
	static counter = 0;
	static map = new Map();
	static added = new Map();
	static export() {
		let animations = [];
		Animation.map.forEach((animation) => {
			animations.push({type: animation.type, colourgen: animation.colourgen, args: animation.args});
		});
		return animations;
	}
	updateHTML() {
		let innerHTML = `<tr id="animation${this.id}">`;
		let colourgens = Animation.list.get(this.type).colourgens;
		innerHTML += `<td class="remove removeCol">-</td><td><select name="animationName${this.id}">`;
		Animation.list.forEach((value, key)=>{
			if(!Animation.added.get(key) || key == this.type) {
				innerHTML+=`<option value="${key}" ${key=="blank"?"disabled":""} ${this.type==key?" selected":""}>${value.displayName}</option>`;
			}
		});
		innerHTML += `</select></td><td><select name="colourgen${this.id}">`;
		if(this.oldType != this.type) {
			this.colourgen.type = colourgens[0];
		}
		for(let i = 0; i < colourgens.length; i++) {
			innerHTML += `<option value="${colourgens[i]}" ${colourgens[i]=="blank"?"disabled":""} ${this.colourgen.type==colourgens[i]?" selected":""}>${Animation.colourgens.get(colourgens[i]).displayName}</option>`;
		}
		innerHTML += "</select></td></tr>";
		this.HTML = innerHTML;

	}
	display() {
		this.updateHTML();
		document.querySelector("#animations").innerHTML += this.HTML;
		this.addListener();
	}
	addListener() {
		document.querySelector(`#animation${this.id}`).querySelector(".remove").addEventListener("click", () => {
			this.remove();
		});
	}
	updateEl() {
		this.updateHTML();
		document.querySelector(`#animation${this.id}`).outerHTML = this.HTML;
		this.addListener();
	}
	getValues() {
		Animation.added.delete(this.type);
		this.oldType = this.type;
		this.type = document.querySelector(`select[name="animationName${this.id}"]`).value;
		Animation.added.set(this.type, 1);
		this.colourgen = {type: document.querySelector(`select[name="colourgen${this.id}"]`).value};
		this.updateEl();
		return {colourgen: this.colourgen, type: this.type};
	}
}

const handleUpdate = () => {
	let stor0 = {};
	Object.assign(stor0, stor2);
	//port.postMessage({changes: setStorage2(stor0, updateStor(stor2)), stor: updateStor(stor2)});
	browser.runtime.sendMessage({changes: setStorage2(stor0, updateStor(stor2)), origin: "popup", stor: updateStor(stor2)})
		/* MAX_WRITE_OPERATIONS_PER_MINUTE is 120, or 2 per second */
	if(Date.now() - lastChanged <= 1000) {
		if(!timeout) {
			window.setTimeout(setStorage, (1000 - Date.now() + lastChanged));
			timeout = 1;
		}
	} else {
		setStorage();
	}
};

(async () => {
	return await browser.storage.sync.get();
})().then(stor1 => {
	stor2 = stor1;
	let stor6 = {};
	Object.assign(stor6, stor2);
	{
		let defaults = [
			["blurAmount", 0],
			["bodyBackground", ""],
			["translucentMode", 1],
			["rainbowSpeed", 20],
			["url", ""],
			["animations", []],
			["originalLayout", 0],
			//["card", "#E7F3F9"]
		];
		for(let i = 0; i < defaults.length; i++) {
			if(stor2[defaults[i][0]] == undefined) {
				stor2[defaults[i][0]] = defaults[i][1];
			}
		}
		if(stor2.autoAttendanceRainbow) {
			stor2.animations.push({colourgen: {type: "weather"}, type: "indicator"});
		}
		if (stor2.autoAttendanceRainbow !== undefined) {
			delete stor2.autoAttendanceRainbow;
			storage.remove("autoAttendanceRainbow");
		}
		if(stor2.starry) {
			stor2.animations.push({colourgen: {type: "uniform"}, type: "starry"});
		}
		if (stor2.starry !== undefined) {
			delete stor2.starry;
			storage.remove("autoAttendanceRainbow");
		}
	}
	storage.set(setStorage2(stor6, stor2));
	document.forms["toolbox"]["blurAmount"].value = stor2.blurAmount;
	document.forms["toolbox"]["bodyBackground"].value = stor2.bodyBackground;
	document.forms["toolbox"]["translucent"].setAttribute("value", stor2.translucentMode);
	document.forms["toolbox"]["translucent"].setAttribute("title", Math.round(stor2.translucentMode * 100) + "%");
	document.forms["toolbox"]["blur"].setAttribute("value", stor2.blurAmount);
	document.forms["toolbox"]["rainbowSpeed"].setAttribute("value", Math.log(stor2.rainbowSpeed * 1));
	document.forms["toolbox"]["rainbowSpeedAmount"].setAttribute("value", stor2.rainbowSpeed * 1);
	document.forms["toolbox"]["url"].value = stor2.url;
	document.forms["toolbox"]["originalLayout"].checked = (stor2.originalLayout != 0 && stor2.originalLayout);
	//document.forms["toolbox"]["card"].value = stor2.card;
	for(let i = 0; i < stor2.animations.length; i++) {
		Animation.added.set(stor2.animations[i].type, 1);
	}
	for(let i = 0; i < stor2.animations.length; i++) {
		Animation.map.set(i.toString(), new Animation(stor2.animations[i].type, stor2.animations[i].colourgen, stor2.animations[i].args));
	}

	document.querySelector("form").addEventListener("input", handleUpdate);
});

var open = 0;

const z = () => {
	document.querySelector("#squares").setAttribute("class", (open ? "disappear" : ""));
	if(open == 0) {
		for(let i = 0; i < m; i++) {
			squareset();
		}
	}
}

for(let i = 0; i < document.querySelectorAll(".show").length; i++) {
	document.querySelectorAll(".show")[i].addEventListener("click", () => {
		open ^= 1 << i;
		let on = open >> i & 1;
		document.querySelectorAll(".stuff")[i].style.display = (on ? "block" : "none");
		let text = document.querySelectorAll(".show span")[i].innerText;
		document.querySelectorAll(".show span")[i].innerText = text.replace((on ? /Show/ : /Hide/), (on ? "Hide": "Show"));
		z();
	});
}

// failed attempt on making a rainbow. into the bug book it goes; also actually successful attempt is here too
var bightfield = 0, bights = 5, aconst = 0, bites = [];
for(let i = 0; i < bights; i++) {
	bightfield |= parseInt(255 / (bights - 1) * i) << (i * 8);
	aconst |= 1 << (i * 8);
	bites.push(parseInt(360 / bights * i));
}


window.setInterval(() => {
	let gradstr = "linear-gradient(135deg", gradstring = gradstr;
	for(let i = 0; i < bights; i++) {
		gradstr += ",hsl(";
		gradstring += ",hsl(";
		let bight = (bightfield >> (i * 8)) % 256;
		if(bight == 255) {
			bightfield ^= 255 << (i * 8);
		}
		gradstr += bight;
		gradstr += ",50%,50%)";
		bites[i] = (bites[i] + 5) % 360;
		gradstring += bites[i];
		gradstring += ",50%,60%)";
	}
	//document.querySelector("#rlagginexia").style.backgroundImage = gradstr + ")";
	document.querySelector("#bbheader").style.backgroundImage = gradstring + ")";
	bightfield += aconst;
}, 50);

document.querySelector("#showsongbook").addEventListener("click", () => {
	addBug(0);
});

document.querySelector("#addAnimation").addEventListener("click", () => {
	Animation.map.set(Animation.counter.toString(), new Animation());
});

// changes may be lost if the popup is closed within 501ms of the last change
// there's no way around this without a background script
// but if we use daymapGraphics.js as a background script it's close enough because who even uses the popup without Daymap open
