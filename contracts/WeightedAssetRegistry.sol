pragma solidity ^0.4.18;

import './DAR/StandardAssetRegistry.sol';
import './IWeightedRegistry.sol';
import './WeightedAssetRegistryStorage.sol';

contract WeightedAssetRegistry is StandardAssetRegistry, WeightedAssetRegistryStorage, IWeightedRegistry {

  function totalWeight() public view returns (uint256) {
    return _weight;
  }

  function isWeighted() public view returns (bool) {
    return true;
  }

  function weightOfAsset(uint256 assetId) public view returns (uint64) {
    return _weightOfAsset[assetId];
  }

  function weightOfHolder(address holder) public view returns (uint256) {
    return _weightOfHolder[holder];
  }

  function _addWeightTo(address to, uint64 weight) internal {
    _weightOfHolder[to] += weight;
  }

  function _removeWeightFrom(address from, uint64 weight) internal {
    _weightOfHolder[from] -= weight;
  }

  function changeWeight(uint256 assetId, uint64 weight) public {
    require(exists(assetId));

    address owner = ownerOf(assetId);
    uint64 oldWeight = weightOfAsset(assetId);

    if (owner != address(0)) {
      _removeWeightFrom(owner, oldWeight);
      uint256 ownerWeight = weightOfHolder(owner);
      // Protect against overflow
      uint256 newOwnerWeight = ownerWeight + weight;
      assert(newOwnerWeight >= ownerWeight);
      _addWeightTo(owner, weight);
    }

    _weight -= oldWeight;
    _weight += weight;

    _weightOfAsset[assetId] = weight;

    ChangeWeight(assetId, weight);
  }

  function _update(uint256 assetId, string data, uint64 weight) internal {
    super._update(assetId, data);
    changeWeight(assetId, weight);
  }

  function _generate(uint256 assetId, address beneficiary, string data, uint64 weight) internal {
    super._generate(assetId, beneficiary, data);

    changeWeight(assetId, weight);
  }

  function _destroy(uint256 assetId) internal {
    address holder = _holderOf[assetId];
    require(holder != 0);

    uint64 weight = weightOfAsset(assetId);

    _removeWeightFrom(holder, weight);
    _weightOfAsset[assetId] = 0;
    _weight -= weight;

    super._destroy(assetId);
    ChangeWeight(assetId, 0);
  }

  function _doSend(
    address to, uint256 assetId, bytes userData, address operator, bytes operatorData
  )
    internal
  {
    address holder = _holderOf[assetId];
    uint64 weight = weightOfAsset(assetId);

    _removeWeightFrom(holder, weight);
    _addWeightTo(to, weight);

    super._doSend(to, assetId, userData, operator, operatorData);

    TransferWeight(holder, to, assetId, weight);
  }

}
