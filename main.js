define(function (require, exports, module) {
	"use strict";

	// Brackets modules
	var EditorManager = brackets.getModule("editor/EditorManager"),
		AppInit = brackets.getModule("utils/AppInit"),
		MainViewManager = brackets.getModule("view/MainViewManager"),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	ExtensionUtils.loadStyleSheet(module, "main.css");

	var tags;
	var able = true;

	function timer_func() {
		if (able) {
			action(100);
			able = false;
			setTimeout(function () {
				able = true;
			}, 100);
		}
	}

	function action(time) {
		setTimeout(tag_color_change, time);
	}

	function tag_color_change() {
		if (!tags) {
			tags = document.getElementById("editor-holder").getElementsByClassName("cm-tag");
		}
		Array.prototype.forEach.call(tags, function (elm) {
			elm.setAttribute("data-tag-name", elm.innerHTML);
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
