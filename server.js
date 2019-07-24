// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var axios = require("axios");


// Initialize Express
var app = express();

// Set up a static folder (public) for our web app
app.use(express.static("public"));

// Database configuration
// Save the URL of our database as well as the name of our collection
var databaseUrl = "stores";
var collections = ["games"];

// Use mongojs to hook the database to the db variable
var db = mongojs(databaseUrl, collections);

// This makes sure that any errors are logged if mongodb runs into an issue
db.on("error", function(error) {
  console.log("Database Error:", error);
});

app.get("/", function(req, res) {
  res.send("Welcome to key scraper");
});

// // At the "/all" path, display every entry in the games collection
// app.get("/all", function(req, res) {
//   // Query: In our database, go to the games collection, then "find" everything
//   db.games.find({}, function(error, found) {
//     // Log any errors if the server encounters one
//     if (error) {
//       console.log(error);
//     }
//     // Otherwise, send the result of this query to the browser
//     else {
//       res.json(found);
//     }
//   });
// });

// Making a request via axios for reddit's "webdev" board. We are sure to use old.reddit due to changes in HTML structure for the new reddit. The page's Response is passed as our promise argument.
axios.get("https://store.steampowered.com/search/?filter=topsellers").then(function(response) {

  var $ = cheerio.load(response.data);

  var results = [];

// STEAM STORE
  $("#search_results").each(function(i, element) {
    var title = $("span.title").text();
    var imageLink = $(".search_capsule").html();
    var normalPrice = $(".col.search_price.responsive_secondrow").children().html();
    // var discountedPrice = $(".discounted").children().html();

    db.games.insert({
        "title": title,
        "imageLink": imageLink,
        "normalPrice": normalPrice
     })

    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      imageLink: imageLink,
      normalPrice: normalPrice
    //   discountedPrice: discountedPrice
    });
  });


  console.log(results);
});

// Set the app to listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
