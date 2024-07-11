// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error FundMe__NotOwner();

/**
 * @title A contract for Crowd Funding
 * @author Tomas
 * @notice This contract is to demo a sample funding contract
 * @dev This implements PriceFeed as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address private immutable i_owner;

    // The "s_" is related to Storage memory.
    AggregatorV3Interface private s_priceFeed;
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    modifier onlyOwner {
        //require(msg.sender == i_owner, "You are not the owner");
        //require(msg.sender == i_owner, FundMe__NotOwner());
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _; // execute the other code after.
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds this contract
     */
    function fund() public payable {
        //require(getConversionRate(msg.value) >= MINIMUM_USD, "Didn't send enough ether !");
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "Didn't send enough ether !");
        s_funders.push(msg.sender); // Saving the funder's address.
        s_addressToAmountFunded[msg.sender] += msg.value; // Saving the funder's amount to his address.
    }

    function withdraw() public onlyOwner {
        for (uint256 index = 0; index < s_funders.length; index++) {
            s_addressToAmountFunded[s_funders[index]] = 0;
        }
        s_funders = new address[](0); // Reset the s_funders array.
        
        // using payable address.
    
        // transfer -> throws error if it's used too much gas -> automatically reverts the transaction.
        //payable(msg.sender).transfer(address(this).balance);
        
        // send
        //bool sendSuccess = payable(msg.sender).send(address(this).balance);
        //require(sendSuccess, "Send failed"); // if it fails, we revert the transactions with require.

        // call -> lower layer command -> recommended way to transfer tokens.
        // (bool callSuccess, bytes memory dataReturned) = payable(msg.sender).call{value: address(this).balance}("");
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed"); // if it fails, we revert the transactions with require.
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders; // We read only one time "s_funders".
        for (uint256 index = 0; index < funders.length; index++) {
            s_addressToAmountFunded[funders[index]] = 0;
        }

        s_funders = new address[](0); // Reset the s_funders array.
        
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed"); // if it fails, we revert the transactions with require.
    }

    /* Getters */

    function getOwner() public view returns(address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns(address) {
        return s_funders[index];
    }
    
    function getAddressToAmountFunded(address funder) public view returns(uint256) {
        return s_addressToAmountFunded[funder];
    }
    
    function getPriceFeed() public view returns(AggregatorV3Interface) {
        return s_priceFeed;
    }
}
