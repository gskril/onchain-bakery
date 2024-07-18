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
    function adminOrder(
        address account,
        uint256[] calldata ids,
        uint256[] calldata quantities
    ) external payable;
}

contract OpenMinter is Ownable {
    error InsufficientValue();
    error Unauthorized();

    struct Status {
        bool active;
        uint256 price;
    }

    IBread public immutable bread;
    mapping(uint256 => Status) public status;

    constructor(address _bread, address _owner) Ownable(_owner) {
        bread = IBread(_bread);
    }

    function mint(address to, uint256 id, uint256 quantity) public payable {
        Status memory s = status[id];
        if (!s.active) revert Unauthorized();

        uint256 price = s.price * quantity;
        if (msg.value < price) revert InsufficientValue();

        uint256[] memory ids = new uint256[](1);
        ids[0] = id;

        uint256[] memory quantities = new uint256[](1);
        quantities[0] = quantity;

        bread.adminOrder{value: msg.value}(to, ids, quantities);
    }

    function updateStatus(
        uint256 id,
        bool active,
        uint256 price
    ) public onlyOwner {
        status[id] = Status(active, price);
    }
}
