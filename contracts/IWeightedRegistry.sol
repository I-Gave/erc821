pragma solidity ^0.4.18;

interface IWeightedRegistry {

  /**
   * Global Registry getter functions
   */
  function totalWeight() public view returns (uint256);

  function isWeighted() public view returns (bool);

  /**
   * Holder-centric getter functions
   */
  function weightOfAsset(uint256 assetId) public view returns (uint64);

  function weightOfHolder(address holder) public view returns (uint256);

  /**
   * Transfer Operations
   */
  function changeWeight(uint256 assetId, uint64 weight) public;

  /**
   * Events
   */
  event TransferWeight(
    address indexed from,
    address indexed to,
    uint256 indexed assetId,
    uint64 weight
  );
  event ChangeWeight(
    uint256 indexed assetId,
    uint64 weight
  );

}
