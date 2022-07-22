document.querySelector("form").addEventListener("input", () => {
	document.querySelector("#blurAmount").value = parseFloat(document.querySelector("#blur").value);
});