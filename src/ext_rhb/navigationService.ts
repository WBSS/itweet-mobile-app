module itweet.navigation {
    export class State {
        constructor(public name: string, public params = {}) {

        }
    }

    export class NavigationService {

        public static $inject = [
            '$rootScope', '$state', '$previousState', 'gettextCatalog', '$mdDialog', '$log', 'ItweetStorage', 'itweetNetwork'
        ];

        private _stateStack: State[];

        private defaultStateOrder: { [id: string]: (n: NavigationService,params) => State; } = {
            'default': (n: NavigationService,params) => new State('app.category'),
            'login': (n: NavigationService,params) => new State('app.login'),
            'context': (n: NavigationService,params) => new State('app.context'),
            'overview': (n: NavigationService,params) => new State('app.overview'),
            'category': (n: NavigationService,params) => new State('app.category'),
            'app.rhb_location': (n: NavigationService,params) => new State('app.photo'),
            'alltweets': (n: NavigationService,params) => new State('app.alltweets'),
            'app.context': (n: NavigationService,params) => new State('app.category'),
            'app.category': (n: NavigationService,params) => {
                if (n.ItweetStorage.currentTweet.refItemCategory.short_ === "IDEAS") {
                    let elems = this._stateStack.filter((elem) => angular.equals(elem, this.defaultStateOrder['overview'](this,{})));
                    if (elems.length > 0) {
                        return new State('app.overview');
                    }
                    return new State('app.text_idea_what');
                }
                if (n.ItweetStorage.currentTweet.refItemCategory.short_ === "COMPLAINT") {
                    let elems = this._stateStack.filter((elem) => angular.equals(elem, this.defaultStateOrder['overview'](this,{})));
                    if (elems.length > 0) {
                        return new State('app.overview');
                    }
                    return new State('app.rhb_attribute_time');
                }
                if (n.ItweetStorage.currentTweet.refItemCategory.short_ === "QRINV") {
                    let elems = this._stateStack.filter((elem) => angular.equals(elem, this.defaultStateOrder['overview'](this,{})));
                    if (elems.length > 0) {
                        return new State('app.overview');
                    }
                    return new State('app.rhb_qr_inventory');
                }
                if (n.ItweetStorage.currentTweet.refItemCategory.short_ === "FREQUENCY") {
                    let elems = this._stateStack.filter((elem) => angular.equals(elem, this.defaultStateOrder['overview'](this,{})));
                    if (elems.length > 0) {
                        return new State('app.overview');
                    }
                    return new State('app.rhb_frequency');
                }
                return new State('app.multicategory', { parentId: undefined });
            },
            'app.multicategory': (n: NavigationService,params) => {
                let parentId = n.ItweetStorage.currentTweet.itemQs.refItemCategoryQsId;
                let items = n.network.metadataService.getResponseData().categoriesQs.filter((c) => c.parentId == parentId && c.enabled)
                let resp = new State('app.rhb_attribute_train');
                let elems = this._stateStack.filter((elem) => angular.equals(elem, this.defaultStateOrder['overview'](this,{})));
                
                if (elems.length > 0) {
                    resp = new State('app.overview');
                }
                if (items.length > 0 && (! params.skip)) {
                    resp = new State('app.multicategory', { parentId: parentId });
                }
                return resp;
            },
            'app.rhb_attribute_time': (n: NavigationService,params) => {
                if (n.ItweetStorage.currentTweet.refItemCategory.short_ === "IDEAS") {
                    let elems = this._stateStack.filter((elem) => angular.equals(elem, this.defaultStateOrder['overview'](this,{})));
                    if (elems.length > 0) {
                        return new State('app.overview');
                    }
                    return new State('app.photo');
                }
                if (n.ItweetStorage.currentTweet.refItemCategory.short_ === "FREQUENCY") {
                    return new State('app.overview');
                }

                let parentId = n.ItweetStorage.currentTweet.itemQs.refItemCategoryQsId;
                let resp = new State('app.rhb_location', { parentId: parentId });
                return resp;
            },
            'app.rhb_attribute_train': (n: NavigationService,params) => new State('app.rhb_attribute_time'),
            'app.photo': (n: NavigationService,params) => {
                if (n.ItweetStorage.currentTweet.refItemCategory.short_ === "IDEAS") {
                    return new State('app.rhb_visibility');
                }
                return new State('app.text');
            },
            'app.text': (n: NavigationService,params) => new State('app.rhb_attribute_involvedPersons'),
            'app.text_idea_what': (n: NavigationService,params) => new State('app.text_idea_who'),
            'app.text_idea_who': (n: NavigationService,params) => new State('app.text_idea_why'),
            'app.text_idea_why': (n: NavigationService,params) => new State('app.text_idea_how'),
            'app.text_idea_how': (n: NavigationService,params) => new State('app.photo'),
            'app.rhb_attribute_involvedPersons': (n: NavigationService) => new State('app.rhb_visibility'),
            'app.rhb_visibility': (n: NavigationService) => new State('app.overview'),
            'app.rhb_frequency': (n: NavigationService) => new State('app.overview')
        };

        constructor(
            public $rootScope: angular.IRootScopeService,
            public $state: angular.ui.IStateService,
            public $previousState,
            public gettextCatalog,
            public $mdDialog: any,
            public $log: angular.ILogService,
            public ItweetStorage: itweet.model.StorageService,
            public network: itweet.model.RHBServiceFactory
            ) {

            this._stateStack = [this.defaultStateOrder['default'](this,{})];

            document.addEventListener("backbutton", (evt) => {
                $rootScope.$apply(() => {
                    this.$log.debug(" Event.Backbutton");
                    evt.preventDefault();
                    evt.stopPropagation();
                    this.previous();
                });
            }, false);
        }

        private checkAuthorisation(nextState: State): State {
            console.log('AUTH');
            if (nextState.name == this.defaultStateOrder['context'](this,{}).name) {
                if (!this.ItweetStorage.user.createMessageAllowed) {
                    this.$log.debug("  CreateMessage Not Allowed --> Popup");
                    var alertPromise = this.$mdDialog.alert({
                        title: this.gettextCatalog.getString('login_title_create_not_allowed'),
                        content: this.gettextCatalog.getString('login_message_create_not_allowed'),
                        ok: this.gettextCatalog.getString('general_button_okay')
                    });

                    this.$mdDialog.show(alertPromise).finally(() => { alertPromise = undefined });

                    return undefined;
                } else if (!this.ItweetStorage.user.showContext) {
                    this.$log.debug("  ShowContext == false --> Category");
                    return this.defaultStateOrder['category'](this,{});
                }
            }
            return nextState;
        }

        currentState(): State {
            return this._stateStack[this._stateStack.length - 1] ||  this.defaultStateOrder['default'](this,{});
        }

        previousState(): State {
            return this._stateStack[this._stateStack.length - 2] ||  this.defaultStateOrder['default'](this,{});
        }

        next(replace: boolean = false, params = {}) {
            this.$log.debug("Next",this.defaultStateOrder,this.$state.current.name);
            
            let nextState = this.defaultStateOrder[this.$state.current.name](this,params);
            if (nextState != undefined) {
                // "dafault" Cases (aka tweet view controlers)
                let elems = this._stateStack.filter((elem) => angular.equals(elem, this.defaultStateOrder['overview'](this,{})));
                
                if(this.$state.current.name ==='app.category' || this.$state.current.name==='app.multicategory'){
                    elems=[];
                }
                if (elems.length > 0) {
                    this.$log.debug("  Pop to Overview");
                    this._stateStack.pop(); //TODO: maybe pop to _overviewState
                    this.go(this._stateStack.pop(), replace);
                } else {
                    this.go(nextState, replace);
                }
            } else {
                // "special" Cases (eg. settings)
                this.$log.debug(" No NextState in Default Navigation Array");
            }
        }

        previous(): void {
            this.$log.debug("Previous");
            var len = this._stateStack.length;
            if (len > 0) {
                if (this.isCurrentStateOverview()) {
                    this.$log.debug("  No Back on app.Overview");
                    this.startNewTweet();
                } else {
                    this._stateStack.pop();
                    this.go(this._stateStack.pop());
                }
            } else {
                this.$log.debug("  No Back. Previous is Unset");
                this.go(this.defaultStateOrder['default'](this,{}));
            }
        }

        goType(type: string) {
            this.go(this.defaultStateOrder[type](this,{}));
        }

        go(nextState: State = this.defaultStateOrder['default'](this,{}), replace: boolean = false) {
            this.$log.debug(" navigationService.go(" + JSON.stringify(nextState) + ")");
            if (!nextState) {
                nextState = this.defaultStateOrder['default'](this,{});
            }

            nextState = this.checkAuthorisation(nextState);
            if (!nextState) {
                return;
            }
            if (!replace) {
                this._stateStack.push(nextState);
            }
            this.$state.go(nextState.name, nextState.params);
        }

        startNewTweetSilent() {
            this.ItweetStorage.newTweet();
            this._stateStack = [];
            this.go();
        }

        startNewTweet(): void {
            if (this.ItweetStorage.currentTweet.sent) {
                this.startNewTweetSilent();
            } else {

                var alertPromise = this.$mdDialog.confirm({
                    title: this.gettextCatalog.getString('overview_cancel_option_title'),
                    content: this.gettextCatalog.getString('overview_cancel_option_message'),
                    ok: this.gettextCatalog.getString('general_button_okay'),
                    cancel: this.gettextCatalog.getString('personel_button_cancel')
                });
                this.$mdDialog.show(alertPromise)
                    .then(
                        () => {
                            this.startNewTweetSilent();
                        }
                        )
                    .finally(function() {
                        this.$mdDialog.hide(alertPromise);
                        alertPromise = undefined;
                    });
            }
        }

        logout(): void {
            this._stateStack = [];
            this.go(this.defaultStateOrder['login'](this,{}));
        }

        shouldDisplayBackbutton(): boolean {
            return (((this._stateStack.length > 1) && !this.isCurrentStateOverview() && !this.isPreviousStateOverview()) || this.$state.current.name === 'app.mytweets' || this.$state.current.name === 'app.settings');
        }

        shouldDisplayAllMessages(): boolean {
            return !this.shouldDisplayBackbutton()
        }

        shouldShowNoNavigationButtons(): boolean {
            return false;
        }

        isCurrentStateOverview(): boolean {
            return angular.equals(this.currentState(), this.defaultStateOrder['overview'](this,{}));
        }

        isPreviousStateOverview(): boolean {
            return angular.equals(this.previousState(), this.defaultStateOrder['overview'](this,{}));
        }
    }

    angular.module("itweet.navigation", ['ngMaterial', 'gettext', 'ui.router', 'ct.ui.router.extras.previous']).service("ItweetNavigation", NavigationService);

}