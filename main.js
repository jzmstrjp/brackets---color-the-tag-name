define(function (require, exports, module) {
	"use strict";

	// Brackets modules
	var EditorManager = brackets.getModule("editor/EditorManager"),
		AppInit = brackets.getModule("utils/AppInit"),
		MainViewManager = brackets.getModule("view/MainViewManager"),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	ExtensionUtils.loadStyleSheet(module, "main.css");

	var cmTag;

	function tag_color_change() {
		//console.log("発火");
		/*var cmBracket = document.getElementById("editor-holder").querySelectorAll(".cm-bracket");
		Array.prototype.forEach.call(cmBracket, function (elm, i, arr) {
			var gt = elm.innerHTML.indexOf('&gt;');
			var lt = elm.innerHTML.indexOf('&lt;');
			if (gt !== -1 && lt !== -1 && elm.getAttribute("data-cloned") != "true"){
				elm.setAttribute("data-cloned", "true");
				var newElm = $(elm).clone(true);
				console.log("gt"+gt);
				console.log("lt"+lt);
				newElm[0].innerHTML = newElm[0].innerHTML.slice(0, gt+3);
				elm.innerHTML = elm.innerHTML.slice(lt);
				newElm.insertBefore(elm);
			}
		});*/

		Array.prototype.forEach.call(cmTag, function (elm, i, arr) {
			if(!elm.classList.contains("cm-bracket")){
				/*if(arr[i-1].classList.contains("cm-bracket") && arr[i-1].innerHTML.indexOf('&lt;') !== -1){
					arr[i-1].setAttribute("data-tag-name", elm.innerHTML);
				}*/
				elm.setAttribute("data-tag-name", elm.innerHTML);
				/*if(arr[i+1] && arr[i+1].classList.contains("cm-bracket")){
					arr[i+1].setAttribute("data-tag-name", elm.innerHTML);
				}*/
			}
		});
	}

	function updateUI() {
		cmTag = document.getElementById("editor-holder").getElementsByClassName("cm-tag");
		var editor = EditorManager.getCurrentFullEditor();
		var cm = editor._codeMirror;
		cm.on("update", tag_color_change);
	}


	// Initialize extension
	AppInit.appReady(function () {
		MainViewManager.on("currentFileChange", updateUI);
	});
});
