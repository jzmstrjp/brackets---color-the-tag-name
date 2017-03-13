define(function (require, exports, module) {
	"use strict";

	// Brackets modules
	var EditorManager = brackets.getModule("editor/EditorManager"),
		AppInit = brackets.getModule("utils/AppInit"),
		MainViewManager = brackets.getModule("view/MainViewManager"),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	ExtensionUtils.loadStyleSheet(module, "main.css");

	var cmTag;
	var able = true;

	function timer_func() {
		if (able) {
			able = false;
			setTimeout(function () {
				able = true;
				action(0);
			}, 100);
		}
	}

	function action(time) {
		setTimeout(tag_color_change, time);
	}

	function tag_color_change() {
		var cmBracket = document.querySelectorAll("#editor-holder .cm-bracket");
		Array.prototype.forEach.call(cmBracket, function (elm, i, arr) {
			if (elm.innerHTML.indexOf('&gt;&lt;') !== -1){
				var bunkatsu = elm.innerHTML.split("&gt;&lt;");
				var newElm = document.createElement("span");
				newElm.className = "cm-tag cm-bracket";
				newElm.innerHTML = bunkatsu[0] + "&gt;";
				elm.parentNode.insertBefore(newElm, elm);
				elm.innerHTML = "&lt;" + bunkatsu[1];
			}
		});
		if (!cmTag) {
			cmTag = document.getElementById("editor-holder").getElementsByClassName("cm-tag");
		}
		Array.prototype.forEach.call(cmTag, function (elm, i, arr) {
			if(!elm.classList.contains("cm-bracket")){
				if(arr[i-1].classList.contains("cm-bracket") && arr[i-1].innerHTML.indexOf('&lt;') !== -1){
					arr[i-1].setAttribute("data-tag-name", elm.innerHTML);
				}
				elm.setAttribute("data-tag-name", elm.innerHTML);
				if(arr[i+1] && arr[i+1].classList.contains("cm-bracket")){
					arr[i+1].setAttribute("data-tag-name", elm.innerHTML);
				}
			}
		});
	}

	function updateUI() {
		var editor = EditorManager.getCurrentFullEditor();
		editor.on("scroll keyup cursorActivity", timer_func);
		$(document).on("click", timer_func);
		action(300);
	}


	// Initialize extension
	AppInit.appReady(function () {
		MainViewManager.on("currentFileChange", updateUI);
		action(3000);
	});
});
