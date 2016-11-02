var doc = document;
var paletteElem = doc.createElement('ul');
paletteElem.classList.add('hc-palette');
doc.body.appendChild( paletteElem );

var currents = {
    title: localStorage.title ? localStorage.title : '',
    colors: localStorage.colors ? localStorage.colors.split(',') : [],
    state: localStorage.state ? localStorage.state : statesList[0],
    position: localStorage.position ? localStorage.position : positionsList[0],
    bodyClass: {
      state: ''
    }
};

//---------------------------------------------

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var itemName = '';

    if ( request.getCurrents ) {
      sendResponse({ currents: currents });
    }
    else if ( request.changeState ) {
      var state = request.changeState.state;
      itemName = 'state';

      currents[itemName] = state;
      localStorage[itemName] = currents[itemName];

      if ( state === 'show') {
        setBodyClass();
      }
      else {
        resetBodyClass();
      }
    }
    else if ( request.setPalette ) {
      currents.colors = request.setPalette.palette.colors;
      currents.title = request.setPalette.palette.title;
      localStorage.colors = currents.colors;
      localStorage.title = currents.title;

      setPalette();
    }
    else if ( request.changePosition ) {
      currents.position = request.changePosition.position;
      localStorage.position = currents.position;

      setPosition();
    }
  });

//---------------------------------------------

// Set class with maket to body
setBodyClass();
setPalette();
setPosition();

// Functions
// ------------------------------------------

function getBodyClass( key, item ) {
    item = item ? item : currents[ key ];
    currents.bodyClass[ key ] = 'hc-page--' + key + '-' + item;
    return currents.bodyClass[ key ];
}

// ------------------------------------------

function setBodyClass( key ) {

    if ( !key ){
      if ( currents.state === 'hide') {
        return;
      }

      var keys = Object.keys( currents.bodyClass );
      keys.forEach(function( item ) {
          addClass( item );
      });
      return;
    }

    if ( currents.bodyClass[ key ] ) {
        doc.body.classList.remove( currents.bodyClass[ key ] );
        addClass( key );
    }
}

//---------------------------------------------

function resetBodyClass() {
    var keys = Object.keys( currents.bodyClass );
    keys.forEach(function( item ) {
      if ( currents.bodyClass[ item ] ) {
        doc.body.classList.remove( currents.bodyClass[ item ] );
      }
    });
    return;
}

// ------------------------------------------

function addClass( key ) {
    var newBodyClass = getBodyClass( key );
    document.body.classList.add( newBodyClass );
}

//---------------------------------------------

function setPalette() {
  var newUl = doc.createElement('ul');
  newUl.classList.add('hc-palette');

  if ( currents.colors.length === 0 ) {
    return;
  }

  currents.colors.forEach( function ( item ) {
    var li = doc.createElement('li');
    li.innerHTML = item;
    li.style.background = item;
    newUl.appendChild( li );
  });

  doc.body.replaceChild( newUl, paletteElem );
  paletteElem = newUl;
  paletteElem.dataset.position = currents.position;
}

//---------------------------------------------

function setPosition() {
  paletteElem.dataset.position = currents.position;
}
