pragma solidity ^0.4.18;

import './WeightedAssetRegistryTest.sol';

contract Exchange {
  // From asset to amount
  mapping(uint256 => uint256) internal _orders;

  WeightedAssetRegistryTest internal nonFungible;

  function Exchange (address _nonFungible) public {
    nonFungible = WeightedAssetRegistryTest(_nonFungible);
  }

  function sell(uint256 assetId, uint256 amount) public {
    require(nonFungible.holderOf(assetId) == msg.sender);
    _orders[assetId] = amount;
  }

  function buy(uint256 assetId) payable public {
    require(msg.value >= _orders[assetId]);
    require(_orders[assetId] > 0);
    nonFungible.holderOf(assetId).transfer(_orders[assetId]);
    uint remaining = msg.value - _orders[assetId];
    if (remaining > 0) {
     msg.sender.transfer(remaining);
    }
    nonFungible.transfer(msg.sender, assetId, '', '');
  }
}

