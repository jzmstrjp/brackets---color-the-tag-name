define(function (require, exports, module) {

	'use strict';

	var AppInit = brackets.getModule('utils/AppInit'),
		EditorManager = brackets.getModule('editor/EditorManager'),
		MainViewManager = brackets.getModule('view/MainViewManager'),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	var timer;
	
	ExtensionUtils.loadStyleSheet(module, "main.css");

	AppInit.appReady(function () {
		$(document).on("click mousewheel keydown keyup", timer_func);
	});
	
	function timer_func(){
		clearTimeout(timer);
		timer = setTimeout(tag_color_change, 100);
	}

	function tag_color_change() {
		console.log("tag_color_change");
		var tags = document.querySelectorAll(".cm-tag:not(.cm-bracket)");
		[].forEach.call(tags, function (elm, i, arr) {
			//console.log("tag_name_" + elm.innerHTML.slice(0,2));
			//$(elm).addClass("tag_name_" + elm.innerHTML.slice(0,2));
			elm.setAttribute("data-tag-name", elm.innerHTML);
		});
	}

});
