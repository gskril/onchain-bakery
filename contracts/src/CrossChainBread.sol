// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
    function buyBreads(
        address account,
        uint256[] calldata ids,
        bytes32[] calldata proof
    ) external payable;
}

contract CrossChainBread {
    IBread public bread;

    constructor(address _bread) {
        bread = IBread(_bread);
    }

    function handleV3AcrossMessage(
        address tokenSent,
        uint256 amount,
        address relayer,
        bytes memory message
    ) external {
        // TODO: Check that the tokenSent is WETH, and unwrap it

        (address account, uint256[] memory ids, bytes32[] memory proof) = abi
            .decode(message, (address, uint256[], bytes32[]));

        bread.buyBreads{value: amount}(account, ids, proof);
    }
}
