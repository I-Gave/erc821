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

  // Todo protect against holder overflow
  function changeWeight(uint256 assetId, uint64 weight) public {
    require(exists(assetId));

    address owner = ownerOf(assetId);
    uint64 oldWeight = weightOfAsset(assetId);

    if (owner != address(0)) {
      _removeWeightFrom(owner, oldWeight);
      _addWeightTo(owner, weight);
    }

    _weight -= oldWeight;
    _weight += weight;

    _weightOfAsset[assetId] = weight;

    ChangeWeight(assetId, weight);
  }

  function _doSend(
    address to, uint256 assetId, bytes userData, address operator, bytes operatorData
  )
    internal
  {
    address holder = _holderOf[assetId];
    uint64 weight = weightOfAsset(assetId);
    _removeAssetFrom(holder, assetId);
    _removeWeightFrom(holder, weight);
    _clearApproval(holder, assetId);
    _addAssetTo(to, assetId);
    _addWeightTo(to, weight);

    if (_isContract(to)) {
      require(!_reentrancy);
      _reentrancy = true;

      address recipient = interfaceAddr(to, 'IAssetHolder');
      require(recipient != 0);

      IAssetHolder(recipient).onAssetReceived(assetId, holder, to, userData, operator, operatorData);

      _reentrancy = false;
    }

    Transfer(holder, to, assetId, operator, userData, operatorData);
    TransferWeight(holder, to, assetId, weight);
  }

}
