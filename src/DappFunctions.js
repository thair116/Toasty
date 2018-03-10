import BackableTokenContract from '../build/contracts/BackableToken.json'
import getWeb3 from './utils/getWeb3'


const contract = require('truffle-contract')
const token = contract(BackableTokenContract)

const simpleCache = {};  // This can be used for simple objects, like the current user's account address

async function getContract(contract) {
    let results = await getWeb3
    contract.setProvider(results.web3.currentProvider)
    return contract.deployed()
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
async function registerUser(username, etherAmount){
    const tokenInstance = await getContract(token);
    const account = await getCurrentAccount();
    const options = {from: account, value: new window.web3.BigNumber(window.web3.toWei(etherAmount,'ether'))}
    tokenInstance.register.sendTransaction(username, options);
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
 * @summary Back a specific user with the tokenAmount
 */
async function backMember(memberName, tokenAmount) {
    const tokenInstance = await getContract(token);
    const account = await getCurrentAccount();

    let member = await tokenInstance.findMemberByUserName(memberName)
    const address = member[0]  // The address of the user we find

    let result = await tokenInstance.back.sendTransaction(address, tokenAmount, { from: account })
}

export { getCurrentUser, getAllUsers, registerUser, backMember }