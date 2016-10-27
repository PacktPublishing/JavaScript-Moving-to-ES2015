var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Link = ReactRouter.Link;
var BrowserHistory = ReactRouter.browserHistory;

var Routes = (
  <Router history={BrowserHistory}>
    <Route path="/" component={FeedList}></Route>
    <Route path="/feed/:id" component={Feed}></Route>
    <Route path="submit" component={SubmitFeed}></Route>
    <Route path="*" component={NotFound}/>
  </Router>
)

ReactDOM.render(Routes, document.getElementById("appContainer"));

var AppDispatcher = new Flux.Dispatcher();

var FeedStore = {
  addFeed: function(url){
    var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(url);

    if(valid)
    {
      var urls = localStorage.getItem("feed-urls");
      urls = JSON.parse(urls);

      if(urls == null)
      {
        urls = [url];
      }
      else
      {
        urls[urls.length] = url;
      }

      localStorage.setItem("feed-urls", JSON.stringify(urls));

      this.trigger("valid-url");
    }
    else
    {
      this.trigger("invalid-url");
    }
  },
  getFeeds: function(){
    var urls = localStorage.getItem("feed-urls");
    urls = JSON.parse(urls);

    if(urls == null)
    {
      return [];
    }
    else
    {
      return urls;
    }
  }
}

MicroEvent.mixin(FeedStore);

var Header = React.createClass({
  render: function(){
    return(
      <nav className="navbar navbar-light bg-faded">
        <ul className="nav navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="submit">Add</Link>
          </li>
        </ul>
      </nav>
    )
  }
})

var FeedList = React.createClass({
  getInitialState: function(){
    return {
      urls: FeedStore.getFeeds()
    };
  },
  render: function(){
    var count = 0;
    return(
      <div>
        <Header />
        <div className="container">
          <br />
          <ul>
              {this.state.urls.map(function(url) {
                  count++;
                  return <li> <Link to={"/feed/" + count}>{url}</Link></li>;
              })}
          </ul>
        </div>
      </div>
    )
  }
})

var SubmitFeed = React.createClass({
  add: function(){
    AppDispatcher.dispatch({
      actionType: "add-feed-url",
      feedURL: this.refs.feedURL.value
    });
  },
  componentDidMount: function(){
    FeedStore.bind("invalid-url", this.invalid_url);
    FeedStore.bind("valid-url", this.valid_url);
  },
  valid_url: function(){
    alert("Added successfully");
  },
  invalid_url: function(){
    alert("Please enter a valid URL");
  },
  componentWillUnmount: function(){
    FeedStore.unbind("invalid-url", this.invalid_url);
    FeedStore.unbind("valid-url", this.valid_url);
  },
  render: function(){
    return(
      <div>
        <Header />
        <div className="container">
          <br />
          <form>
            <fieldset className="form-group">
              <label for="formGroupURLInput">Enter URL</label>
              <input type="url" className="form-control" id="formGroupURLInput" ref="feedURL" placeholder="Enter RSS Feed URL" />
            </fieldset>
            <input type="button" value="Submit" className="btn" onClick={this.add} />
          </form>
        </div>
      </div>
    )
  }
})

AppDispatcher.register(function(action){
  if(action.actionType == "add-feed-url")
  {
    FeedStore.addFeed(action.feedURL);
  }
})

var SingleFeedStore = {
  get: function(id){
    var urls = localStorage.getItem("feed-urls");
    urls = JSON.parse(urls);

    var request_url = urls[id - 1];

    var request;
    if(window.XMLHttpRequest)
    {
      request = new XMLHttpRequest();
    } 
    else if(window.ActiveXObject) 
    {
      try 
      {
        request = new ActiveXObject("Msxml2.XMLHTTP");
      } 
      catch (e) 
      {
        try 
        {
          request = new ActiveXObject("Microsoft.XMLHTTP");
        } 
        catch (e) {}
      }
    }

    request.open("GET", "/feed?url=" + encodeURIComponent(request_url));

    var self = this;

    request.addEventListener("load", function(){
      self.trigger("feed-fetched", request.responseText);
    }, false);

    request.send(null);
  }
}

MicroEvent.mixin(SingleFeedStore);

var Feed = React.createClass({
  getInitialState: function(){
    return {
      data: []
    };
  },
  componentDidMount: function(){
    SingleFeedStore.get(this.props.params.id);
    SingleFeedStore.bind("feed-fetched", this.update);
  },
  update: function(data){
    var data = JSON.parse(data);
    this.setState({data: data.rss.channel.item});
  },
  componentWillUnmount: function(){
    SingleFeedStore.unbind("feed-fetched", this.update);
  },
  render: function(){
    return(
      <div>
        <Header />
        <div className="container">
          <br />
          <ul>
              {this.state.data.map(function(post) {
                  return <li><a href={post.link}>{post.title}</a></li>;
              })}
          </ul>
        </div>
      </div> 
    )
  }
})

var NotFound = React.createClass({
  render: function(){
    return(
      <h1>Page Not Found</h1>
    )
  }
})