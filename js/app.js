//Angular ui-router
var app = angular.module('app', ['firebase', 'ui.router'])
//configure pages
.config(function($stateProvider) {
    $stateProvider.state('home', {
        url: '',
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
    })
	.state('createClass', {
		url: '/browse/create-class',
		templateUrl: 'templates/create-class.html',
		controller: 'CreateClassController',
		params: {'department': null}
	})
	.state('reviewClass', {
		url: '/browse/review',
		templateUrl: 'templates/review.html',
		controller: 'ReviewClassController',
		params: {'class': null, 'department': null}
	});
})
.controller('MainController', function($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray) {
	var ref = new Firebase("https://welp-uw.firebaseio.com");
	$scope.users = $firebaseObject(ref.child('users'));
	$scope.departments = $firebaseArray(ref.child('departments'));
	$scope.authObj = $firebaseAuth(ref);

	// if user is logged in
	$scope.authObj.$onAuth(function(authData) {
		if(authData) {
			$scope.users.$loaded(function () {
				$scope.user = $scope.users[authData.uid];
				console.log('auth change');
				console.log(authData);
				console.log($scope.user);
			});
		} else {
			$scope.user = {};
		}
	});

	$state.go('home');

})
.controller('HomeController', function($scope, $state, $firebaseArray) {
	$scope.clicked = false;
})
.controller('BrowseController', function($scope, $firebaseArray) {
	$scope.clicked = false; 
})
.controller('LoginController', function($scope, $state, $firebaseAuth, $firebaseObject, $firebaseArray) {
  // display sign in first
	$scope.signUpView = false;

	// test if user is already logged in
	var authData = $scope.authObj.$getAuth();
	console.log(authData);
	// logout
	if(authData) {
		$scope.authObj.$unauth();
		$scope.user = {};
		console.log('logout');
	}

	// LogIn
	$scope.logIn = function(userEmail, userPassword) {
		// get user by credentials
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
		}).then(function() {
			return $scope.logIn($scope.newEmail, $scope.newPassword);
		})
		.then(function(authData) {
			console.log(authData);
			//add user to firebase
			$scope.$parent.user = {
				//set user data
				id: authData.uid,
				email: $scope.newEmail
			};
			$scope.users[authData.uid] = $scope.user;
			//save firebase array
			$scope.users.$save();
			//go home
			$state.go('home');
		}).catch(function (error) {
			//display error message
			$scope.error = error;
		});
	};

	// SignIn
	$scope.signIn = function() {
		$scope.logIn($scope.email, $scope.password)
		.then(function() {
			$state.go('home');
		}).catch(function(error) {
			//display error message
			$scope.error = error;
		});
	};
})
.controller('CreateClassController', function($scope, $state, $stateParams, $firebaseArray) {
	var department = departments[$stateParams.department.$id];
	$scope.departmentTitle = $stateParams.department.title;
	$scope.classes = $firebaseArray(department.child('classes'));

		$scope.submitClass = function() {
		$scope.classes.$add({
			'classTitle': $scope.classTitle,
			'courseNumber': $scope.courseNumber,
			'description': $scope.description
		});
		$scope.classes.$save();
		$state.go('browse');
	}
})
.controller('ReviewClassController', function($scope, $state, $stateParams) {

  	$(function() {
    	$('.bar').barrating({
       		theme: 'bars-movie',
       		readonly: true
     	});

     	$('.review').barrating({
     		theme: 'bars-movie'
     	});
  	});

  	$scope.saveReview = function() {
		console.log($scope.workload)
  	};

	$scope.classTitle = $stateParams.class.classTitle;
	$scope.classDescription = $stateParams.class.description;


	console.log($stateParams.class);
	console.log($stateParams.department);

	$(function() {
 		$('.bar').barrating({
   			theme: 'bars-movie'
 		});
  	});
});
