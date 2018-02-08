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
  function weightOfAsset(uint256 assetId) public view returns (uint256);

  function weightOfHolder(address holder) external view returns (uint256[]);

  /**
   * Transfer Operations
   */
  function changeWeight(uint256 assetId, uint64 weight) public;

  /**
   * Events
   */
  event ChangeWeight(
    address indexed from,
    address indexed to,
    uint256 indexed assetId,
    uint64 weight
  );
}
