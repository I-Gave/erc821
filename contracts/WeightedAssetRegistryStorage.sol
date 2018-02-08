pragma solidity ^0.4.18;

import './DAR/AssetRegistryStorage.sol';

contract WeightedAssetRegistryStorage is AssetRegistryStorage {

  /**
   * Stores the total weight of assets managed by this registry
   */
  uint256 internal _weight;

  /**
   * Stores the weight owned by a given asset
   */
  mapping(uint256 => uint64) internal _weightOfAsset;

  /**
   * Stores the total weight owned by a given account
   */
  mapping(address => uint256) internal _weightOfHolder;
}
