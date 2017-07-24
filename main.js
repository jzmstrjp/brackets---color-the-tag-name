define(function(require, exports, module) {
    "use strict";

    // Brackets modules
    var EditorManager = brackets.getModule("editor/EditorManager"),
        AppInit = brackets.getModule("utils/AppInit"),
        MainViewManager = brackets.getModule("view/MainViewManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Menus = brackets.getModule("command/Menus"),
        FileUtils = brackets.getModule("file/FileUtils"),
        FileSystem = brackets.getModule("filesystem/FileSystem"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        Strings = brackets.getModule("strings"),
        STRINGS = require("modules/Strings"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager");

    var SLDialog_tmp = require("text!htmlContent/dialog_storage_location_setting.html"),
        SLDialog,
        templateCss = require("text!templateCss/template.less"),
        commandID = "jzmstrjp.color_the_tag_name.customaize_tag_color",
        userCssFileName = "color_the_tag_name.less",
        context = { Strings: Strings, MyStrings: STRINGS };

    var theme_commandID = [
        "jzmstrjp.color_the_tag_name.theme1",
        "jzmstrjp.color_the_tag_name.theme2",
        "jzmstrjp.color_the_tag_name.theme3",
        "jzmstrjp.color_the_tag_name.theme4",
        "jzmstrjp.color_the_tag_name.theme5",
        "jzmstrjp.color_the_tag_name.theme6"
    ];

    var preferencesID = "jzmstrjp.color_the_tag_name",
        prefs = PreferencesManager.getExtensionPrefs(preferencesID);


    CommandManager.register("Color The Tag Name - Default Theme", theme_commandID[0], function(){theme_change(0);});
    CommandManager.register("Color The Tag Name - Theme1", theme_commandID[1], function(){theme_change(1);});
    CommandManager.register("Color The Tag Name - Theme2", theme_commandID[2], function(){theme_change(2);});
    CommandManager.register("Color The Tag Name - Theme3", theme_commandID[3], function(){theme_change(3);});
    CommandManager.register("Color The Tag Name - Theme4", theme_commandID[4], function(){theme_change(4);});
    CommandManager.register("Color The Tag Name - Theme5", theme_commandID[5], function(){theme_change(5);});

    function make_style_tag_for_theme_change(){
        var style = document.createElement("style");
        style.id = "color_the_tag_name_style_tag";
        document.head.appendChild(style);
    }

    function theme_change(theme_number){
        var style_elm = document.getElementById("color_the_tag_name_style_tag");
        style_elm.innerHTML = "[data-attr-name],[data-tag-name]{filter: hue-rotate(" + theme_number*60 + "deg);-webkit-filter: hue-rotate(" + theme_number*60 + "deg);}";
        style_elm.innerHTML += ".cm-attribute,.cm-string{filter: hue-rotate(" + theme_number*5 + "deg);-webkit-filter: hue-rotate(" + theme_number*5 + "deg);}";
        theme_commandID.forEach(function(elm, i, arr){
            CommandManager.get(elm).setChecked(false);
        });
        CommandManager.get(theme_commandID[theme_number]).setChecked(true);
        prefs.set("theme_number", theme_number);
        prefs.save();
    }

    function optimizePath(path){
    	if (path.slice(0, 1) === "/") { // For Mac.
        path = "file://" + path;
      }
      return path;
    }


    function fileExists(path, userCssFileName, callbackFunc){
    	FileSystem.resolve(path + userCssFileName, function(errorString, fileSystemEntry, fileSystemStats){
    		if(fileSystemEntry && fileSystemEntry._isFile){
    			callbackFunc(true, path, userCssFileName);
    		}else{
    			callbackFunc(false, path, userCssFileName);
    		}
    	});
    }

    function prepCss(path) {
			if (!path) {
				ExtensionUtils.loadStyleSheet(module, "main.less");
      } else {
        fileExists(path, userCssFileName, loadCss);
      }
    }

    function loadCss(bool, motoPath, userCssFileName){
    	var path = optimizePath(motoPath);
    	if(!bool){
    		ExtensionUtils.loadStyleSheet(module, "main.less");
    	} else {
    		ExtensionUtils.loadStyleSheet(module, path + userCssFileName);
    	}
    }



    function prepSaveOriginalCss(path) {
        path = path.replace(/\\|\\/g, '/');
        if (path.slice(-1) != "/") {
            path += "/";
        }
        fileExists(path, userCssFileName, saveOriginalCss);
    }

    function saveOriginalCss(bool, motoPath, userCssFileName) {
    	var fileEntry = FileSystem.getFileForPath(motoPath + userCssFileName);
      if(bool){
      	alert('Css file already exists. Please edit ' + userCssFileName + '.');
      } else {
        FileUtils.writeText(fileEntry, templateCss, false).done(function() {
          alert('CSS Saved. Please edit ' + userCssFileName + '.');
        });
      }
      prefs.set("userCssPath", motoPath);
      prefs.save();
      MainViewManager.addToWorkingSet("first-pane", fileEntry);
    }


    function openDialog() {
        var dl = Dialogs.showModalDialogUsingTemplate(Mustache.render(SLDialog_tmp, context));
        SLDialog = dl.getElement();
        //loadPrefs(SLDialog);
        SLDialog.on('click', '.dialog-button-save', function() {
            prepSaveOriginalCss($('#location_path', SLDialog).val());
        });
    		SLDialog.on('click', '#button', function() {
          FileSystem.showOpenDialog(false, true, null, null, null, function(str, arr) {
	            $('#location_path', SLDialog).val(arr);
	        });
        });
    }


    CommandManager.register("Color The Tag Name - Make Original CSS(LESS)", commandID, openDialog);



    var cmTag;
    var cmAttr;
    var cmProp;
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
                if (arr[i - 1] && arr[i - 1].classList.contains("cm-open-bracket")) {
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
        Array.prototype.forEach.call(cmProp, function(elm, i, arr) {
            var html = elm.innerHTML;
            elm.setAttribute("data-prop-name", html);
        });
    }

    function updateUI() {
        cmTag = document.getElementById("editor-holder").getElementsByClassName("cm-tag");
        cmAttr = document.getElementById("editor-holder").getElementsByClassName("cm-attribute");
        cmProp = document.getElementById("editor-holder").getElementsByClassName("cm-property");
        var editor = EditorManager.getCurrentFullEditor();
        if(!editor){
            return;
        }
        var cm = editor._codeMirror;
        cm.removeOverlay(overlay);
        cm.addOverlay(overlay);
        cm.on("update", tag_color_change);
    }

    // Initialize extension
    AppInit.appReady(function() {
        make_style_tag_for_theme_change();
        MainViewManager.on("currentFileChange", updateUI);
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuDivider();
        theme_commandID.forEach(function(elm, i, arr){
            menu.addMenuItem(elm);
        });
        menu.addMenuDivider();
        menu.addMenuItem(commandID);
        menu.addMenuDivider();
        prepCss(prefs.get("userCssPath"));
        if(prefs.get("theme_number"))theme_change(prefs.get("theme_number"));
    });
});
