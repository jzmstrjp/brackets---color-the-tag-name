define(function (require, exports, module) {

	'use strict';

	var AppInit = brackets.getModule('utils/AppInit'),
		EditorManager = brackets.getModule('editor/EditorManager'),
		MainViewManager = brackets.getModule('view/MainViewManager'),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	var able = true;
	var timer = false;
	
	ExtensionUtils.loadStyleSheet(module, "main.css");

	AppInit.appReady(function () {
		$(document).on("click mousewheel keyup", timer_func);
	});
	
	function timer_func(){
		if(able){
			action();
			able = false;
		}
		if(!timer){
			timer = setTimeout(function(){
				able = true;
				timer = false;
			}, 100);
		}
	}
	
	function action(){
		setTimeout(tag_color_change, 100);
	}

	function tag_color_change() {
		var tags = document.querySelectorAll(".cm-tag:not(.cm-bracket)");
		console.log("tag_color_change");
		[].forEach.call(tags, function (elm) {
			elm.setAttribute("data-tag-name", elm.innerHTML);
		});
	}

});
