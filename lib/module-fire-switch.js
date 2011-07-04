const { Hotkey } = require("hotkeys");
var
  data = require("self").data,
  prefs = require("preferences-service"),
  panel = require("panel"),
  widgets = require("widget")
;

/**
 * List of the prefs items
 */
var myItems = {
  "javascript.enabled": {
    data: "javascript.enabled",
    reverted: false,
    label: "JavaScript"
  },
  "webgl.disabled": {
    data: "webgl.disabled",
    reverted: true,
    label: "WebGL"
  },
  "geo.enabled": {
    data: "geo.enabled",
    reverted: false,
    label: "Geolocation"
  }
};

/**
 * Toggle the status of the setting.
 */
exports.toggle = function (key) {
  if (prefs.get(key) === true)
    myItems[key].value = false;
  else if (prefs.get(key) === false)
    myItems[key].value = true;
  else
    myItems[key].value = prefs.get(key);

  prefs.set(key, myItems[key].value);
  
  var status = (
      (myItems[key].value === true && myItems[key].reverted === false)
      || (myItems[key].value === false && myItems[key].reverted === true)
    ) ? 'on' : 'off';

  require("notifications").notify({
    title: "Firefox addon : FireSwitch",
    text: "" + myItems[key].label + " is now set to " + status + "."
  });
};

/*
 * Toggle the status of the setting by his label.
 *
 */
exports.toggleByLabel = function (label) {
  var name;

  for (key in myItems) {
    if (myItems[key]['label'] == label) {
      name = myItems[key]['data'];
      break;
    }
  }

  return this.toggle(name);
};

/*
 * Check items status.
 */
exports.checkItems = function () {
  for (key in myItems) {
    myItems[key].value = prefs.get(key);
  }
};

/*
 * Show the panel.
 */
exports.showPanel = function () {
  this.myPanel.show();
  this.myPanel.port.emit("show", myItems);
};

/*
 * Hide the panel.
 */
exports.hidePanel = function () {
  this.myPanel.hide();
  this.myPanel.port.emit("hide");
};

/*
 * Bind the panels events : keybooard event to display the panel and click on
 * the panel list.
 */
exports.loadPanelEvents = function () {
  exports.myHotKey = Hotkey({
    combo: "ctrl-alt-p",
    onPress: function() {
      var fs = require("module-fire-switch");
      fs.checkItems();
      fs.showPanel();
    }
  });

  this.myPanel.port.on("click", function(key) {
    var fs = require("module-fire-switch");
    fs.toggle(key);
    fs.hidePanel();
  });
};

/*
 * Load panels.
 */
exports.loadPanel = function () {
  exports.myPanel = panel.Panel({
    width: 320,
    height: 240,
    contentURL: "data:text/html," + data.load("panel.html").replace('panel.css', data.url("panel.css")),
    contentScriptFile: [
      data.url("jquery-1.6.1.min.js"),
      data.url("panel.js")
    ],
    onHide : function () {
      var fs = require("module-fire-switch");
      fs.hidePanel();
    }
  });
};

/**
 * Load all the scripts to make the lib work.
 */
exports.init = function () {
  this.checkItems();
  this.loadPanel();
  this.loadPanelEvents();
}