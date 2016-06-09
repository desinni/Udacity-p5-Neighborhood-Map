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
      zoom: 13
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
      self.chosenPhotoIndex(0);
      place.marker.setAnimation(google.maps.Animation.BOUNCE);
      self.displayInfo(place);
    }
  };

  // Boolean to determine whether or not to show the list view.
  self.displayingList = ko.observable(true);

  // If list view is shown, hide it.  Otherwise, show it.
  self.toggleListDisplay = function () {
    if (self.displayingList()) {
      self.displayingList(false);
    } else {
      self.displayingList(true);
    }
  };

  initialize();
}

ko.applyBindings(new appViewModel());
