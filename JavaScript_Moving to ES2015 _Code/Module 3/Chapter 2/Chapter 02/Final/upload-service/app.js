var seneca = require("seneca")();
var app = require("express")();
var multipart = require("connect-multiparty")();
var path = require("path");
var fs = require("fs");
var request = require("request");

function uniqueNumber() {
    var date = Date.now();

    if (date <= uniqueNumber.previous) {
        date = ++uniqueNumber.previous;
    } else {
        uniqueNumber.previous = date;
    }

    return date;
}

uniqueNumber.previous = 0;

function ID(){
  return uniqueNumber();
};

seneca.client({port: "5020", pin: {role: "url-config"}});
seneca.client({port: "5010", pin: {role: "coupons-store"}});

app.post('/submit', multipart, function(httpRequest, httpResponse, next){

	var tmp_path = httpRequest.files.thumbnail.path;
	var thumbnail_extension = path.extname(tmp_path);
	var thumbnail_directory = path.dirname(tmp_path);
    var thumbnail_id = ID();
	var renamed_path = thumbnail_directory + '/' + ID() + thumbnail_extension;

	//rename file
	fs.rename(tmp_path, renamed_path, function(err) {
    	if(err) return httpResponse.status(500).send("An error occured");

    	//upload file to image storage server
        seneca.act({role: "url-config", cmd: "image-storage-service"}, function(err, storage_server_url){
            var req = request.post(storage_server_url.value + "/store", function (err, resp, body){
                fs.unlink(renamed_path);

                if(err) return httpResponse.status(500).send("An error occured");

                if(body == "Done")
                {
                    //store the coupon
                    seneca.act({role: "coupons-store", cmd: "add", title: httpRequest.body.title, email: httpRequest.body.email, url: httpRequest.body.url, desc: httpRequest.body.desc, price: httpRequest.body.price, discount: httpRequest.body.price, thumbnail_id: thumbnail_id + thumbnail_extension}, function(err, response){
                        if(err)
                        {
                            //delete the stored image
                            request.get(storage_server_url + "/delete/" + thumbnail_id + thumbnail_extension);
                            httpResponse.status(500).send("An error occured");
                            return;
                        }   
                        seneca.act({role: "url-config", cmd: "monolithic-core"}, function(err, response){
                            if(err) return httpResponse.status(500).send("An error occured");

                            //redirect to monolithic core
                            httpResponse.redirect(response.value + "/?status=submitted");  
                        });
                    });
                }
            });

            var form = req.form();
            form.append("thumbnail", fs.createReadStream(renamed_path));
            form.append("name", thumbnail_id + thumbnail_extension);
        });    	
	});
});

app.listen(9090);
