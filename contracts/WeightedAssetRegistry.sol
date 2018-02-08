pragma solidity ^0.4.18;

import './DAR/StandardAssetRegistry.sol';

import './WeightedAssetRegistryStorage.sol';

contract WeightedAssetRegistry is StandardAssetRegistry, WeightedAssetRegistryStorage {

  function totalWeight() public view returns (uint256) {
    return _weight;
  }

  function isWeighted() public view returns (bool) {
    return true;
  }
}
