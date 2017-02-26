define(function (require, exports, module) {

	'use strict';

	var AppInit = brackets.getModule('utils/AppInit'),
		EditorManager = brackets.getModule('editor/EditorManager'),
		MainViewManager = brackets.getModule('view/MainViewManager'),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	ExtensionUtils.loadStyleSheet(module, "main.css");

	var editor, startLine, oldPos, lineColor;

	function action(instance, line, gutter, event) {

		var anchor = {
			line: line,
			ch: 0
		};
		var head = {
			line: line + 1,
			ch: 0
		};
		var cursor = instance.getCursor();

		startLine = line;

		if (gutter === 'CodeMirror-linenumbers') {
			if (!event.ctrlKey && !event.shiftKey) {
				instance.setSelection(anchor, head);
			} else if (event.ctrlKey) {
				instance.addSelection(anchor, head);
			} else if (event.shiftKey) {
				var oldLine = cursor.line;
				var newLine = instance.lineAtHeight(event.pageY);

				if (instance.somethingSelected()) {
					if (newLine > oldLine) {
						instance.extendSelection({
							line: newLine + 1,
							ch: 0
						});
					} else {
						instance.extendSelection({
							line: newLine,
							ch: 0
						}, {
							line: oldLine,
							ch: 0
						});
					}
				} else {
					instance.setSelection({
						line: cursor.line,
						ch: cursor.ch
					}, {
						line: newLine,
						ch: null
					});
				}
			}
		}

		var lineSelecting = function (e) {
			var newLine = instance.lineAtHeight(e.pageY);

			if (newLine > startLine) {
				newLine += 1;
			} else if (newLine < startLine && startLine === newLine + 1) {
				startLine += 1;
			}

			if (!event.ctrlKey) {
				instance.setSelection({
					line: startLine,
					ch: 0
				}, {
					line: newLine,
					ch: 0
				});
			} else {
				instance.addSelection({
					line: startLine,
					ch: startLine < newLine ? 0 : null
				}, {
					line: newLine,
					ch: startLine < newLine ? null : 0
				});
			}
		};

		var lineSelectStop = function (e) {
			$('body').off('mousemove', lineSelecting).off('mousemove', lineSelecting);
			startLine = null;
		};

		$('body').on('mousemove', lineSelecting).on('mouseup', lineSelectStop);

	}

	function gutterMove(e) {
		if (oldPos) {
			editor._codeMirror.removeLineClass(oldPos.line, 'background', 'ta_gutterLine');
		}
		var pos = editor._codeMirror.coordsChar({
			left: e.clientX,
			top: e.clientY
		});
		oldPos = pos;
		editor._codeMirror.addLineClass(pos.line, 'background', 'ta_gutterLine');
	}

	function gutterEnter() {
		$('.CodeMirror-gutters').on('mousemove', gutterMove);
	}

	function gutterLeave() {
		$('.CodeMirror-gutters').off('mousemove', gutterMove);
		if (oldPos) {
			editor._codeMirror.removeLineClass(oldPos.line, 'background', 'ta_gutterLine');
		}
	}

	function getColor() {
		// delay to ensure theme color is stored
		var delay = window.setTimeout(function () {
			$('#editor-holder').find('.CodeMirror').append('<div id="ta_tempColorGetter" class="CodeMirror-selected"></div>');

			lineColor = $('#ta_tempColorGetter').css('background-color');

			$('head').append('<style id="ta_customCSS">.ta_gutterLine { background-color: ' + lineColor + '; }</style>');

			$('#ta_tempColorGetter').remove();
		}, 1000);
	}

	function update() {

	}

	AppInit.appReady(function () {
		$("body").on("click", tag_color_change)
	});

	function tag_color_change() {
		console.log("tag_color_change");
		var tags = document.querySelectorAll(".cm-tag:not(.cm-bracket)");
		[].forEach.call(tags, function(elm, i, arr){
			//console.log("tag_name_" + elm.innerHTML.slice(0,2));
			//$(elm).addClass("tag_name_" + elm.innerHTML.slice(0,2));
			elm.setAttribute("data-tag-name", elm.innerHTML);
		});
	}

});