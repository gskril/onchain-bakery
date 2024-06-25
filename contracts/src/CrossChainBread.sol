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

interface IWETH {
    /// @notice Deposit ether to get wrapped ether
    function deposit() external payable;

    /// @notice Withdraw wrapped ether to get ether
    function withdraw(uint256) external;
}

contract CrossChainBread {
    error Unauthorized();
    error NotWETH();

    IWETH public immutable weth;
    IBread public immutable bread;
    address public immutable acrossSpokePool;

    constructor(address _weth, address _bread, address _acrossSpokePool) {
        weth = IWETH(_weth);
        bread = IBread(_bread);
        acrossSpokePool = _acrossSpokePool;
    }

    function handleV3AcrossMessage(
        address tokenSent,
        uint256 amount,
        address relayer,
        bytes memory message
    ) external {
        if (msg.sender != acrossSpokePool) revert Unauthorized();
        if (tokenSent != address(weth)) revert NotWETH();

        weth.withdraw(amount);

        (address account, uint256[] memory ids, bytes32[] memory proof) = abi
            .decode(message, (address, uint256[], bytes32[]));

        bread.buyBreads{value: amount}(account, ids, proof);
    }
}
