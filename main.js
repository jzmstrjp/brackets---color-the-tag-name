define(function(require, exports, module) {
    "use strict";

    // Brackets modules
    var EditorManager = brackets.getModule("editor/EditorManager"),
        AppInit = brackets.getModule("utils/AppInit"),
        MainViewManager = brackets.getModule("view/MainViewManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	ExtensionUtils.loadStyleSheet(module, "main.css");

	var cmTag;
    var cmAttr;
    var overlay = {
        token: function(stream, state) {
            var ch;
            if (stream.match(/<(\/|)/)) {
                return "open-bracket";
            } else if (stream.match(/(\/|)>/)) {
                return "close-bracket";
            }
            while (stream.next() != null && !stream.match(/<(\/|)|(\/|)>/, false)) {}
            return null;
        }
    };

    

    function tag_color_change() {
        Array.prototype.forEach.call(cmTag, function(elm, i, arr) {
            var html = elm.innerHTML;
            if (!elm.classList.contains("cm-bracket")) {
                if (arr[i - 1].classList.contains("cm-open-bracket")) {
                    arr[i - 1].setAttribute("data-tag-name", html);
                }
                elm.setAttribute("data-tag-name", html);
                if (arr[i + 1] && arr[i + 1].classList.contains("cm-close-bracket")) {
                    arr[i + 1].setAttribute("data-tag-name", html);
                }
            }
        });
        Array.prototype.forEach.call(cmAttr, function(elm, i, arr) {
            var html = elm.innerHTML;
            elm.setAttribute("data-attr-name", html);
        });
    }

    function updateUI() {
        cmTag = document.getElementById("editor-holder").getElementsByClassName("cm-tag");
        cmAttr = document.getElementById("editor-holder").getElementsByClassName("cm-attribute");
        var editor = EditorManager.getCurrentFullEditor();
        var cm = editor._codeMirror;
        cm.removeOverlay(overlay);
        cm.addOverlay(overlay);
        cm.on("update", tag_color_change);
    }

    // Initialize extension
    AppInit.appReady(function() {
        MainViewManager.on("currentFileChange", updateUI);
    });
});
