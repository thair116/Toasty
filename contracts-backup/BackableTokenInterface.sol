pragma solidity ^0.4.18;

// import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';
// import 'zeppelin-solidity/contracts/math/SafeMath.sol';
// import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

// import './ContentPool.sol'; //TODO - import interface instead of code itself
// import './MemberRegistry.sol'; //TODO - import interface instead of code itself
// import './Published.sol';
// import './VotingStuff.sol';

// TODO
// only registered members should be able to be elected
// delete BackableTokenMock
// split this contract into smaller contracts
// -- pull out voting
// -- pull out published history 

// switch tests and app to use ethjS

contract BackableTokenInterface {

	// ContentPool contentPool;
	// MemberRegistry memberRegistry;
	// BackableTokenSmall token;
	// Published published;

	// uint SUBMISSION_MINT = 1;
	// uint public nextPublishTime;

	// ========================= events ==================================================

	// event Mint(address indexed to, uint256 _amount);
	// event LinkPosted(address indexed owner, uint256 backing, uint256 index, bytes32 link);
	// event PostBacked(address indexed backer, uint32 indexed version, uint postIndex, uint value);
	// event MemberCreated();
	// event ElectionChange();
	// event BackingChange();
	// event Published(uint version, uint index);


	function BackableToken(address _contentPoolAddress, address _memberRegistryAddress, address _publishedAddress) 
	public;

	// ======================= data about POST BACKINGS ================================
	// sha3(version,backer) -> postIndex
	// mapping (bytes32 => uint256) internal outgoingPostBackings;
	
	// sha3(version,postIndex) -> total amount backing this post
	// mapping (bytes32 => uint256) internal incomingPostBackings;
	// uint[] internal incomingPostBackings; // this would have to be kept the same size as itemList[version]

	// {version1: [content1_index, content2_index], version2: [content3_index, content4_index]}
	// todo: this second int could be quite small (limited by number of posts in each version)
	// mapping (uint32 => uint[]) private publishedContent;

	function getVersionLength(uint32 version) 
	public view
	returns (uint);

	function getPublishedItem(uint32 version, uint index) 
	public view
	returns (address poster, bytes32 content);

	// return total held minus total outgoing backed towards posts
	function availableToTransfer(address _owner) 
	view public 
	returns (uint256);
	

	function totalPostBacking(uint256 _index)
	view public 
	returns (uint256);

	function backPost(uint256 _postIndex, uint256 _value) 
	public 
	returns (bool);

	function backPosts(uint256[] _postIndexes, uint256[] voteValues) 
	public 
	returns (bool);

	function postLink(bytes32 link) 
	public 
	returns(bool);

	function getLinkByIndex( uint256 index ) 
	public view 
	returns(uint256, address owner, bytes32 link, uint256 backing);

	function getLinkCount() 
	public view
	returns (uint);

	function clear() 
	public 
	returns (bool);

	function currentVersion() 
	public view
	returns (uint32);

	function publish() 
	public 
	returns (bool);

	// ======================= Currency functions =======================

	// return total held minus total outgoing backed
	// function availableToSend(address _adress) 
	// view internal 
	// returns (uint256 available) {
	// 	// TODO this must take into account quantity backing posts
	// 	return balances[_adress].sub(outgoing[_adress]);
	// }

	// function transfer(address _to, uint256 _value) 
	// public 
	// returns (bool) 
	// {
	// 	require(_to != address(0));
	// 	// we override transfer to replace balances[] with availableToSend[] in the next line
 //    	require(_value <= availableToSend(msg.sender));

 //    	balances[msg.sender] = balances[msg.sender].sub(_value);
 //    	balances[_to] = balances[_to].add(_value);

 //    	Transfer(msg.sender, _to, _value);

 //    	// TODO possibly de-activate member if balance has dropped below MEMBERSHIP_THRESHOLD

 //    	return true;
	// }
	
	// TODO this is being accidentally called when transactions are missing input data
	// function () 
	// private payable 
	// {
	// 	// finney = milliether, szabo = microether
	// 	// TODO decide on price curve
	// 	// uint256 price = 1 finney + SafeMath.mul(5 szabo, totalSupply);
	// 	//uint256 price = 10000000000000000000;
	// 	// uint256 dispersal = SafeMath.div(msg.value, price);
	// 	uint256 dispersal = 3;
	// 	mint(msg.sender, dispersal);
	// }
	
	// function mint(address _to, uint256 _quantity) 
	// private 
	// returns (bool) 
	// {
	// 	totalSupply_ = totalSupply_.add(_quantity);
	// 	balances[_to] = balances[_to].add(_quantity);
	// 	Mint(_to, _quantity);
	// 	Transfer(0x0, _to, _quantity);
	// 	return true;
	// }


	// ======================= Election functions =======================

	// ======================= data about BACKINGS =====================================
	// backer -> (backee -> amount)
	// mapping (address => mapping (address => uint256)) internal backed;

	// // address -> total amount already backing someone else
	// mapping (address => uint256) internal outgoing; // outgoing backs
	// // address -> total amount backing this address
	// mapping (address => uint256) internal incoming; // incoming backs

	// // return total held plus total incoming backed
	// function totalBacking(address _to)
	// view public
	// returns (uint256 total) {
	// 	return balances[_to].add(incoming[_to]);
	// }

	// function back(address _to, uint256 _value) 
	// public 
	// returns (bool) {
	// 	require(_to != address(0));
	// 	require(_to != msg.sender); // can't back yourself, fool
	// 	require(_value <= balances[msg.sender]); // TODO unnecessary?
	// 	require(_value <= availableToSend(msg.sender));

	// 	// update the root mapping
	// 	backed[msg.sender][_to] = backed[msg.sender][_to].add(_value); // might want to separate initial backing versus increase?

	// 	// update the caches
	// 	outgoing[msg.sender] = outgoing[msg.sender].add(_value);
	// 	incoming[_to] = incoming[_to].add(_value);

	// 	return true;
	// }

	// // this only removes the entire backing. we may want to have partial unbacks
	// function unback(address _to, uint256 _value) 
	// public 
	// returns (bool) 
	// {
	// 	require(_to != address(0));
	// 	require(_to != msg.sender); // can't unback yourself, fool
	// 	require(backed[msg.sender][_to] != 0);
	// 	require(_value <= backed[msg.sender][_to]);

	// 	// update the root mapping
	// 	backed[msg.sender][_to] = backed[msg.sender][_to].sub(_value);

	// 	// update the caches
	// 	outgoing[msg.sender] = outgoing[msg.sender].sub(_value);
	// 	incoming[_to] = incoming[_to].sub(_value);

	// 	return true;
	// }

	// ======================= Membership functions =======================

	function memberCount() 
	public view 
	returns (uint count);

	function getMember(uint _index) 
	public view 
	returns (bytes32 name_, address owner_, uint balance_, uint backing_, uint availableToBackPosts_);

	function getMemberByAddress(address _owner) 
	public view 
	returns (bytes32 name_, address owner_, uint balance_, uint backing_, uint availableToBackPosts_);

	function register(bytes32 _name) 
	public 
	returns (bool);

	// ========================= Helpers =================================

	function nextUTCMidnight(uint timestamp)
	public pure
	returns (uint);
}