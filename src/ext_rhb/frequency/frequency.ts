module itweet.frequency {

	export interface RhBFrequencyControllerScope extends itweet.AppControllerScope{
		vm: RhBFrequencyController;
	}

	export class RhBFrequencyController {
		public loaded: Boolean = false;
		public trains:any;
		public selectedTrain:any;
		public searchTrainText: string;
        public refStatistics:any;
		public mappingItemQsStatistics: itweet.model.MappingItemQsStatistic[];
		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetNetwork', 'ItweetStorage', '$mdToast', '$log','$q','$window'
		];

		constructor(
			private $scope: RhBFrequencyControllerScope,
			private gettextCatalog,
            private network: itweet.model.RHBServiceFactory,
			private ItweetStorage: itweet.model.StorageService,
            private $mdDialog,
            private $log,
            private $q,
			private $window
		) {
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('object_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
			$scope.networkServiceHolder['primary'] = network.metadataService;
			
			$scope.$watch(() => { return network.metadataService.getResponseData() }, (newValue: itweet.model.MetadataResponse, oldValue) => {
				this.updateByMeta(newValue);
			});
			/* RHB FIX: FIXME REFACTOR */
			$scope.$watch(()=>  { return network.contextService.getResponseData(); }, (data)  => {
				if (data && data.length == 1) {
					var context = data[0];
					this.$scope.storageService.currentTweet.contextToken = context.contextToken;
				}
			});
			$scope.vm.searchTrainText = undefined;

			// Defaults
            if (!this.$scope.storageService.currentTweet.itemQs.dateEvent) {
                this.$scope.storageService.currentTweet.itemQs.dateEvent = new Date().getTime().toString();
            }
            if (!this.$scope.storageService.currentTweet.refItemVisibilityId) {
                this.$scope.storageService.currentTweet.refItemVisibilityId = 2; // internal
            }

			if (this.$scope.storageService.currentTweet.itemQs.refTrainId) {
				console.log('set storaged location',this.$scope.storageService.currentTweet.itemQs.refTrainId);
				$scope.vm.searchTrainText  = this.$scope.storageService.currentTweet.itemQs.refTrainName;
				this.selectedTrain = {
					id:this.$scope.storageService.currentTweet.itemQs.refTrainId,
					trainNr:this.$scope.storageService.currentTweet.itemQs.refTrainName.split(':')[0],
					carrier:this.$scope.storageService.currentTweet.itemQs.refTrainName.split(':')[1],
					route:this.$scope.storageService.currentTweet.itemQs.refTrainName.split(':')[2]

				}
			}
			if (this.$scope.storageService.currentTweet.itemQs.statistics) {
            	// Set null for 0-quantities
                for (var i = 0; i < this.$scope.storageService.currentTweet.itemQs.statistics.length; i++) {
                	if (this.$scope.storageService.currentTweet.itemQs.statistics[i].quantity == 0) {
                        this.$scope.storageService.currentTweet.itemQs.statistics[i].quantity = null;
					}
                }
				this.mappingItemQsStatistics = this.$scope.storageService.currentTweet.itemQs.statistics;
			} else {
                this.initStatistics();
            }
		}

		initStatistics() {
			if (!this.refStatistics || (this.mappingItemQsStatistics && this.mappingItemQsStatistics.length > 0)) {
				return;
			}
            var i: number;
            var mappingItemQsStatistic: itweet.model.MappingItemQsStatistic;
            this.mappingItemQsStatistics = new Array();
            for (i = 0; i < this.refStatistics.length; i++) {
                if (this.refStatistics[i].enabled) {
                    mappingItemQsStatistic = new itweet.model.MappingItemQsStatistic();
                    mappingItemQsStatistic.refStatistic = this.refStatistics[i];
                    mappingItemQsStatistic.quantity = null;
                    this.mappingItemQsStatistics.push(mappingItemQsStatistic);
                }
            }
		}

		updateByMeta(meta: itweet.model.MetadataResponse = this.network.metadataService.getResponseData()) {
			var i: number;
			var mappingItemQsStatistic: itweet.model.MappingItemQsStatistic;
			if(meta.trains){
				this.trains = new Array();
				for (i = 0; i < meta.trains.length; i++){
					if (meta.trains[i].enabled) {
						var newTrain = {
							id: meta.trains[i].id,
							carrier: meta.trains[i].carrier,
							route: meta.trains[i].route,
							trainNr: meta.trains[i].trainNr,
							query: meta.trains[i].trainNr
						}
						this.trains.push(newTrain);
					}
				}
			}
			if (meta.statistics) {
				this.refStatistics = meta.statistics;
				this.initStatistics();
			}

			this.loaded = true;
		}

		querySearch(type: string, query: string, list: any) {
			var results;
			if (type === "wagon") {
				results = list.filter(this.createFilterMatchWithin(query));
			} else {
				results = list.filter(this.createFilterMatchStart(query));
			}
			return results.slice(0, 50);
		}

		createFilterMatchWithin(input: string) {
			var query = input.toLowerCase();
			return function filterFn(item: any) {
				var i = (item.query.indexOf(query) >= 0);
				return i;
			};
		}

		createFilterMatchStart(input: string) {
			var query = input.toLowerCase();
			return function filterFn(item: any) {
				var i = (item.query.indexOf(query) === 0);
				return i;
			};
		}

		getFullTrain(train){
			return (train.trainNr+' : '+train.carrier+' : '+train.route).toString();
		}

		nextClicked(){
			
			if(this.selectedTrain){
				this.$scope.storageService.currentTweet.itemQs.refTrainId = this.selectedTrain.id;
				this.$scope.storageService.currentTweet.itemQs.refTrainName = this.getFullTrain(this.selectedTrain);
			} else
			{
				this.$scope.storageService.currentTweet.itemQs.refTrainId = null;
				this.$scope.storageService.currentTweet.itemQs.refTrainName = null;
			}

			// Set visibility
            this.$scope.storageService.currentTweet.refItemVisibilityId = 3; // User group

			// Clean statistics
            for (var i = 0; i < this.mappingItemQsStatistics.length; i++) {
                if (!this.mappingItemQsStatistics[i].quantity) {
                    this.mappingItemQsStatistics[i].quantity = 0;
                }
            }
            this.$scope.storageService.currentTweet.itemQs.statistics = this.mappingItemQsStatistics;

			this.$scope.navigationService.next();
		}

	}

	angular.module('itweet.rhb.frequency', ['gettext','ui.router','ngMaterial'])
            .controller('RhBFrequencyController', RhBFrequencyController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.rhb_frequency', {
                url: "/frequency",
                templateUrl: "ext_rhb/frequency/frequency.html",
                controller: 'RhBFrequencyController'
            });
            
        }
    ]);;
}