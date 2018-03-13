import BackableTokenContract from '../build/contracts/BackableToken.json'
import getWeb3 from './utils/getWeb3'


const contract = require('truffle-contract')
const token = contract(BackableTokenContract)

const simpleCache = {};  // This can be used for simple objects, like the current user's account address

async function getContract(contract) {
    let results = await getWeb3
    contract.setProvider(results.web3.currentProvider)
    // option 1: will find the address from the ./build/contracts/.json file
    // return contract.deployed() 

    // option 2: will always look for the same contract, currently the one that Travis
    //           deployed to the Ropsten test network
    return contract.at('0xddb3e20bbd33dddb33b8c961bf297459dd6a8575')
}

// Get the address of the user in MetaMask.  Uses the simple cache
async function getCurrentAccount(){
    if ('currentAccount' in simpleCache){
        const account = simpleCache['currentAccount'];
        console.debug('Get "currentAcount" from simpleCache: ' + account);
        return account;
    }
        
    let results = await getWeb3;
    const account = results.web3.eth.accounts[0];
    simpleCache['currentAccount'] = account;
    return account;
}

/**
 * @summary Register a new user.
 */
async function registerUser(username){
    const tokenInstance = await getContract(token);
    const account = await getCurrentAccount();
    tokenInstance.register.sendTransaction(username, {from: account});
}

/**
 * @summary  Retrieve all registered users.
 */
async function getAllUsers(){
    const tokenInstance = await getContract(token);

    const memberCount = await tokenInstance.memberCount()
    const indexesToRetrieve = [...Array(memberCount.toNumber()).keys()]
    const functions = indexesToRetrieve.map(index => tokenInstance.findMemberByIndex(index))
    let results = await Promise.all(functions)

    let users = []
    for (const [address, username, active, elected, balance, backing] of results) {
        users.push({address, username, elected, balance, backing})
    }
    return users
}

/**
 * @summary Retreive the user that is being used in MetaMask
 * 
 * The return is dictionary like {address, username, elected, balance, backing}
 */
async function getCurrentUser(){
    const users = await getAllUsers();  // Overall this can be done faster
    const account = await getCurrentAccount();
    const currentUser =  users.find(user => user.address === account);
    return currentUser;
}

/**
 * @summary Back a specific post with amount
 */
async function backPost(postIndex, value) {
    const tokenInstance = await getContract(token);
    const account = await getCurrentAccount();

    let result = await tokenInstance.backPost.sendTransaction(postIndex, value, { from: account })
}

/**
 * @summary Post a link to the contract
 */
async function postLink(text) {
    const tokenInstance = await getContract(token);
    const account = await getCurrentAccount();

    let result = await tokenInstance.postLink.sendTransaction(text, { from: account})
}

/**
 * @summary  Retrieve all linksthat have been submitted to the site
 */
async function getAllLinks(){
    const tokenInstance = await getContract(token);

    const count = await tokenInstance.getLinkTotalCount()
    const indexesToRetrieve = [...Array(count.toNumber()).keys()]
    const functions = indexesToRetrieve.map(index => tokenInstance.getLinkByIndex(index))
    let results = await Promise.all(functions)

    let links = []
    for (const [index, owner, link, backing] of results) {
        links.push({index, owner, link, backing})
    }
    return links
}

export { getCurrentUser, getAllUsers, registerUser, backPost, postLink, getAllLinks }