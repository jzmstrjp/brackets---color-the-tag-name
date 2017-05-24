define(function(require, exports, module) {
    "use strict";

    // Brackets modules
    var EditorManager = brackets.getModule("editor/EditorManager"),
        AppInit = brackets.getModule("utils/AppInit"),
        MainViewManager = brackets.getModule("view/MainViewManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Menus          = brackets.getModule("command/Menus"),
        FileUtils          = brackets.getModule("file/FileUtils"),
        FileSystem              = brackets.getModule("filesystem/FileSystem"),
        Dialogs                 = brackets.getModule("widgets/Dialogs"),
        Strings                 = brackets.getModule("strings"),
        STRINGS                 = require("modules/Strings"),
        //DocumentManager = brackets.getModule("document/DocumentManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager");

    var SLDialog_tmp            = require("text!htmlContent/dialog_storage_location_setting.html"),
        SLDialog,
        templateCss = require("text!templateCss/template.less"),
        commandID2 = "jzmstrjp.color_the_tag_name.customaize_tag_color",
        context                 = {Strings: Strings, MyStrings: STRINGS};

    var commandID = "jzmstrjp.color_the_tag_name.simple_color_mode",
        preferencesID = "jzmstrjp.color_the_tag_name",
        enabled     = false,
        prefs       = PreferencesManager.getExtensionPrefs(preferencesID);

    var simple_color_mode_class_name = "color_the_tag_name_simple_mode",
        colorful_mode_class_name = "color_the_tag_name_colorful_mode";



    //ExtensionUtils.loadStyleSheet(module, "main.less");
	//ExtensionUtils.loadStyleSheet(module, "C:/Users/coolermaster2/Desktop/toku/便利ソフト/customaize.less");

    function loadCss(path){
        if(path){
            ExtensionUtils.loadStyleSheet(module, path + "color_the_tag_name.less");
        } else {
            ExtensionUtils.loadStyleSheet(module, "main.less");
        }
    }

    
    function saveOriginalCss(path){
        path = path.replace(/\\|\\/g, '/');
        if(path.slice(-1) != "/"){
            path += "/";
        }
        var fileEntry = FileSystem.getFileForPath(path + "color_the_tag_name.less");
        FileUtils.writeText( fileEntry, templateCss, true ).done( function() {
            alert("CSS Saved.");
            prefs.set("userCssPath", path);
            prefs.save();
            MainViewManager.addToWorkingSet("first-pane", fileEntry);
        } );
    }
    

    function openDialog() {
        var dl = Dialogs.showModalDialogUsingTemplate(Mustache.render(SLDialog_tmp, context));
        SLDialog = dl.getElement();
        //loadPrefs(SLDialog);
        SLDialog.on( 'click', '.dialog-button-save', function() {
            saveOriginalCss($('#location_path', SLDialog).val());
        } );
    }
    

    CommandManager.register("Customize Tag Colors", commandID2, openDialog);


    function handleToggleGuides() {
        enabled = !enabled;
        color_mode_set();
    }

    function color_mode_set(){
        if(enabled){
            document.body.classList.add(simple_color_mode_class_name);
            document.body.classList.remove(colorful_mode_class_name);
        }else{
            document.body.classList.add(colorful_mode_class_name);
            document.body.classList.remove(simple_color_mode_class_name);
        }
        prefs.set("enabled", enabled);
        prefs.save();
        CommandManager.get(commandID).setChecked(enabled);
        //window.alert("Simple Color Mode:"+enabled+"!");
    }

    CommandManager.register("Simple Color Mode", commandID, handleToggleGuides);
    

    prefs.definePreference("simple_color_mode", "boolean", enabled, {
        description: "Simple Color Mode"
    });

    

    







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
        
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(commandID);
        enabled = prefs.get("enabled");

        menu.addMenuItem(commandID2);
        loadCss(prefs.get("userCssPath"));
        color_mode_set();
    });
});
