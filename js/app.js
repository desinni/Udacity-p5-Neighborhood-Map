var city = ko.observable("London, UK");

var initialPlaces = [
  {
    title: "The British Museum",
    lat: 51.519360,
    lng: -0.127038,
    placeId: "ChIJB9OTMDIbdkgRp0JWbQGZsS8"
  },
  {
    title: "London Eye",
    lat: 51.503333,
    lng: -0.119571,
    placeId: "ChIJc2nSALkEdkgRkuoJJBfzkUI"
  },
  {
    title: "Buckingham Palace",
    lat: 51.501337,
    lng: -0.141271,
    placeId: "ChIJtV5bzSAFdkgRpwLZFPWrJgo"
  },
  {
    title: "Madame Tussauds London",
    lat: 51.522802,
    lng: -0.154962,
    placeId: "ChIJgZ24Us4adkgRpDNAwNPO_SY"
  },
  {
    title: "Big Ben",
    lat: 51.500722,
    lng: -0.124379,
    placeId: "ChIJ2dGMjMMEdkgRqVqkuXQkj7c"
  }
];

var Place = function(data) {
  this.title = ko.observable(data.title);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
};

var ViewModel = function() {
  var self = this;

  this.placeList = ko.observableArray([]);

  initialPlaces.forEach(function(placeItem){
    self.placeList.push(new Place(placeItem));
  });

  // this.setCat = function(clickedCat) {
  //   self.currentCat(clickedCat);
  // };
};

ko.applyBindings(new ViewModel());

/*
 * Open/close the drawer when the menu icon is clicked.
 */

var menuBtn = $('.menu-btn'),
    main = $('.main'),
    menu = $('#drawer');

menuBtn.click(function() {
  menu.toggleClass('menu__is-closed');
  main.toggleClass('col-sm-9');
  main.toggleClass('col-sm-12');
});


// main1.click(function() {
//   menu1.removeClass('menu__is-closed');
// });
