const PostChain = artifacts.require("./PostChain.sol");
const MemberRegistry = artifacts.require("./MemberRegistry.sol");
const Votes = artifacts.require("./Votes.sol");
const PublishedHistory = artifacts.require("./PublishedHistory.sol");
const DoxaToken = artifacts.require("./DoxaToken.sol");
const DoxaHub = artifacts.require("./DoxaHub.sol");

const helpers = require('../src/helpers')

module.exports = function(deployer) {
  const historyAddress = helpers.readFactory('freq1', 'HistoryFactory');
  const tokenAddress = helpers.readFactory('freq1', 'TokenFactory');
  const votesAddress = helpers.readFactory('freq1', 'VotesFactory');
  const postChainAddress = helpers.readFactory('freq1', 'PostChainFactory');

  let votes, publishedHistory, token, postChain;

  deployer.then(function(){
    return Votes.at(votesAddress)
  })
  .then(function(instance) {

    votes = instance;
    return PublishedHistory.at(historyAddress)

  }).then(function(instance) {

    publishedHistory = instance;
    return DoxaToken.at(tokenAddress);

  }).then(function(instance) {

    token = instance;
    return PostChain.at(postChainAddress);

  }).then(function(instance) {

    postChain = instance;
    votes.assignHub(DoxaHub.address);
    publishedHistory.assignHub(DoxaHub.address);
    token.assignHub(DoxaHub.address);
    postChain.assignHub(DoxaHub.address);
  });
};