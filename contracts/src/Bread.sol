// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

///////////////////////////////////////////////////////////
//                                                       //
//       ____     ____    U _____ u    _      ____       //
//    U | __")uU |  _"\ u \| ___"|/U  /"\  u |  _"\      //
//     \|  _ \/ \| |_) |/  |  _|"   \/ _ \/ /| | | |     //
//      | |_) |  |  _ <    | |___   / ___ \ U| |_| |\    //
//      |____/   |_| \_\   |_____| /_/   \_\ |____/ u    //
//     _|| \\_   //   \\_  <<   >>  \\    >>  |||_       //
//    (__) (__) (__)  (__)(__) (__)(__)  (__)(__)_)      //
//                                                       //
///////////////////////////////////////////////////////////

contract Bread is ERC1155, Ownable, ERC1155Pausable, ERC1155Supply {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Inventory {
        uint256 quantity;
        uint256 price;
    }

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error SoldOut(uint256 id);
    error InsufficientValue();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event OrderPlaced(
        address account,
        uint256 id,
        uint256 amount,
        uint256 price
    );

    /*//////////////////////////////////////////////////////////////
                               PARAMETERS
    //////////////////////////////////////////////////////////////*/

    address public proofOfBread;
    mapping(address => uint256) public credit;
    mapping(uint256 id => Inventory) public inventory;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _owner,
        address _proofOfBread,
        string memory _uri
    ) ERC1155(_uri) Ownable(_owner) {
        proofOfBread = _proofOfBread;
    }

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function orderBread(
        address account,
        uint256 id,
        uint256 amount
    ) public payable {
        uint256 _price = price(account, id) * amount;

        if (msg.value < _price) {
            revert InsufficientValue();
        }

        _mintAndUpdateInventory(account, id, amount);
        emit OrderPlaced(account, id, amount, _price);

        // Store overflow value as credit for future purchases
        uint256 remainder = msg.value - _price;
        if (remainder > 0) {
            credit[account] += remainder;
        }
    }

    function price(address account, uint256 id) public view returns (uint256) {
        uint256 fullPrice = inventory[id].price;
        uint256 discount = Math.min(credit[account], fullPrice);
        return fullPrice - discount;
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function updateInventory(
        uint256 id,
        uint256 quantity,
        uint256 _price
    ) public onlyOwner {
        inventory[id] = Inventory(quantity, _price);
    }

    function adminOrder(
        address account,
        uint256 id,
        uint256 amount
    ) public onlyOwner {
        _mintAndUpdateInventory(account, id, amount);
        emit OrderPlaced(account, id, amount, 0);
    }

    function addCredit(address account, uint256 amount) public onlyOwner {
        credit[account] += amount;
    }

    function setURI(string memory _uri) public onlyOwner {
        _setURI(_uri);
    }

    function setProofOfBread(address _proofOfBread) public onlyOwner {
        proofOfBread = _proofOfBread;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                            HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _mintAndUpdateInventory(
        address account,
        uint256 id,
        uint256 amount
    ) internal {
        if ((inventory[id].quantity - amount) < 0) {
            revert SoldOut(id);
        }

        _mint(account, id, amount, "");
        inventory[id].quantity -= amount;
    }

    /*//////////////////////////////////////////////////////////////
                           REQUIRED OVERRIDES
    //////////////////////////////////////////////////////////////*/

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
