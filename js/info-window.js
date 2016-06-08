// nesutvarkyta

(function(global) {

  global.viewmodel = global.viewmodel;

  global.viemodel.InfoWindow = InfoWindow;

  function InfoWindow(mainViewModel) {
    var self = this,
      document = global.document,
      map = global.map,
      placeInfo = global.placeInfo,
      ko = global.ko;
  }

  // Close the info window
  self.close = function() {
    map.closeInfoWindow();
  };

  // Open the info window on the given marker
  self.open = function(marker) {
    // Close the info window if it is open
    if (self.marker()) {
      self.close();
    }

    var content = createContent();
    self.marker(marker);
    self.refresh();
    map.setInfoWindowContent(content);
    map.openInfoWindow(marker.placeId());

    // Apply KO bindings to the newly created content
    ko.applyBindings(self, content);

    function createContent() {
      var content = document.createElement('div');
      content.classList.add('info-window');

      var article = document.createElement('article');
      article.innerHTML = '<h1 data-bind="text: marker().title"></h1>' +
                          '<h2 class="additional-info-title">Details from Google</h2>' +
                          '<div class="additional-info-results">' + resultsFromGoogle() + '</div>';

      markers.forEach(function(location) {
        service.getDetails({
          placeId: location.id
        }, function(place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            google.maps.event.addListener(location, 'click', function() {
              infowindow.setContent('<div id="venue-info" class="text-center">' +
                '<h1><a href="' + place.website + '" target="_blank">' + place.name + '</a></h1>' +
                '<ul class="google-result-details">' +
                '<li class="google-result-detail">' + place.formatted_address + '</li>' +
                '<li class="google-result-detail">' + place.international_phone_number + '</li>' +
                '<li class="google-result-detail">Rating: ' + place.rating + ' / 5 </li>' +
                '</ul>' +
                '</div>');
              addFoursquareContent(place.geometry.location);
              infowindow.open(map, this);
            });
          }
        });
      });

      content.appendChild(article);
      return content;
    }
  };

})(this);
