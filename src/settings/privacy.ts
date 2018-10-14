module itweet.privacy {

	export class PrivacyController {
        public static $inject = ['$scope', 'gettextCatalog'];
        constructor(private $scope:AppControllerScope,
                    private gettextCatalog){
                
            $scope.menu_parameters.title = gettextCatalog.getString('privacy_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
            
        }
	}

	angular.module('itweet.privacy', ['gettext','ui.router','ngMaterial'])
            .controller('PrivacyController', PrivacyController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.privacy', {
                url: "/privacy",
                templateUrl: "settings/privacy.html",
                controller: 'PrivacyController'
            });
        }
    ]);

}