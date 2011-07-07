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
    let node = jQuery('body ul')
        .empty();

    for (key in myItems)
      node.append(jQuery('<li>')
        .addClass((
          (myItems[key].value === true && myItems[key].reverted === false)
          || (myItems[key].value === false && myItems[key].reverted === true)
        ) ? 'on' : 'off')
        .attr({ rel: myItems[key].data })
        .text(myItems[key].label))
      ;
    var myLiElements = '';
  }
};

panel.init();