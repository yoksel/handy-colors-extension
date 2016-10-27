var $ = tinyLib;
var doc = document;
var storage = window.localStorage;

var popupContent = $.get('.popup-content');
var currents = {};

var palettesSet = {
  current: null,
  currentClass: 'tiny-palette--current',
  selected: null,
  selectedClass: 'tiny-palette--selected',
  wrapper: $.get('.palettes'),
  list: $.create('ul').addClass('palettes__list'),
  items: [],
  controlsShowColors: []
};

sendMsg( 'getCurrents' );

// Add states switcher
var paramsStates = {
    listName: 'states',
    itemName: 'state',
    type: 'radio',
    list: statesList,
    action: changeState
};

// Add position switcher
var paramsPosition = {
    listName: 'positions',
    itemName: 'position',
    type: 'radio',
    list: positionsList,
    action: changePosition
};

//---------------------------------------------

function sendMsg( func, key, value ) {
  var data = {};
  data[ func ] = {};

  if ( key ) {
    data[ func ][ key ] = value;
  }

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id,
      data,
      function(response) {

        if( response && response.currents ){
          currents = response.currents;

          initControls();
          initPalettes();
        }
      });
  });
}

//---------------------------------------------

function initControls() {
  createInputsSet(paramsPosition);
  createInputsSet(paramsStates);
}

//---------------------------------------------

function createInputsSet(params) {
  var listName = params.listName;
  var itemName = params.itemName;
  var type = params.type;
  var list = params.list;
  var action = params.action;

  var itemsSet = $.create('div');
  itemsSet.addClass(['popup-content__item',
                          'popup-content__item--' + listName]);

  list.forEach(function(item, i, arr) {

      var id = itemName + '-' + item;
      var input = $.create('input');
      input.attr({
        'type': type,
        'id': id,
        'name': listName,
        'data-content': item
      });

      if (item == currents[itemName]) {
          input.attr({'checked': ''});
      }

      var label = $.create('label');
      label.attr({'for': itemName + '-' + item});
      label.html( item );

      itemsSet.append(input);
      itemsSet.append(label);

      input.elem.onclick = function() {
          var value = this.dataset.content;
          if ( action ) {
            action( this );
            return;
          }
          sendMsg('setBodyClass', itemName, value);
      };
  });

  popupContent.append(itemsSet);
}

//---------------------------------------------

function changeState( elem ) {
  var value = elem.dataset.content;
  elem.parentNode.dataset.state = value;
  sendMsg( 'changeState', 'state', value );
}

//---------------------------------------------

function changePosition( elem ) {
  var value = elem.dataset.content;
  elem.parentNode.dataset.position = value;
  sendMsg( 'changePosition', 'position', value );
}

//---------------------------------------------

function initPalettes() {
  palettes.forEach( function ( item ) {
    var tinyPalette = createTinyPalette( item );
    palettesSet.list.append ( tinyPalette );
    palettesSet.items.push( tinyPalette );
  });

  palettesSet.wrapper.append( palettesSet.list );

  addPaletteAction();
}

//---------------------------------------------

function createTinyPalette( paletteItem ) {
  var tinyPalette = $.create('li')
    .addClass(['palettes__item','tiny-palette'])
    .attr({tabindex:"-1"});
  var colorList = createColorsList( paletteItem );

  if ( currents.title === paletteItem.title ) {
    palettesSet.selected = tinyPalette;
    tinyPalette.addClass( palettesSet.selectedClass );
  }

  var colorNamesOut = $.create('textarea')
    .addClass(['tiny-palette__colornames'])
    .attr('spellcheck', 'false');

  var controlShowColors = $.create('button')
    .addClass(['tiny-palette__control', 'tiny-palette__control--toggle-colornames'])
    .html('Color names');

  tinyPalette.controlShowColors = controlShowColors;
  tinyPalette.colors = paletteItem.colors;
  tinyPalette.title = paletteItem.title;

  var colorsText = tinyPalette.colors.filter( removeEmptyItems).join(', ');
  colorNamesOut.val( colorsText );

  var colorNamesWrapper = $.create('div')
    .addClass(['tiny-palette__colornames-wrapper'])
    .append( controlShowColors )
    .append( colorNamesOut );

  tinyPalette.append( colorList );
  tinyPalette.append( colorNamesWrapper );

  tinyPalette.textarea = colorNamesOut;

  return tinyPalette;
}

//---------------------------------------------

function createColorsList( paletteItem ) {
  var colorList = $.create('ul')
    .addClass('tiny-palette__colorviews');
  var colors = paletteItem.colors;

  colors.forEach( function ( item ) {
    var item = $.create('li')
      .addClass('tiny-palette__colorview')
      .attr('style','background: ' + item);
    colorList.append( item );
  });

  return colorList;
}

//---------------------------------------------

function addPaletteAction() {
  palettesSet.items.forEach( function ( item ) {

    // Set current
    item.controlShowColors.elem.onclick = function ( event ) {
      event.stopPropagation();

      if ( palettesSet.current !== null ) {
        palettesSet.current.removeClass( palettesSet.currentClass );

        if ( palettesSet.current === item ) {
          palettesSet.current = null;
          return;
        }
      }

      palettesSet.current = item;
      palettesSet.current.addClass( palettesSet.currentClass );
    };

    item.textarea.elem.onblur = function () {
      unsetCurrentPalette();
    }

    item.elem.onblur = function () {
      unsetCurrentPalette()
    };

    // Set selected
    item.elem.onclick = function () {
      if ( palettesSet.selected !== null ) {
        palettesSet.selected.removeClass( palettesSet.selectedClass );
      }

      palettesSet.selected = item;
      palettesSet.selected.addClass( palettesSet.selectedClass );

      var palette = {
        colors: item.colors,
        title: item.title
      };

      sendMsg('setPalette', 'palette', palette);
    };

  });

}

//---------------------------------------------

function unsetCurrentPalette() {
  if ( palettesSet.current !== null ) {
    palettesSet.current.removeClass( palettesSet.currentClass );
    palettesSet.current = null;
  }
}

//---------------------------------------------

function removeEmptyItems ( item ) {
  return item ? true : false;
}
