// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./libraries/CompareMath.sol";

import "./abstract/Administered.sol";
import "./interfaces/ITicket.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract Ticket is ERC20, ITicket, Ownable {
    constructor(string memory _name, string memory _symbol)
        public
        ERC20(_name, _symbol)
    {}

    function print(address _account, uint256 _amount)
        external
        override
        onlyOwner
    {
        return _mint(_account, _amount);
    }

    function redeem(address _account, uint256 _amount)
        external
        override
        onlyOwner
    {
        return _burn(_account, _amount);
    }
}