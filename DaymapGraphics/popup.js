var setItem = (key, value) => {
	chrome.storage.sync.set(JSON.parse(`{"${key}": "${value}"}`));
};
(async () => {
	return JSON.stringify(await chrome.storage.sync.get());
})().then(storage => {
	let getItem = (key) => {
		let something = storage.substr(storage.indexOf(key + "\":\"") + (key + "\":\"").length);
		something = something.substr(0, something.indexOf("\",\"") != -1 ? something.indexOf("\",\"") : something.indexOf("\"}"));
		return something;
	};
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
	document.querySelector("form").addEventListener("input", () => {
		document.forms["toolbox"]["blurAmount"].value = parseFloat(document.forms["toolbox"]["blur"].value);
		document.forms["toolbox"]["rainbowSpeedAmount"].value = Math.round(parseFloat(Math.exp(document.forms["toolbox"]["rainbowSpeed"].value * 1)) * 1000) / 1000;
		document.forms["toolbox"]["translucent"].setAttribute("title", Math.round(document.forms["toolbox"]["translucent"].value * 100) + "%");
		// if needs to be used instead of conditionals due to MAX_WRITE_OPERATIONS_PER_MINUTE. The quota can still be exceeded but at least it takes longer.
		if(getItem("bodyBackground") != document.forms["toolbox"]["bodyBackground"].value) {
			setItem("bodyBackground", document.forms["toolbox"]["bodyBackground"].value);
		}
		if(getItem("translucentMode") != document.forms["toolbox"]["translucent"].value) {
			setItem("translucentMode", document.forms["toolbox"]["translucent"].value);
		}
		if(getItem("blurAmount") != document.forms["toolbox"]["blur"].value) {
			setItem("blurAmount", document.forms["toolbox"]["blur"].value);
		}
		if(getItem("rainbowSpeed") != Math.round(parseFloat(Math.exp(document.forms["toolbox"]["rainbowSpeed"].value * 1)) * 1000) / 1000) {
			setItem("rainbowSpeed", Math.round(parseFloat(Math.exp(document.forms["toolbox"]["rainbowSpeed"].value * 1)) * 1000) / 1000);
		}
		if(getItem("url") != document.forms["toolbox"]["url"].value) {
			setItem("url", document.forms["toolbox"]["url"].value);
		}
		setItem("originalLayout", document.forms["toolbox"]["originalLayout"].checked ? 1 : 0);
		setItem("autoAttendanceRainbow", document.forms["toolbox"]["autoAttendanceRainbow"].checked ? 1 : 0);
	});
});

document.querySelector("#showGuide").addEventListener("click", () => {
	document.querySelector("#guide").style.visibility = (document.querySelector("#guide").style.visibility == "hidden" ? "visible" : "hidden");
	document.querySelector("#main").style.overflow = (document.querySelector("#main").style.overflow == "visible" ? "hidden" : "visible");
});
