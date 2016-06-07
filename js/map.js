//  nesutvarkyta

// Google Maps functionality.

(function(global) {

  // var document = global.document,
  //     window = global.window,
  //     localStorage = global.localStorage,
  //     storageKeys = {
  //       MAPOPTIONS: 'mapOptions'
  //     },
  //     google,         // The Google Maps API.
  //     map,            // The Google Map.
  //     markers = [],   // The Google Map Markers.
  //     places,         // The Google Places Service.
  //     infoWindow,     // The Google Map InfoWindow.
  //     unsuspendScrollZoomListener;  // The infowindow 'closeclick' listener to unsuspend scroll zooming.

  global.map = {
    addMarker: addMarker,
    bounceMarker: bounceMarker,
    centerOn: centerOn,
    closeInfoWindow: closeInfoWindow,
    getInfoWindowContent: getInfoWindowContent,
    getPlaceDetails: getPlaceDetails,
    init: init,
    modifyMarker: modifyMarker,
    onBoundsChange: onBoundsChange,
    onInfoWindowClose: onInfoWindowClose,
    onMapDblClick: onMapDblClick,
    onMarkerClick: onMarkerClick,
    onPlacesChanged: onPlacesChanged,
    openInfoWindow: openInfoWindow,
    recenter: recenter,
    removeMarker: removeMarker,
    setInfoWindowContent: setInfoWindowContent,
    triggerResize: triggerResize,
    visibleOnMap: visibleOnMap
  };

  /**
   * Creates a marker and adds it to the map.
   */
  function addMarker(markerData) {
    markerData.map = map;
    markerData.animation = google.maps.Animation.DROP;

    // Normalize id to string.
    markerData.id = markerData.id.toString();

    var marker = new google.maps.Marker(markerData);
    markers.push(marker);
  }

  /**
   * Starts a bounce animation on the given marker, then ends it after a short duration.
   */
  function bounceMarker(markerID) {
    var duration = 2,  // Seconds.
        marker = getMarker(markerID);

    marker.setAnimation(google.maps.Animation.BOUNCE);

    window.setTimeout(end, duration * 1000);

    function end() {
      marker.setAnimation(null);
    }
  }

  /**
   * Centers the map on the marker or set of markers.
   */
  function centerOn(markerIDs) {
    if (!Array.isArray(markerIDs)) {
      // Simple case: A single marker was passed.

      var marker = getMarker(markerIDs);
      map.panTo(marker.getPosition());
    } else {
      // An array of multiple markers.

      var bounds = new google.maps.LatLngBounds();

      markerIDs.forEach(function(id) {
        bounds.extend(getMarker(id).getPosition());
      });

      map.fitBounds(bounds);
    }

    saveOptions();
  }

  /**
   * Returns the info window's content.
   */
  function getInfoWindowContent() {
    return infoWindow.getContent();
  }

  /**
   * Returns the marker matching the given id.
   */
  function getMarker(id) {
    // Normalize id to string.
    id = id.toString();

    for (var i = 0; i < markers.length; i++) {
      if (markers[i].id === id) {
        return markers[i];
      }
    }

    // If we made it here, the marker wasn't found.
    return null;
  }

  /**
   * Initializes the map and related services.
   */
  function init() {
    google = global.google;

    // Throw an error if google isn't found.
    if (!google) {
      throw new Error('Google Maps API not found.');
    }

    // Throw an error if the google map wasn't initialized.
    if (!global.map) {
      throw new Error('Google Map not initialized.');
    }

    // map = map;
    // service = service;
    // infoWindow = infoWindow;

    // Save options when the bounds change.
    onBoundsChange(saveOptions);
  }

  // /**
  //  * Modifies a marker on the map. (Currently only supports changing visiblility.)
  //  */
  // function modifyMarker(markerID, newData) {
  //   var marker = getMarker(markerID);
  //
  //   if (marker) {
  //     if (newData.hasOwnProperty('visible')) {
  //       marker.setVisible(newData.visible);
  //     }
  //   } else {
  //     console.warn('Failed to modify marker because it wasn\'t found.');
  //   }
  // }

  /**
   * Adds a `bounds_changed` event listener to the map and calls the function `fn`
   * when the event fires.
   */
  function onBoundsChange(fn) {
    return map.addListener('bounds_changed', fn);
  }

  /**
   * Adds a `click` event listener to the marker and calls the function `fn` when
   * the event fires.
   */
  function onMarkerClick(markerID, fn) {
    var marker = getMarker(markerID);

    return marker.addListener('click', fn);
  }

  /**
   * Opens the info window on the identified marker and suspends scroll zooming.
   */
  function openInfoWindow(markerID) {
    var marker = getMarker(markerID),
        mapOpts = JSON.parse(localStorage.getItem(storageKeys.MAPOPTIONS)),
        canScroll = mapOpts.hasOwnProperty('scrollwheel') ? mapOpts.scrollwheel : true;

    // If scroll zooming isn't disabled in the saved map options...
    if (canScroll) {
      suspendScrollZoom();
    }

    infoWindow.open(map, marker);

    /**
     * Suspends scroll zooming while the info window is open.
     */
    function suspendScrollZoom() {
      // If scrolling isn't already suspended...
      if (!unsuspendScrollZoomListener) {
        unsuspendScrollZoomListener = infoWindow.addListener('closeclick', unsuspend);
        map.setOptions({scrollwheel: false});
      }

      function unsuspend() {
        map.setOptions({scrollwheel: true});
        unsuspendScrollZoomListener.remove();
        unsuspendScrollZoomListener = null;
      }
    }
  }

  /**
   * Recenters the map on the center saved in mapOptions.
   */
  function recenter() {
    var mapOptions = JSON.parse(localStorage.getItem(storageKeys.MAPOPTIONS));
    map.panTo(mapOptions.center);
  }

  /**
   * Saves the map options (center and zoom).
   */
  function saveOptions() {
    // Update the saved map options with the new center.
    var mapOptions = JSON.parse(localStorage.getItem(storageKeys.MAPOPTIONS));
    mapOptions.center = map.getCenter();
    mapOptions.zoom = map.getZoom();
    localStorage.setItem(storageKeys.MAPOPTIONS, JSON.stringify(mapOptions));
  }

  /**
   * Sets the content of the info window.
   */
  function setInfoWindowContent(content) {
    infoWindow.setContent(content);
  }

  /**
   * Triggers the resize event.
   */
  function triggerResize() {
    google.maps.event.trigger(map, 'resize');
  }

  /**
   * Returns true if the marker is currently within the map's visible bounds,
   * otherwise returns false.
   */
  function visibleOnMap(markerID) {
    var marker = getMarker(markerID);

    return map.getBounds().contains(marker.getPosition());
  }

})(this);
