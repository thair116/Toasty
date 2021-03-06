pragma solidity ^0.4.24;

import './Spoke.sol';


contract PublishedHistory is Spoke {

    struct PublishedPost
    {
        address chainAddress;
        uint48 lowerChainIndex; // index where it is posted
        uint48 publishedTime; // this can be used to pull in the votes
    } 

    PublishedPost[] public publishedHistory;

    function getPost(uint _publishedIndex)
    public view
    returns (address chainAddress, uint lowerChainIndex_, uint publishedTime_)
    {
        return (
            publishedHistory[_publishedIndex].chainAddress, 
            uint(publishedHistory[_publishedIndex].lowerChainIndex), 
            uint(publishedHistory[_publishedIndex].publishedTime)
        );
    }

    function publishPost(address _chainAddress, uint _lowerChainIndex)
    public onlyHub
    returns (uint publishedIndex_)
    {
        PublishedPost memory newPublishedPost = PublishedPost(
        {
            chainAddress: _chainAddress,
            lowerChainIndex: uint48(_lowerChainIndex),
            publishedTime: uint48(now) // this will need to be passed in to sync up with the expected publish time
        });

        publishedHistory.push(newPublishedPost);

        return publishedHistory.length - 1;
    }

    function length()
    public view
    returns (uint)
    {
        return publishedHistory.length;
    }
}