//Angular ui-router
var app = angular.module('app', ['firebase', 'ui.router'])
//configure pages
.config(function($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'templates/home.html',
        controller: 'HomeController'
    })
    .state('browse', {
        url: '/browse',
        templateUrl: 'templates/browse.html',
        controller: 'BrowseController'
    })
    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginController'
    });
})
.controller('HomeController', function($scope) {
    $scope.categories = ["Classes", "Majors", "Food", "Dining Halls", "Activities", "RSOs"];
    $('category').each(function(element, index) {
        element.css('background-image', url('assets/home/' + $scope.categories[index].toLowerCase() + '.jpg'));
    })
})
.controller('BrowseController', function($scope) {

})
.controller('LoginController', function($scope) {

});