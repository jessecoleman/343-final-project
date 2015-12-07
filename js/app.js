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
		url: '/browse/create-class/:department',
		templateUrl: 'templates/create-class.html',
		controller: 'CreateClassController'
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
	$scope.departmentsRef = ref.child('departments');
	$scope.departments = $firebaseArray($scope.departmentsRef);
	$scope.authObj = $firebaseAuth(ref);

	// if user is logged in
	$scope.authObj.$onAuth(function(authData) {
		if(authData) {
			$scope.users.$loaded(function () {
				$scope.user = $scope.users[authData.uid];
			});
		} else {
			$scope.user = {};
		}
	});

	$state.go('home');

})
.controller('HomeController', function($scope) {
	$scope.clicked = false;
})
.controller('BrowseController', function($scope) {
	$scope.clicked = false; 
})
.controller('LoginController', function($scope, $state) {
  // display sign in first
	$scope.signUpView = false;

	// test if user is already logged in
	var authData = $scope.authObj.$getAuth();
	// logout
	if(authData) {
		$scope.authObj.$unauth();
		$scope.user = {};
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
.controller('CreateClassController', function($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {
	var departmentRef = $scope.departmentsRef.child($stateParams.department);
	$scope.department = $firebaseObject(departmentRef);
	var classesRef = departmentRef.child('classes');
	$scope.classes = $firebaseArray(classesRef);

	$scope.submitClass = function() {
		var newClass = classesRef.push(); 
		newClass.set({
			'classTitle': $scope.classTitle,
			'courseNumber': $scope.courseNumber,
			'description': $scope.description,
			'id': newClass.key()
		});
		$scope.classes.$save();
		$state.go('browse');
	}
})
.controller('ReviewClassController', function($scope, $state, $stateParams, $firebaseArray, $firebaseObject) {

  	$(function() {
    	$('.bar').barrating({
       		theme: 'bars-movie',
       		readonly: true
     	});

     	$('.review').barrating({
     		theme: 'bars-movie'
     	});
  	});
 	var departmentRef = $scope.departmentsRef.child($stateParams.department);
	$scope.department = $firebaseObject(departmentRef);
	var classesRef = departmentRef.child('classes');
	$scope.classes = $firebaseArray(classesRef);

	var classesReff = classesRef.child($stateParams.class.id);
	var reviewsRef = classesReff.child('reviews');
	$scope.reviews = $firebaseArray(reviewsRef);
  	$scope.saveReview = function() {
  		//if ($scope.review == 0) 
  		$scope.reviews.$add({
  			'workload': workload.value,
  			'difficulty': difficulty.value,
  			'grading': grading.value,
  			'prof': $scope.prof,
  			'text': $scope.text
  		})
  		$scope.reviews.$save(); 
  		$scope.workload = workload.value;
  		$scope.difficulty = difficulty.value;
  		$scope.grading = grading.value;
  		console.log($scope.workload);
  		console.log($scope.difficulty);
  		console.log($scope.grading);
    };
    $scope.review = $stateParams.class.reviews
	$scope.classTitle = $stateParams.class.classTitle;
	$scope.classDescription = $stateParams.class.description;
	console.log($stateParams.class);
	console.log($stateParams.department);
	console.log($stateParams.class.id);
});
