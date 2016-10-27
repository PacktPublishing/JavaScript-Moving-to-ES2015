var FormComponent = ng.core.Component({
	selector: "search-form",
	directives: [ng.router.ROUTER_DIRECTIVES],	
	templateUrl: "componentTemplates/search-form.html",
}).Class({
	constructor: function(){},
	ngOnInit: function(){
		this.searchParams = {
			query: ""
		};

		this.keyup = function(e){
			this.searchParams = {
				query: e.srcElement.value
			};
		};	
	}
})

var HomeComponent = ng.core.Component({
	selector: "home",
	directives: [FormComponent],
	templateUrl: "componentTemplates/home.html",
}).Class({
	constructor: function(){},
	routerOnActivate: function(){
		console.log("Component has been activated");
	},
	routerCanReuse: function(){
		console.log("Component can be resued");
		return true;
	},
	routerOnReuse: function(){
		console.log("Component is being reused");
	},
	routerCanDeactivate: function(){
		console.log("Component can be deactivated");
		return true;
	},
	routerOnDeactivate: function(){
		console.log("Component has been deactivated");
	}
})

HomeComponent = ng.router.CanActivate(function(){ 
	console.log("Component can be activated");
	return true; 
})(HomeComponent);

var SearchResultComponent = ng.core.Component({
	selector: "search-result",
	directives: [FormComponent],
	viewProviders: [ng.http.HTTP_PROVIDERS],
	templateUrl: "componentTemplates/searchResult.html"
}).Class({
	constructor: [ng.router.RouteParams, ng.http.Http, function(params, http) {
	    this.params = params;
		this.http = http;
		this.response = [];
	}],
	ngOnInit: function(){
		var q = this.params.get("query");
		this.http.get("getData").subscribe(function(res){
			this.response = JSON.parse(res._body);
		}.bind(this));	
	}
})

var NotFoundComponent = ng.core.Component({
	selector: "name-search",
	templateUrl: "componentTemplates/notFound.html"
}).Class({
	constructor: function(){}
})			

var AppComponent = ng.core.Component({
	selector: "app",
	directives: [ng.router.ROUTER_DIRECTIVES],
	templateUrl: "componentTemplates/app.html"
}).Class({
	constructor: function(){}
})

AppComponent = ng.router.RouteConfig([
   { path: "/", component: HomeComponent, name: "Home" },
   { path: "/search-result", component: SearchResultComponent, name: "SearchResult" },
   { path: "/*path", component: NotFoundComponent, name: "NotFound" }
])(AppComponent);

ng.core.enableProdMode();

ng.platform.browser.bootstrap(AppComponent, [
	ng.router.ROUTER_PROVIDERS,
	ng.core.provide(ng.router.APP_BASE_HREF, {useValue : "/" })
]);