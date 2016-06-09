function appViewModel() {
  var self = this;
  var london,
      map,
      infowindow,
      bounds;
  this.city = ko.observable("London, UK");
  this.foursquareid = ko.observable(null);
  this.foursquareid.extend({rateLimit: 50});
  this.address = ko.observableArray([]);
  this.address.extend({rateLimit: 50});
  this.photos = ko.observableArray([]);
  this.photos.extend({rateLimit: 50});


  /**
   * Creates the map and sets the center to London.  Then gets popular
   * places in the area, which are requested in a function below.
   */
  function initialize() {
    london = new google.maps.LatLng(51.514100, -0.119483);
    map = new google.maps.Map(document.getElementById('map'), {
      center: london,
      zoom: 13,
      disableDefaultUI: true
    });
    getAllPlaces();
  }

  /**
   * Makes a request to Google for popular places in London.
   * Executes a callback function with the response data from Google.
   */
  function getAllPlaces() {
    self.allPlaces([]);
    var request = {
      location: london,
      radius: 1000,
      types: ['night_club']
    };
    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, getAllPlacesCallback);
  }

  /**
   * Gets resulting places from getAllPlaces Google request.
   * Adds additional properties to the places and adds them to the allPlaces array.
   */
  function getAllPlacesCallback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Create new bounds for the map.  Will be updated with each new
      // location.  This will be used to make sure all markers are
      // visible on the map after the search.
      bounds = new google.maps.LatLngBounds();
      results.forEach(function(place) {
        place.marker = createMarker(place);
        // console.log(place.name + ' ' + place.rating + ' || ' + place.types[0] + ' ||| ' + place.vicinity);
        // console.log('ID ' + place.id);
        // console.log('GOOGLE ID '  + place.place_id);

        // Array to store data from Foursquare API request.
        place.foursquare = ko.observableArray([]);
        /**
         * Property that is true if the getFoursquare function is still
         * running for this place.  Used to distinguish difference
         * places with no Foursquare data and places that are still
         * in the process of getting the data.
         */
        place.gettingFoursquareData = ko.observable(true);
        /**
         * If property is true, place will be included in the
         * filteredPlaces array and will be displayed on screen.
         * Initially, all places will be in the filteredPlaces Array.
         */
        place.isInFilteredList = ko.observable(true);
        self.allPlaces.push(place);
        // getFoursquareData(place);
        bounds.extend(new google.maps.LatLng(
          place.geometry.location.lat(),
          place.geometry.location.lng()));
      });
      // Done looping through results so fit map to include all markers.
      map.fitBounds(bounds);
    }
  }

  // Takes a PlaceResult object and puts a marker on the map at its location.
  function createMarker(place) {
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      title: place.name,
      animation: google.maps.Animation.DROP
    });
    // When a marker is clicked scroll the corresponding list view element
    // into view and click it.
    google.maps.event.addListener(marker, 'click', function () {
      document.getElementById(place.id).scrollIntoView();
      $('#' + place.id).trigger('click');
    });
    return marker;
  }

  /**
   * Gets numeric value for day of week and converts it to match values
   * used in the PlaceResult object opening_hours property.
   * @return {number} today Numeric value corresponding to day of week.
   */
  function getDayofWeek() {
      var date = new Date();
      var today = date.getDay();
      if (today === 0) {
          today = 6;
      } else {
          today -= 1;
      }
      return today;
  }

  // Resizes photo being displayed based on the window size.
  function resizePhoto() {
      if ($(window).height() < $(window).width()) {
          self.photoDimensionValue($(window).height() - 160);
      } else {
          self.photoDimensionValue(0.9 * $(window).width());
      }
  }

  // function getFoursquareData(place) {
  //   // console.log(place.geometry.location.lat());
  //   $.ajax({
  //     url: 'https://api.foursquare.com/v2/venues/explore',
  //     data: {
  //       client_id: 'GYFRUTH4OUDFVOKB41NKCHW4HRIINZYEWISECOHXIILXMGMV',  // You've found a key! Unfortunately, the key you're looking for is in another castle.
  //       client_secret: 'H1EAHQSYMIJCB2UIG1YMNH3SSTGLELGS3KBA20BW0AEJ122L',  // Oh man! You've found a secret! Unfortunately, it's not a very good secret.
  //       v: 20160324,
  //       m: 'foursquare',
  //       limit: 5,
  //       ll: place.geometry.location.lat() + ',' + place.geometry.location.lng(),
  //       venuePhotos: 1,  // Include photos.
  //       // sortByDistance: 1  // Sort results by distance.
  //       radius: 800
  //     },
  //     dataType: 'json'
  //   })
  //   .done(function(data) {
  //     if (data.response.groups) {
  //       for (var group in data.response.groups) {
  //         // Avoid unintentionally iterating over prototype properties.
  //         if (data.response.groups.hasOwnProperty(group)) {
  //           group = data.response.groups[group];
  //
  //           console.log(data.response.venues[0]);
  //         }
  //       }
  //     }
  //   });
  // }



  // An array that will contain all places that are initially retrieved by
  // the getAllPlaces function.
  self.allPlaces = ko.observableArray([]);

  // Array derived from allPlaces.  Contains each place that met the search
  // criteria that the user entered.
  self.filteredPlaces = ko.computed(function () {
    return self.allPlaces().filter(function (place) {
      return place.isInFilteredList();
    });
  });

  // Currently selected location.
  self.chosenPlace = ko.observable();

  // Value associated with user input from search bar used to filter results.
  self.query = ko.observable('');


  // Break the user's search query into separate words and make them lowercase
  // for comparison between the places in allPlaces.
  self.searchTerms = ko.computed(function () {
      return self.query().toLowerCase().split(' ');
  });

  /*
   * Takes user's input in search bar and compares each word against the name
   * of each place in allPlaces.  Also compares against the place's type
   * (bar, restaurant, etc.).  All places are initially removed from the
   * filteredPlaces array then added back if the comparison between name or
   * type returns true.
   */
  self.search = function () {
    self.chosenPlace(null);
    infowindow.setMap(null);
    self.allPlaces().forEach(function (place) {
      place.isInFilteredList(false);
      place.marker.setMap(null);
    });
    self.searchTerms().forEach(function (word) {
      self.allPlaces().forEach(function (place) {
        // If search term is in the place's name or if the search term
        // is one of the place's types, that is a match.
        if (place.name.toLowerCase().indexOf(word) !== -1 || place.types.indexOf(word) !== -1) {
          place.isInFilteredList(true);
          place.marker.setMap(map);
        }
      });
    });
  };

  function bounceMarker(marker){
    var duration = 1.5;  // Seconds.
    marker.setAnimation(google.maps.Animation.BOUNCE);

    window.setTimeout(end, duration * 1000);

    function end() {
      marker.setAnimation(null);
    }
  }

  // Sets which place is the chosenPlace, makes its marker bounce, and
  // displays its infowindow.
  self.selectPlace = function(place) {
    if (place === self.chosenPlace()) {
      self.displayInfo(place);
    } else {
      self.filteredPlaces().forEach(function (result) {
        result.marker.setAnimation(null);
      });
      self.chosenPlace(place);
      // self.chosenPhotoIndex(0);
      bounceMarker(place.marker);
      self.displayInfo(place);
    }
  };

  // Boolean to determine whether or not to show the list view.
  self.displayingList = ko.observable(true);

  // Determines which icon the button that toggles the list view will have.
  // Based on whether or not list is currently displaying.
  self.listToggleIcon = ko.computed(function () {
      if (self.displayingList()) {
          return 'fa fa-minus-square fa-2x fa-inverse';
      }
      return 'fa fa-plus-square fa-2x fa-inverse';
  });

  // If list view is shown, hide it.  Otherwise, show it.
  self.toggleListDisplay = function () {
    if (self.displayingList()) {
      self.displayingList(false);
    } else {
      self.displayingList(true);
    }
  };

  /*
   * Executes a getDetails request for the selected place and displays the
   * infowindow for the place with the resulting information.
   * @param {Object} place A PlaceResult object.
   */
  self.displayInfo = function (place) {
    var request = {
      placeId: place.place_id
    };
    service.getDetails(request, function (details, status) {
      // Default values to display if getDetails fails.
      var locName = '<h4>' + place.name + '</h4>';
      var locAddress = '';
      var locPhone = '';
      var locRating = '';
      // var locOpenHours = '';
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        if (details.website) {
          // Add a link to the location's website in the place's name.
          locName = '<h4><a target="_blank" href=' + details.website +
            '>' + place.name + '</a></h4>';
          }
          if (details.international_phone_number) {
            locPhone = '<p>Phone: ' + details.international_phone_number + '</p>';
          }
          if (details.formatted_address) {
            locAddress = '<p>' + details.formatted_address + '</p>';
          }
          if (details.rating) {
            locRating = '<p>Rating: ' + details.rating + ' / 5 </p>';
          }
          // var today = getDayofWeek();
          // if (details.opening_hours &&
          //   details.opening_hours.weekday_text) {
          //   openHours = details.opening_hours.weekday_text[today];
          //   openHours = openHours.replace(dateMap[today] + ':',
          //     "Today's Hours:");
          //   locOpenHours = '<p>' + openHours + '</p>';
          // }
        }
        var content = '<div class="infowindow">' + locName + locAddress + locPhone + locRating + '</div>';
        infowindow.setContent(content);
        infowindow.open(map, place.marker);
        map.panTo(place.marker.position);
      });
  };

  initialize();

  // When infowindow is closed, deselect the place as chosenPlace.
  google.maps.event.addListener(infowindow,'closeclick',function(){
    self.chosenPlace(null);
  });

  // When the page loads, if the width is less than 650px, hide the list view
  $(function () {
    if ($(window).width() < 650) {
      if (self.displayingList()) {
        self.displayingList(false);
      }
    }
  }());
}

ko.applyBindings(new appViewModel());
