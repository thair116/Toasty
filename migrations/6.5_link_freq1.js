const ContentPool = artifacts.require("./ContentPool.sol");
const MemberRegistry = artifacts.require("./MemberRegistry.sol");
const Votes = artifacts.require("./Votes.sol");
const PublishedHistory = artifacts.require("./PublishedHistory.sol");
const DoxaToken = artifacts.require("./DoxaToken.sol");
const TimeStamps = artifacts.require("./TimeStamps.sol");
const DoxaHub = artifacts.require("./DoxaHub.sol");

const helpers = require('../src/utils/helpers')

module.exports = function(deployer) {
  const historyAddress = helpers.readFactory('freq1', 'HistoryFactory');
  const tokenAddress = helpers.readFactory('freq1', 'TokenFactory');
  const votesAddress = helpers.readFactory('freq1', 'VotesFactory');

  let votes, publishedHistory, token, contentPool, timeStamps;

  Votes.at(votesAddress)
  .then(function(instance) {

    votes = instance;
    return PublishedHistory.at(historyAddress)

  }).then(function(instance) {

    publishedHistory = instance;
    return DoxaToken.at(tokenAddress);

  }).then(function(instance) {

    token = instance;
    return ContentPool.deployed();

  }).then(function(instance) {

    contentPool = instance;
    return TimeStamps.deployed();

  }).then(function(instance) {

    timeStamps = instance;
    votes.assignHub(DoxaHub.address);
    publishedHistory.assignHub(DoxaHub.address);
    token.assignHub(DoxaHub.address);
    contentPool.assignHub(DoxaHub.address);
    timeStamps.assignHub(DoxaHub.address);

  });
};
