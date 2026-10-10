"use strict";

const setItem = (key, value) => {
	browser.storage.sync.set({[key]: value});
};

const calc = (bias2, c) => {
	let bias4 = (bias2[0] + bias2[1] + bias2[2] - 3) / 4 + 1;
	return rTrans(bias2[c] + 1, 100 / bias2[c] / bias4, 133 - 100 / bias2[c] / bias4);
}

const rTrans = (p, y, x) => {
	return Math.pow(Math.random(), p) * y + x;
}

var timeout = 0, lastChanged = 0, stor2;

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
		setItem("bugs", (bugs | (1 << id)));
	}
}

window.setInterval(squareset, 100);

const setStorage = () => {
	document.forms["toolbox"]["blurAmount"].value = parseFloat(document.forms["toolbox"]["blur"].value);
	document.forms["toolbox"]["rainbowSpeedAmount"].value = Math.round(parseFloat(Math.exp(document.forms["toolbox"]["rainbowSpeed"].value * 1)) * 1000) / 1000;
	document.forms["toolbox"]["translucent"].setAttribute("title", Math.round(document.forms["toolbox"]["translucent"].value * 100) + "%");
	stor2.bodyBackground = document.forms["toolbox"]["bodyBackground"].value;
	stor2.translucentMode = document.forms["toolbox"]["translucent"].value;
	stor2.blurAmount = document.forms["toolbox"]["blur"].value;
	stor2.rainbowSpeed = Math.round(parseFloat(Math.exp(document.forms["toolbox"]["rainbowSpeed"].value * 1)) * 1000) / 1000;
	stor2.url = document.forms["toolbox"]["url"].value;
	stor2.originalLayout = document.forms["toolbox"]["originalLayout"].checked ? 1 : 0;
	stor2.autoAttendanceRainbow = document.forms["toolbox"]["autoAttendanceRainbow"].checked ? 1 : 0;
	stor2.starry = document.forms["toolbox"]["starry"].checked ? 1 : 0;
	browser.storage.sync.set(stor2).catch(() => {console.log("hi");document.querySelector("#quotawarning").style.display = "block"});
	lastChanged = Date.now();
	timeout = 0;
}

(async () => {
	return await browser.storage.sync.get();
})().then(storage => {
	let getItem = (key) => {return storage[key]};
	let stor1 = storage;
	stor2 = stor1;
	if(getItem("blurAmount") == undefined) {
		stor1.blurAmount = 0;
	}
	if(getItem("bodyBackground") == undefined) {
		stor1.bodyBackground = "";
	}
	if(getItem("translucentMode") == undefined) {
		stor1.translucentMode = 1;
	}
	if(getItem("rainbowSpeed") == undefined) {
		stor1.rainbowSpeed = 20;
	}
	if(getItem("url") == undefined) {
		stor1.url = "";
	}
	if(getItem("autoAttendanceRainbow") == undefined) {
		stor1.autoAttendanceRainbow = 0;
	}
	if(getItem("originalLayout") == undefined) {
		stor1.originalLayout = 0;
	}
	if(getItem("starry") == undefined) {
		stor1.starry = 0;
	}
	if(storage != stor1) {
		browser.storage.sync.set(stor1);
	}
	document.forms["toolbox"]["blurAmount"].value = getItem("blurAmount");
	document.forms["toolbox"]["bodyBackground"].value = getItem("bodyBackground");
	document.forms["toolbox"]["translucent"].setAttribute("value", getItem("translucentMode"));
	document.forms["toolbox"]["translucent"].setAttribute("title", Math.round(getItem("translucentMode") * 100) + "%");
	document.forms["toolbox"]["blur"].setAttribute("value", getItem("blurAmount"));
	document.forms["toolbox"]["rainbowSpeed"].setAttribute("value", Math.log(getItem("rainbowSpeed") * 1));
	document.forms["toolbox"]["rainbowSpeedAmount"].setAttribute("value", getItem("rainbowSpeed") * 1);
	document.forms["toolbox"]["url"].value = getItem("url");
	document.forms["toolbox"]["autoAttendanceRainbow"].checked = (getItem("autoAttendanceRainbow") != "0" && getItem("autoAttendanceRainbow"));
	document.forms["toolbox"]["originalLayout"].checked = (getItem("originalLayout") != 0 && getItem("originalLayout"));
	document.forms["toolbox"]["starry"].checked = (getItem("starry") != "0" && getItem("starry"));
	//document.querySelector("form").addEventListener("submit", () => {
	document.querySelector("form").addEventListener("input", () => {
		 /* MAX_WRITE_OPERATIONS_PER_MINUTE is 120, or twice a second.
		  * Most people won't be changing it this fast, so 250ms should be enough. Hopefully.
		  * Anyway that's why there's the warning. */
		if(Date.now() - lastChanged <= 250) {
			if(!timeout) {
				window.setTimeout(setStorage, (500 - Date.now() + lastChanged));
				timeout = 1;
			}
		} else {
			setStorage();
		}
	});
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
})
