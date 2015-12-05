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
.controller('MainController', function($scope, $state) {
	if($state.is('')) {
		state.go('home');
	}

	$scope.user = {
		id : "",
		email: ""
	}
})
.controller('HomeController', function($scope, $state) {

})
.controller('BrowseController', function($scope) {

})
.controller('LoginController', function($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray) {
  // display sign in first
	$scope.signUpView = false;

	// initialize firebase
	var ref = new Firebase("https://welp-uw.firebaseio.com");
	var usersRef = ref.child('users');

	$scope.users = $firebaseObject(usersRef);
	// authorization object
	$scope.authObj = $firebaseAuth(ref);

	// test if user is already logged in
	var authData = $scope.authObj.$getAuth();

	// LogIn
	$scope.logIn = function(userEmail, userPassword) {
		return $scope.authObj.$authWithPassword({
			email: userEmail,
			password: userPassword
		});
	};

	// SignUp
	$scope.signUp = function() {
		//create user
		$scope.authObj.$createUser({
			email: $scope.newEmail,
			password: $scope.newPassword
		}).then($scope.logIn($scope.newEmail, $scope.newPassword))
		.then(function (authData) {
			$scope.user = {
				id: authData.uid,
				email: $scope.newEmail
		  	}
			// add user to users firebase array
			$scope.users[authData.uid] = {
				//set user data
				email: $scope.newEmail
			};
			//save firebase array
			$scope.users.$save();
			$state.go('home');
		}).catch(function (error) {
			$scope.error = error;
      $scope.user = {
        id: "",
        email: ""
      }
		});
	};

	// SignIn
	$scope.signIn = function() {
		$scope.logIn($scope.email, $scope.password)
		.then(function(authData) {
			$scope.user.id = authData.uid;
			$state.go('home');
		}).catch(function(error) {
			$scope.error = error;
		});
	};

	// LogOut
	$scope.logOut = function() {
		$scope.authObj.$unauth();
		$scope.user.id = null;
		return;
	};


	//if directed to from logged in user
	if(authData) {
		$scope.logOut();
	}
});
