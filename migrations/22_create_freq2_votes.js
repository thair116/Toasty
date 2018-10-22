const VotesFactory = artifacts.require("./VotesFactory.sol");
const helpers = require('../src/helpers')

module.exports = function(deployer) {
  deployer.then(function(){
    return VotesFactory.deployed();
  })
  .then(function(instance) {
    return instance.newContract();
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq2', 'VotesFactory');
  })
}