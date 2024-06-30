// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

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

contract ProofOfBread is ERC1155, Ownable, ERC1155Pausable, ERC1155Supply {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error Unauthorized();

    /*//////////////////////////////////////////////////////////////
                               PARAMETERS
    //////////////////////////////////////////////////////////////*/

    address public signer;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _owner,
        address _signer,
        string memory _uri
    ) ERC1155(_uri) Ownable(_owner) {
        signer = _signer;
    }

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function collectBread(
        address account,
        uint256 id,
        bytes memory data
    ) public payable onlyOwner {
        (bytes memory message, bytes memory signature) = abi.decode(
            data,
            (bytes, bytes)
        );

        if (!isValidSignature(message, signature)) {
            revert Unauthorized();
        }

        _mint(account, id, 1, "");
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function adminMint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function revokeBread(
        address account,
        uint256 id,
        uint256 amount
    ) public onlyOwner {
        _burn(account, id, amount);
    }

    function setSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    function setURI(string memory _uri) public onlyOwner {
        _setURI(_uri);
    }

    /**
     * @notice Withdraw ETH from the contract.
     *
     * @param account The address to withdraw the ETH to.
     * @param amount The amount of ETH to transfer.
     */
    function withdraw(address account, uint256 amount) public onlyOwner {
        (bool success, ) = account.call{value: amount}("");

        if (!success) {
            revert TransferFailed();
        }
    }

    /**
     * @notice Recover ERC20 tokens sent to the contract by mistake.
     *
     * @param account The address to send the tokens to.
     * @param token  The address of the ERC20 token to recover.
     * @param amount  The amount of tokens to transfer.
     */
    function recoverERC20(
        address account,
        address token,
        uint256 amount
    ) public onlyOwner {
        IERC20(token).transfer(account, amount);
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

    function isValidSignature(
        bytes memory message,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(message);
        return SignatureChecker.isValidSignatureNow(signer, digest, signature);
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
