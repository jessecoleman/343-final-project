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
    })
	.state('createClass', {
		url: '/browse/create-class',
		templateUrl: 'templates/create-class.html',
		controller: 'CreateClassController',
		params: {'department': null}
	});
})
.controller('MainController', function($scope, $state, $firebaseAuth, $firebaseObject) {
	var ref = new Firebase("https://welp-uw.firebaseio.com");
	var usersRef = ref.child('users');
	var authObj = $firebaseAuth(ref);
	var authData = authObj.$getAuth();

	$scope.users = $firebaseObject(usersRef);

	if($state.is('')) {
		state.go('home');
	}

	$scope.user = {};

})
.controller('HomeController', function($scope, $state) {
	console.log($scope.user);
})
.controller('BrowseController', function($scope, $firebaseArray) {
	var ref = new Firebase("https://welp-uw.firebaseio.com");
	var departmentsRef = ref.child('departments');
	$scope.departments = $firebaseArray(departmentsRef);
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
			// add user to users firebase array
			$scope.users[authData.uid] = {
				//set user data
				id: authData.uid,
				email: $scope.newEmail
			};
			//save firebase array
			$scope.users.$save();
			$state.go('home');
		}).catch(function (error) {
			//display error message
			$scope.error = error;
		  	//clear user data from scope
			console.log('error');
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
			$scope.user = {
				id: "",
				email: ""
			}
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
})
.controller('CreateClassController', function($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
	var ref = new Firebase("https://welp-uw.firebaseio.com");
	var departments = ref.child('departments');
	var department = departments.child($stateParams.department.$id);
	$scope.departmentTitle = $stateParams.department.title;
	var classes = department.child('classes');
	$scope.classes = $firebaseArray(classes);


	$scope.submitClass = function() {
		$scope.classes.$add({
			'classTitle': $scope.classTitle,
			'courseNumber': $scope.courseNumber
		});
		$scope.classes.$save();
		$state.go('browse');
	}
});
