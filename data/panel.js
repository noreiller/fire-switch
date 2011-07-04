var panel =  {
  /**
   * On init, bind the "show" and "hide" events from the addon.
   */
  init : function () {
    self.port.on('show', function(myItems) {
      panel.generateList(myItems);
      panel.loadEvents();
    });

    self.port.on('hide', function() {
      panel.unloadEvents();
    });
  },

  /**
   * Bind the click event on LI elements
   */
  loadEvents : function () {
    jQuery(window).click(function (event) {
      var t = event.target;

      if (t.nodeName != "LI")
        return;

      event.stopPropagation();
      event.preventDefault();
      self.port.emit('click', jQuery(t).attr('rel'));
    });
  },

  unloadEvents : function () {
    jQuery(window).unbind('click');
  },

  /**
   * Generate the LI elements based on the addon list
   */
  generateList : function (myItems) {
    var myLiElements = '';
    
    for (key in myItems)
      myLiElements +=
        '<li'
        + ' class="' + (
          (
            (myItems[key].value === true && myItems[key].reverted === false)
            || (myItems[key].value === false && myItems[key].reverted === true)
          ) ? 'on' : 'off') + '"'
        + ' rel="' + myItems[key].data + '"'
        + '>'
        + myItems[key].label
        + '</li>'
      ;

    jQuery('body ul')
      .empty()
      .html(myLiElements)
    ;
  }
};

panel.init();