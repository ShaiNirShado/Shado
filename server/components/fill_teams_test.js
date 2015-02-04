/**
* Created by Sammy on 1/13/15
**/

var db = require('../api/models');
var _ = require('lodash');
var BPromise = require("sequelize/node_modules/bluebird");

var Fill = (function() {
  var stockTeams = [
    {name: "Albany Alphas", id: 1, SportId: 1, LeagueId: 1},
    {name: "Alaska Arctics", id: 2, SportId: 1, LeagueId: 1},
    {name: "Baltimore Spirits", id: 3, SportId: 1, LeagueId: 1},
    {name: "Free Agency Team", id: 4, SportId: 1, LeagueId: 1, special: 'freeagency'},
    {name: "Commissioner Team", id: 5, SportId: 1, LeagueId: 1, special: 'commish'}
  ]

  var stockPlayers = [
    {name: "Rodger Umaechi",
      realWorldTeam: "ALB",
      id: 1,
      SportId: 1},
    {name: "Apiatan Redmane",
      realWorldTeam: "ALB",
      id: 2,
      SportId: 1},
    {name: "Carl Esteban",
      realWorldTeam: "ALK",
      id: 3,
      SportId: 1},
    {name: "Ambrose Slade",
      realWorldTeam: "ALK",
      id: 4,
      SportId: 1},
    {name: "Silvia Windcreek",
    realWorldTeam: "BAL",
      id: 5,
      SportId: 1},
    {name: "Dirk von Stryker",
      realWorldTeam: "BAL",
      id: 6,
      SportId: 1},
    {name: "Scoonie Barrett",
      realWorldTeam: "HWI",
      id: 7,
      SportId: 1},
    {name: "Alphonse Norwich IV",
      realWorldTeam: "HWI",
      id: 8,
      SportId: 1},
    {name: "Neil LaRocca",
      realWorldTeam: "PLY",
      id: 9,
      SportId: 1},
    {name: "Nina Lima",
      realWorldTeam: "PLY",
      id: 10,
      SportId: 1}
  ]

  var stockSport = [
    {name: "NBA",
      id: 1}
  ]

  var stockLeague = [
    {name: "Stocky",
    id: 1}
  ]

  var selectedTeams = []
  var selectedPlayers = []
  var realWorldTeams = []
  var TEST_SPORT_ID = 1
  var TEST_LEAGUE_ID = 1

  var _fillTeams = function(user) {
    var selectedSport = ""
    if (user.role !== 'admin') {
      console.log("Error, user is not an admin, user role is: " + user.role);
      return Promise.reject("User is not an admin");
    }
    db.Sport.bulkCreate(stockSport).then(function() {
      return db.League.bulkCreate(stockLeague);
    }).then(function() {
      return db.Team.bulkCreate(stockTeams);
    }).then(function() {
      return db.Player.bulkCreate(stockPlayers);
    }).then(function() {
      return db.Sport.find(TEST_SPORT_ID);
    }).then(function(sport) {
      selectedSport = sport;
      return db.Team.findAll({
        where: [{ special: null, SportId: selectedSport.id, LeagueId: TEST_LEAGUE_ID }]
      });
    }).then(function(teams) {
      return setSelectedTeams(teams);
    }).then(function() {
      return db.Player.findAll({
        where: { SportId: selectedSport.id }
      });
    }).then(function(players) {
      return setSelectedPlayers(players);
    }).then(function() {
      return assignPlayers(selectedTeams, selectedPlayers);
    });
  }

  var setSelectedTeams = function(teams) {
    selectedTeams = teams;
  }

  var setSelectedPlayers = function(players) {
    selectedPlayers = players;
  }

  var assignPlayers = function(teams, players) {
    getRealWorldTeams(players);
    return BPromise.map(realWorldTeams, function(realTeam) {
      var realTeamIndex = realWorldTeams.indexOf(realTeam);
      return db.Player.findAll({
       where: { realWorldTeam: realTeam }
      }).then(function(realTeamPlayers) {
        return BPromise.map(realTeamPlayers, function(realTeamPlayer) {
          if (realTeamIndex >= teams.length) {
            db.Team.find({
              where: {special: "freeagency"}
            }).then(function(freeAgentTeam) {
              freeAgentTeam.addPlayer(realTeamPlayer);
              return freeAgentTeam.save();
            });
          } else {
              teams[realTeamIndex].addPlayer(realTeamPlayer);
              return teams[realTeamIndex].save();
          }
        });
      });
    });
  }

  var getRealWorldTeams = function(players) {
    realWorldTeams = _.chain(players)
      .pluck('realWorldTeam')
      .uniq()
      .value();
  }

  return {
    fillTeams : _fillTeams
  }
}());

module.exports = Fill;
