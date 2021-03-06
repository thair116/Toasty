// var BackableTokenMock = artifacts.require("./BackableTokenMock.sol");
var DoxaHub = artifacts.require("./DoxaHub.sol");
var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");
var Votes = artifacts.require("./Votes.sol");
var PublishedHistory = artifacts.require("./PublishedHistory.sol");
var DoxaTokenMock = artifacts.require("./DoxaTokenMock.sol");
var TimeStamps = artifacts.require("./TimeStamps.sol");

const BigNumber = web3.BigNumber;

// const toAscii = require('../src/utils/helpers')
function toAscii(hex) {
    let zeroPaddedString = web3.toAscii(hex);
    return zeroPaddedString.split("\u0000")[0];
}

function stringToChunkedArray(string) {
    return string.match(/.{1,32}/g);
}

function ByteArrayToString(array) {
    // should use reduce here instead
    let output = '';
    for (let i = 0; i < array.length; i++) {
        output += toAscii(array[i]);
    }
    return output;
}


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('DoxaHub', function(accounts) {

    let contentPool;
    let memberRegistry;
    let hub;
    const REGISTRATION_MINT = 1000;
    const SUBMISSION_MINT = 1;

    beforeEach(async function() {
        contentPool = await ContentPool.new();
        memberRegistry = await MemberRegistry.new();
        votes = await Votes.new();
        publishedHistory = await PublishedHistory.new();
        timeStamps = await TimeStamps.new();
        token = await DoxaTokenMock.new(accounts[0], 1000, accounts[1], 900);
        hub = await DoxaHub.new(
            contentPool.address, 
            memberRegistry.address, 
            token.address,
            publishedHistory.address,
            votes.address,
            timeStamps.address
        )

        await token.assignHub(hub.address, {from : accounts[0]});
        await votes.assignHub(hub.address, {from : accounts[0]});
        await publishedHistory.assignHub(hub.address, {from : accounts[0]});
        await contentPool.assignHub(hub.address, {from : accounts[0]});
        await timeStamps.assignHub(hub.address, {from : accounts[0]});
    })

    // beforeEach(async function() {
    //  await contentPool.clear();
    // })

    // it("should return the correct totalSupply after construction", async function() {
    //  let totalSupply = await hub.totalSupply();

    //  assert.equal(totalSupply, 1900)
    // })

    // it("should not allow backing yourself", async function() {
    //  await hub.back(accounts[0], 700, {from: accounts[0]}).should.be.rejectedWith('revert');
    // })

    it("user can back a post", async function() {
        // await hub.register('enodios', {from: accounts[1]});
        // user 1 posts a link
        await hub.postLink("reddit.com", {from : accounts[1]});

        // link should have 0 backing
        // TODO should automatically have the poster's backing too

        // user 0 backs the link with 1000
        await hub.backPost(0, 1000, {from: accounts[0]});

        // // link should now have 1000 backing
        const backing = await hub.totalPostBacking(0);
        backing.toNumber().should.be.equal(1000);

        // // user 0 should have 0 available backing
        const tokensRemaining0 = await hub.availableToTransfer(accounts[0]);
        tokensRemaining0.toNumber().should.be.equal(0);

        // // user 1 should have 1900 + 1 available backing
        const tokensRemaining1 = await hub.availableToTransfer(accounts[1]);
        tokensRemaining1.toNumber().should.be.equal(901);
    })
    
    it("user cannot over-back a post", async function() {
        // await token.register('enodios', {from: accounts[1]});
                
        // user 1 posts a link
        await hub.postLink("reddit.com", {from : accounts[1]});

        // user 0 backs the link with 1000
        await hub.backPost(0, 1000, {from: accounts[0]});
        
        // user 0 backs the link with 1 more, which is too many
        await hub.backPost(0, 1, {from: accounts[0]}).should.be.rejectedWith('revert');
    })

    // it("should not allow double backing", async function() {
    //  await token.back(accounts[1], 700, {from: accounts[0]});

    //  await token.back(accounts[1], 700, {from: accounts[0]}).should.be.rejectedWith('revert');
    // })

    // it("should not allow sending tokens when they are already backed", async function() {
    //  let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900);
    //  await token.back(accounts[1], 700, {from: accounts[0]});

    //  await token.transfer(accounts[1], 400, {from: accounts[0]}).should.be.rejectedWith('revert');
    // })

    // it("should allow sending tokens after unbacking", async function() {
    //  let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900);
    //  await token.back(accounts[1], 700, {from: accounts[0]});
    //  await token.unback(accounts[1], 700, {from: accounts[0]});

    //  await token.transfer(accounts[1], 400, {from: accounts[0]});

    //  let firstAccountBalance = await token.balanceOf(accounts[0]);

    //  assert.equal(firstAccountBalance, 1000 - 400);
    // })

    // it("should allow a user to register a name and receive token", async function() {
    //  let balanceBefore = await token.balanceOf(accounts[0]);
    //  await token.register('enodios');

    //  let [username, , balanceAfter, , ] = await token.getMemberByAddress(accounts[0]);
    //  const balanceDifference = balanceAfter.toNumber() - balanceBefore.toNumber();

    //  assert.equal(toAscii(username), 'enodios');
    //  assert.equal(balanceDifference, REGISTRATION_MINT);
    // });

    it("should allow user to post Link and receive token", async function() {
        let balanceBefore = await token.balanceOf(accounts[1]);
        await hub.postLink(stringToChunkedArray("reddit.com"), {from : accounts[1]});

        let balanceAfter = await token.balanceOf(accounts[1]);
        const balanceDifference = balanceAfter.toNumber() - balanceBefore.toNumber();

        let [index, owner, link, backing] = await hub.getLinkByIndex(0);

        assert.equal("reddit.com", ByteArrayToString(link));
        assert.equal(accounts[1], owner);

        assert.equal(balanceDifference, SUBMISSION_MINT);

    })

    it("should get link count", async function() {
        // await token.register.sendTransaction('enodios', {from: accounts[1]});

        await hub.postLink("reddit.com", {from : accounts[1]});

        let count = await hub.getLinkCount();
        assert.equal(1, count);

    })

    it("should fail to get link and owner of out of bound index at border", async function() {
        // await token.register.sendTransaction('enodios', {from: accounts[1]});

        await hub.postLink("reddit.com", {from : accounts[0]});
        await hub.postLink("google.com", {from : accounts[1]});
        await hub.getLinkByIndex(2).should.be.rejectedWith('revert');
    })

    // it("publish single post above threshold", async function() {
    //  await token.postLink("reddit2.com", {from : accounts[0]});
    //  await token.postLink("reddit.com", {from : accounts[0]});
    //  await token.backPost(1, 10, {from : accounts[1]});
    //  result = await token.publish();

    //  version = await token.currentVersion();
    //  // we need this because a block could have 0 or 2+ items
    //  blockLength = await token.getVersionLength(version);

    //  // what is this item?
    //  const [poster, content] = await token.getPublishedItem(version,blockLength-1);
    //  // console.log("content: " + toAscii(content))

    //  assert.equal(toAscii(content), 'reddit.com');
    //  // assert.equal( result.toNumber(), 1 );
    // })

    // it("should clear incoming post votes", async function() {
    //  await hub.postLink("reddit.com", {from : accounts[0]});
    //  await hub.backPost(0, 10, {from : accounts[1]});
        
    //  const votesBefore = await hub.totalPostBacking(0);
    //  assert.equal(votesBefore.toNumber(), 10);

    //  await hub.clear();

    //  const votesAfter = await hub.totalPostBacking(0);
    //  assert.equal(votesAfter.toNumber(), 0);
    // })

    // it("should clear outgoing post votes", async function() {
    //  token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900);
    //  await token.postLink("reddit.com", {from : accounts[0]});
    //  await token.backPost(0, 10, {from : accounts[1]});
        
    //  const votesAvailableBefore = await token.availableToBackPosts(accounts[1]);
    //  assert.equal(votesAvailableBefore.toNumber(), 890);
        
    //  await token.clear();

    //  const votesAvailableAfter = await token.availableToBackPosts(accounts[1]);
    //  assert.equal(votesAvailableAfter.toNumber(), 900);
    // })

    // // broken until I find some way to stub out time
    // it("should publish top post", async function() {
    //  await token.postLink("reddit.com", {from : accounts[0]});
    //  await token.postLink("facebook.com", {from : accounts[1]});
    //  await token.backPost(0, 9, {from : accounts[1]});
    //  await token.publish();

    //  // [poster, content] = await token.getPublishedItem(0,0);

    //  // assert.equal(poster, accounts[0]);
    //  // assert.equal(toAscii(content), 'reddit.com');
    // })

    // // broken until I find some way to stub out time
    // it("should publish first post in case of tie", async function() {
    //  await token.postLink("facebook.com", {from : accounts[1]});
    //  await token.postLink("reddit.com", {from : accounts[0]});
    //  await token.publish();

    //  [poster, content] = await token.getPublishedItem(0,0);

    //  assert.equal(poster, accounts[1]);
    //  assert.equal(toAscii(content), 'facebook.com');
    // })

    it("should set nextPublishTime as next UTC midnight", async function() {
        const nextPublishTime = await hub.nextPublishTime();

        const jsTimestamp = Math.round((new Date()).getTime() / 1000);
        const nextUTCMidnight = Math.floor(jsTimestamp / 86400) * 86400 + 86400;

        assert.equal(nextPublishTime.toNumber(), nextUTCMidnight)
    })
})