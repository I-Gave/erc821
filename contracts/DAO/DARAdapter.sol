pragma solidity ^0.4.18;

/*
 * This contract is an interface between the DAO and the DAO.
 **/

contract WeightedAssetRegistry {
  mapping(address => uint256) internal _weightOfHolder;
  function weightOfHolder(address holder) public view returns (uint256);
}

contract DARAdapter {
  WeightedAssetRegistry _voteWeightAddress;

  function DARAdapter(address voteWeightAddress) {
    _voteWeightAddress = WeightedAssetRegistry(voteWeightAddress);
  }

  function voteWeightAddress() public view returns (address) {
    return _voteWeightAddress;
  }

  function balanceOf(address holder) public view returns  (uint256) {
    return _voteWeightAddress.weightOfHolder(holder);
  }
}