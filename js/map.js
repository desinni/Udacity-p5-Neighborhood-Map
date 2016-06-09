var _map = {};

function initMap() {
  _map.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 51.515083, lng: -0.122462},
    zoom: 13
  });

  _map.markers = [];
  _map.infowindow = new google.maps.InfoWindow();
  _map.service = new google.maps.places.PlacesService(_map.map);
  _map.initMarkers(initialPlaces);
}

function initMarkers(places) {
  for (var i = 0; i < places.length; i++) {
    var marker = new google.maps.Marker({
      position: {lat: places[i].lat, lng: places[i].lng},
      title: places[i].title,
      id: places[i].placeId,
      map: _map.map,
      animation: google.maps.Animation.DROP
    });
    _map.markers.push(marker);
  }
}

_map.initMarkers = initMarkers;

  //
  // function bounceMarker(marker){
  //   var duration = 1.5;  // Seconds.
  //   console.log(marker.id);
  //   marker.setAnimation(google.maps.Animation.BOUNCE);
  //
  //   window.setTimeout(end, duration * 1000);
  //
  //   function end() {
  //     marker.setAnimation(null);
  //   }
  // }
  //
  // markers.forEach(function(location){
  //   service.getDetails({
  //     placeId: location.id
  //   }, function(place, status) {
  //     if (status === google.maps.places.PlacesServiceStatus.OK) {
  //       google.maps.event.addListener(location, 'click', function() {
  //         bounceMarker(location);
  //         infowindow.setContent('<div id="venue-info" class="text-center">' +
  //           '<h2><a href="' + place.website + '" target="_blank">' + place.name + '</a></h2>' +
  //           '<ul class="google-result-details">' +
  //           '<li class="google-result-detail">' + place.formatted_address + '</li>' +
  //           '<li class="google-result-detail">' + place.international_phone_number + '</li>' +	                '<li class="google-result-detail">Rating: ' + place.rating + ' / 5 </li>' +
  //           '</ul>' +
  //           '</div>' +
  //           '<div id="foursquare" class="text-center"></div>');
  //         addFoursquareContent(place.geometry.location);
  //         infowindow.open(map, this);
  //       });
  //     }
  //   });
  // });
  //
  // function addFoursquareContent(place){
  //   $.ajax({
  //     url: 'https://api.foursquare.com/v2/venues/explore',
  //     data: {
  //       client_id: 'GYFRUTH4OUDFVOKB41NKCHW4HRIINZYEWISECOHXIILXMGMV',  // You've found a key! Unfortunately, the key you're looking for is in another castle.
  //       client_secret: 'H1EAHQSYMIJCB2UIG1YMNH3SSTGLELGS3KBA20BW0AEJ122L',  // Oh man! You've found a secret! Unfortunately, it's not a very good secret.
  //       v: 20160324,
  //       m: 'foursquare',
  //       limit: 7,
  //       ll: place.lat() + ',' + place.lng(),
  //       venuePhotos: 1,  // Include photos.
  //       sortByDistance: 1  // Sort results by distance.
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
  //           var $foursquare = $('#foursquare');
  //           var nearVenue, venuePhoto;
  //           $foursquare.append('<hr /><strong>Nearby Venues from Foursquare</strong>');
  //           for (var i = 1; i < group.items.length; i++) {
  //             nearVenue = group.items[i].venue;
  //             venuePhoto = '<img src="' + nearVenue.photos.groups[0].items[0].prefix + '500x450' +  nearVenue.photos.groups[0].items[0].suffix + '" alt="' + nearVenue.name + '" />';
  //             // console.log(nearVenue);
  //             $foursquare.append('<div id="venue-info-foursquare">' +
  //             '<h2><a href="https://foursquare.com/v/' + nearVenue.id + '?ref=GYFRUTH4OUDFVOKB41NKCHW4HRIINZYEWISECOHXIILXMGMV" target="_blank">' + nearVenue.name + '</a></h2>' +
  //             '<ul class="foursquare-result-details">' +
  //             '<li class="foursquare-result-detail">' + nearVenue.categories[0].name + '</li>' +
  //             '<li class="foursquare-result-detail">Address: ' + nearVenue.location.formattedAddress + '</li>' +
  //             '<li class="foursquare-result-detail">Rating: ' + nearVenue.rating + ' / 10 </li>' +
  //             '<li class="foursquare-result-detail">Chekins: ' + nearVenue.stats.checkinsCount + '</li>' +
  //             '<li class="foursquare-result-detail">' + venuePhoto + '</li>' +
  //             '</ul>' +
  //             '</div>');
  //           }
  //         }
  //       }
  //     }
  //   });
  // }
