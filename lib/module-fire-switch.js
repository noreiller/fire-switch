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
exports.items = {
	"javascript.enabled": {
		data: "javascript.enabled",
		reverted: false,
		label: "JavaScript",
		symbol: "JS"
	},
	"geo.enabled": {
		data: "geo.enabled",
		reverted: false,
		label: "Geolocation",
		symbol: "Geo"
	},
	"pdfjs.disabled": {
		data: "pdfjs.disabled",
		reverted: true,
		label: "PDF viewer",
		symbol: "PDF"
	},
  "webgl.disabled": {
    data: "webgl.disabled",
    reverted: true,
    label: "WebGL",
    symbol: "WGL"
  }
};

/**
 * Generate the content of the widget
 * @param  {Object} item The setting of the item
 * @return {String}      The HTML code of the widget
 */
var getWidgetContent = function (item) {
	var s = '', style = '', styles = {
		"background": "-moz-linear-gradient(bottom, rgba(0,0,0,0.25) 50%, rgba(255,255,255,0))",
		"background-image": "linear-gradient(to top, rgba(0,0,0,0.25) 50%, rgba(255,255,255,0))",
		"border-radius": "3px",
		"color": "#fff",
		"cursor": "pointer",
		"display": "inline-block",
		"font-size": "10px",
		"text-shadow": "0 0 4px #fff",
		"line-height": "16px",
		"text-align": "center",
		"width": "20px"
	};

	for (var k in styles) {
		style += k;
		style += ':';
		style += styles[k]
		style += ';';
	}


	style += 'background-color:';
	if (
		(item.value === true && item.reverted === false)
		|| (item.value === false && item.reverted === true)
	)
		style += 'green;';
	else
		style += 'red;';

	s += '<div style="';
	s += style;
	s += '">';
	s += item.symbol;
	s += '</div>';

	return s;
};

/*
 * Check items status.
 */
exports.checkItems = function () {
	for (key in this.items) {
		this.items[key].value = prefs.get(key);
    this.items[key].enabled = require("simple-prefs").prefs[key];
    require("simple-prefs").on(key, require("module-fire-switch").updatePref);
  }
};

/**
 * Enable or disable the UI widget
 * @param  {String} key The key of the item
 */
exports.updatePref = function (key) {
  var
    fs = require('module-fire-switch'),
    isEnabled = require("simple-prefs").prefs[key]
  ;
  fs.items[key].enabled = isEnabled;

  if (isEnabled === true && fs.items[key].widget === undefined){
    fs.loadWidgets();
  } 
  else if (isEnabled === false && fs.items[key].widget !== undefined) {
    fs.items[key].widget.destroy();
    delete fs.items[key].widget;
  }
}

/**
 * Add the widgets to the UI
 */
exports.loadWidgets = function () {
	for (key in this.items) {
    if (this.items[key].enabled === true && this.items[key].widget === undefined) {
      var myWidgetContent = getWidgetContent(this.items[key]);
      this.items[key].widget = widgets.Widget({
        id: key,
        label: this.items[key].label,
        content: myWidgetContent,
        tooltip: this.items[key].label,
        width: 20, 
        onClick: function () {
          require('module-fire-switch').toggle(this.id);
        }
      })
    }
	}
};

/**
 * Toggle the status of the setting.
 */
exports.toggle = function (key) {
	if (prefs.get(key) === true)
		this.items[key].value = false;
	else if (prefs.get(key) === false)
		this.items[key].value = true;
	else
		this.items[key].value = prefs.get(key);

	prefs.set(key, this.items[key].value);

	this.items[key].widget.content = getWidgetContent(this.items[key]);
	
	var status = (
		(this.items[key].value === true && this.items[key].reverted === false)
		|| (this.items[key].value === false && this.items[key].reverted === true)
	) ? 'on' : 'off';

	require("notifications").notify({
		title: "Firefox addon : FireSwitch",
		text: "" + this.items[key].label + " is now set to " + status + "."
	});
};

/*
 * Toggle the status of the setting by his label.
 *
 */
exports.toggleByLabel = function (label) {
	var name;

	for (key in this.items) {
		if (this.items[key]['label'] == label) {
			name = this.items[key]['data'];
			break;
		}
	}

	return this.toggle(name);
};

// The panel is not used anymore, but kept if needed in the future
/*
 * Show the panel.
 */
exports.showPanel = function () {
	this.myPanel.show();
	this.myPanel.port.emit("show", this.items);
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
	this.loadWidgets();
	// this.loadPanel();
	// this.loadPanelEvents();
}