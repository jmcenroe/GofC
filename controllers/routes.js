var express = require("express");
var router = express.Router();
var db = require('../models');
var path = require('path');

// Sets up initial home/index route
router.route('/').get(function (req, res) {
	res.sendFile(path.join(__dirname, '../splash.html'));
});

router.route('/:username').get(function (req, res) {
	res.sendFile(path.join(__dirname, '../index.html'));
});

router.get("/game/priceupdate", function (req, res) {


	db.Cities.findAll().then((data) => {
		var returnData = getcityprices(data);

		res.json(returnData);

	})

});

router.put('/player/update', function (req, res) {

	db.Player.update(
		req.body,
		 {
		where: {
			username: req.body.username
		}
	}).then((data) => {

		res.json(data);
	});

});


//Find existing player data
router.get('/player/:username', function (req, res) {

	db.Player.findOne({
		where: {
			username: req.params.username
		}
	}).then((data) => {

		res.json(data);
	});

});

//Add new player to database
router.post('/player/:username', function (req, res) {

	db.Player.create({
		username: req.params.username
	}).then((data) => {

		res.json(data);
	});
});



module.exports = router;

function getcityprices(data) {

	//Create empty array to place city data into
	var returndata = [];

	for (var i = 0; i < data.length; i++) {

		//Get array of object keys to allow for iterating between keys in the object
		var keys = Object.keys(data[i].dataValues);

		var cityObject = {};
		var prices = {};

		for (var j = 0; j < keys.length; j++) {

			//Set up variable to allow for string manipulation of key
			var keyString = keys[j];



			if (keyString === 'city_name') {
				cityObject.city = data[i].dataValues[keys[j]];

			} else if (keyString === 'id') {
				cityObject.id = data[i].dataValues[keys[j]];
			} else {
				if (keyString.indexOf('_') > 0 && keyString.indexOf('low' > 0)) {

					//Find good and calculate price based on low and high range
					var good = keyString.substr(0, keyString.indexOf('_'));



					var lowrange = data[i].dataValues[keys[j]];
					var highrange = data[i].dataValues[keys[j + 1]];
					var currentPrice = parseInt((Math.random() * (highrange - lowrange)) + lowrange);

					prices[good] = currentPrice;

					j++;

				}
			}

		};

		//Add prices to the cityObject and then push the object into return data array
		cityObject.prices = prices;
		returndata.push(cityObject);

	}

	return returndata;
}