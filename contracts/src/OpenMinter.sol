// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

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

interface IBread {
    struct Inventory {
        uint256 quantity;
        uint256 price;
    }

    function adminOrder(
        address account,
        uint256[] calldata ids,
        uint256[] calldata quantities
    ) external payable;

    function inventory(uint256 id) external view returns (Inventory memory);
}

contract OpenMinter is Ownable {
    error InsufficientValue();
    error Unauthorized();

    IBread public immutable bread;
    mapping(uint256 => bool) public open;

    constructor(address _bread, address _owner) Ownable(_owner) {
        bread = IBread(_bread);
    }

    function mint(address to, uint256 id, uint256 quantity) public payable {
        if (!open[id]) revert Unauthorized();

        uint256 _price = bread.inventory(id).price * quantity;
        if (msg.value < _price) revert InsufficientValue();

        uint256[] memory ids = new uint256[](1);
        ids[0] = id;

        uint256[] memory quantities = new uint256[](1);
        quantities[0] = quantity;

        bread.adminOrder{value: msg.value}(to, ids, quantities);
    }

    function price(uint256 id) public view returns (uint256) {
        return bread.inventory(id).price;
    }

    function updateStatus(uint256 _id, bool _open) public onlyOwner {
        open[_id] = _open;
    }
}
