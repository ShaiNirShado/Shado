/**
* Created by Sammy on 11/18/14.
**/

var Converter = require('csvtojson').core.Converter;
var db = require('../api/models');
var Sport = db.Sport;
var Player = db.Player;
var fs = require('fs')
var BPromise = require("sequelize/node_modules/bluebird");

var Populate = (function(){
  var _parseCsv = function(csv, sport) {
    var fileStream = fs.createReadStream(csv);
    var csvConverter = new Converter({constructResult:true});
    return BPromise.try(function() {
      csvConverter.on("end_parsed",function(jsonObj){
        return populateDatabase(jsonObj, sport);
      });
    }).then(function() {
      return fileStream.pipe(csvConverter);
    });
  };

  var populateDatabase = function(players, sport) {
    return BPromise.map(players, function(player) {
      return Player.findOrCreate({
        where: {
          name: player.playerName,
          defaultSalary: player.defaultSalary,
          realWorldTeam: player.realWorldTeam,
          contractExpires: player.contractExpires
        }
      }).spread(function(newPlayer, created) {
        return newPlayer.setSport(sport)
      }).then(function(newPlayer) {
        return newPlayer.save();
      }).catch(function(err) {
        return console.log("error", "Failed to process player: " + player.playerName);
      });
    });
  }
  return {
    parseCsv : _parseCsv,
  }
}());
module.exports = Populate;
