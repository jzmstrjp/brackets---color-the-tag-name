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
        Mustache = brackets.getModule("thirdparty/mustache/mustache"),
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
        if(theme_number === 0){
            style_elm.innerHTML = '';
        }else{
            style_elm.innerHTML = '[class*="cm-jzmstrjp-tag-"]{-webkit-filter: hue-rotate(' + theme_number*60 + 'deg) !important; filter: hue-rotate(' + theme_number*60 + 'deg) !important;}';    
        }
        theme_commandID.forEach(function(elm){
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
    	FileSystem.resolve(path + userCssFileName, function(errorString, fileSystemEntry/*, fileSystemStats*/){
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

    var overlay = {
        token: function(stream/*, state*/) {
            var arr;
            arr = stream.match(/<(\/|)([a-z]+[1-6]*)(|(.*?)[^?%-])>/);
            if (arr) {
                return "jzmstrjp-tag-" + arr[2].toUpperCase();
            }
            while (stream.next() != null && !stream.match(/<(\/|)|(\/|)>/, false)) {}
            return null;
        }
    };



    function tag_color_change() {
        var cmTag = document.getElementById("editor-holder").querySelectorAll(".cm-tag:not(.cm-comment), .cm-attribute, .cm-builtin, .cm-qualifier");
        Array.prototype.forEach.call(cmTag, function(elm) {
            var html = elm.innerHTML;
            html = html.replace(/^(#|\.)/, "");
            elm.classList.add("cm-jzmstrjp-tag-" + html.toUpperCase());
        });
    }

    function updateUI() {
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
        theme_commandID.forEach(function(elm/*, i, arr*/){
            menu.addMenuItem(elm);
        });
        menu.addMenuDivider();
        menu.addMenuItem(commandID);
        menu.addMenuDivider();
        prepCss(prefs.get("userCssPath"));
        if(prefs.get("theme_number")){
            theme_change(prefs.get("theme_number"));
        }
    });
});
