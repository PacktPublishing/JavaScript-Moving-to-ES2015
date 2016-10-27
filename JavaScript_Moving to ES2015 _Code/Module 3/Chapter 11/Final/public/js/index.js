"use strict";

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Link = ReactRouter.Link;
var BrowserHistory = ReactRouter.browserHistory;

var AppDispatcher = new Flux.Dispatcher();

var Header = React.createClass({
  displayName: "Header",

  render: function render() {
    return React.createElement(
      "nav",
      { className: "navbar navbar-light bg-faded" },
      React.createElement(
        "ul",
        { className: "nav navbar-nav" },
        React.createElement(
          "li",
          { className: "nav-item" },
          React.createElement(
            Link,
            { className: "nav-link", to: "/" },
            "Home"
          )
        ),
        React.createElement(
          "li",
          { className: "nav-item" },
          React.createElement(
            Link,
            { className: "nav-link", to: "submit" },
            "Add"
          )
        )
      )
    );
  }
});

var FeedStore = {
  addFeed: function addFeed(url) {
    var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(url);

    if (valid) {
      var urls = localStorage.getItem("feed-urls");
      urls = JSON.parse(urls);

      if (urls == null) {
        urls = [url];
      } else {
        urls[urls.length] = url;
      }

      localStorage.setItem("feed-urls", JSON.stringify(urls));

      this.trigger("valid-url");
    } else {
      this.trigger("invalid-url");
    }
  },
  getFeeds: function getFeeds() {
    var urls = localStorage.getItem("feed-urls");
    urls = JSON.parse(urls);

    if (urls == null) {
      return [];
    } else {
      return urls;
    }
  }
};

MicroEvent.mixin(FeedStore);

var FeedList = React.createClass({
  displayName: "FeedList",

  getInitialState: function getInitialState() {
    return {
      urls: FeedStore.getFeeds()
    };
  },
  render: function render() {
    var count = 0;
    return React.createElement(
      "div",
      null,
      React.createElement(Header, null),
      React.createElement(
        "div",
        { className: "container" },
        React.createElement("br", null),
        React.createElement(
          "ul",
          null,
          this.state.urls.map(function (url) {
            count++;
            return React.createElement(
              "li",
              null,
              " ",
              React.createElement(
                Link,
                { to: "/feed/" + count },
                url
              )
            );
          })
        )
      )
    );
  }
});

AppDispatcher.register(function (action) {
  if (action.actionType == "add-feed-url") {
    FeedStore.addFeed(action.feedURL);
  }
});

var SubmitFeed = React.createClass({
  displayName: "SubmitFeed",

  add: function add() {
    AppDispatcher.dispatch({
      actionType: "add-feed-url",
      feedURL: this.refs.feedURL.value
    });
  },
  componentDidMount: function componentDidMount() {
    FeedStore.bind("invalid-url", this.invalid_url);
    FeedStore.bind("valid-url", this.valid_url);
  },
  valid_url: function valid_url() {
    alert("Added successfully");
  },
  invalid_url: function invalid_url() {
    alert("Please enter a valid URL");
  },
  componentWillUnmount: function componentWillUnmount() {
    FeedStore.unbind("invalid-url", this.invalid_url);
    FeedStore.unbind("valid-url", this.valid_url);
  },
  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(Header, null),
      React.createElement(
        "div",
        { className: "container" },
        React.createElement("br", null),
        React.createElement(
          "form",
          null,
          React.createElement(
            "fieldset",
            { className: "form-group" },
            React.createElement(
              "label",
              { "for": "formGroupURLInput" },
              "Enter URL"
            ),
            React.createElement("input", { type: "url", className: "form-control", id: "formGroupURLInput", ref: "feedURL", placeholder: "Enter RSS Feed URL" })
          ),
          React.createElement("input", { type: "button", value: "Submit", className: "btn", onClick: this.add })
        )
      )
    );
  }
});

var NotFound = React.createClass({
  displayName: "NotFound",

  render: function render() {
    return React.createElement(
      "h1",
      null,
      "Page Not Found"
    );
  }
});

var SingleFeedStore = {
  get: function get(id) {
    var urls = localStorage.getItem("feed-urls");
    urls = JSON.parse(urls);

    var request_url = urls[id - 1];

    var request;
    if (window.XMLHttpRequest) {
      request = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      try {
        request = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        try {
          request = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}
      }
    }

    request.open("GET", "/feed?url=" + encodeURIComponent(request_url));

    var self = this;

    request.addEventListener("load", function () {
      self.trigger("feed-fetched", request.responseText);
    }, false);

    request.send(null);
  }
};

MicroEvent.mixin(SingleFeedStore);

var Feed = React.createClass({
  displayName: "Feed",

  getInitialState: function getInitialState() {
    return {
      data: []
    };
  },
  componentDidMount: function componentDidMount() {
    SingleFeedStore.get(this.props.params.id);
    SingleFeedStore.bind("feed-fetched", this.update);
  },
  update: function update(data) {
    var data = JSON.parse(data);
    this.setState({ data: data.rss.channel.item });
  },
  componentWillUnmount: function componentWillUnmount() {
    SingleFeedStore.unbind("feed-fetched", this.update);
  },
  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(Header, null),
      React.createElement(
        "div",
        { className: "container" },
        React.createElement("br", null),
        React.createElement(
          "ul",
          null,
          this.state.data.map(function (post) {
            return React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                { href: post.link },
                post.title
              )
            );
          })
        )
      )
    );
  }
});

var Routes = React.createElement(
  Router,
  { history: BrowserHistory },
  React.createElement(Route, { path: "/", component: FeedList }),
  React.createElement(Route, { path: "/feed/:id", component: Feed }),
  React.createElement(Route, { path: "submit", component: SubmitFeed }),
  React.createElement(Route, { path: "*", component: NotFound })
);

ReactDOM.render(Routes, document.getElementById("appContainer"));