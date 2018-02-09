pragma solidity ^0.4.18;

import '../contracts/WeightedAssetRegistry.sol';

contract WeightedAssetRegistryTest is WeightedAssetRegistry {

  function WeightedAssetRegistryTest () public {
    _name = "Test";
    _symbol = "TEST";
    _description = "lorem ipsum";
  }

  function isContractProxy(address addr) public view returns (bool) {
    return _isContract(addr);
  }

  function generate(uint256 assetId, address beneficiary, string data, uint64 weight) public {
    _generate(assetId, beneficiary, data, weight);
  }

  function update(uint256 assetId, string data, uint64 weight) public {
    _update(assetId, data, weight);
  }

  function destroy(uint256 assetId) public {
    _destroy(assetId);
  }
  function transferTo(
    address to, uint256 assetId, bytes userData, bytes operatorData
  ) public {
    return transfer(to, assetId, userData, operatorData);
  }
}
