pragma solidity ^0.4.18;

contract IDARAdapter {
  function DARAdapter(address voteWeightAddress);
  function voteWeightAddress() public view returns (address);
  function balanceOf(address holder) public view returns  (uint256);
}