// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

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

    error InvalidInput();
    error TransferFailed();
    error Unauthorized();

    /*//////////////////////////////////////////////////////////////
                               PARAMETERS
    //////////////////////////////////////////////////////////////*/

    address public signer;
    address public bread;
    mapping(bytes32 => bool) public usedClaims;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _owner,
        address _signer,
        address _bread,
        string memory _uri
    ) ERC1155(_uri) Ownable(_owner) {
        signer = _signer;
        bread = _bread;
    }

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function collectBread(
        address account,
        uint256 id,
        bytes memory data
    ) public payable {
        if (!canMint(account, data)) {
            revert Unauthorized();
        }

        bytes memory message = abi.decode(data, (bytes));
        (, bytes32 claimId) = abi.decode(message, (address, bytes32));

        usedClaims[claimId] = true;
        _mint(account, id, 1, "");
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function distributeBread(
        address[] calldata accounts,
        uint256[] calldata ids
    ) public onlyOwnerOrSigner {
        for (uint256 i = 0; i < accounts.length; i++) {
            _mint(accounts[i], ids[i], 1, "");
        }
    }

    function revokeBread(
        address[] calldata account,
        uint256[] calldata id,
        uint256[] calldata amount
    ) public onlyOwnerOrSigner {
        for (uint256 i = 0; i < account.length; i++) {
            _burn(account[i], id[i], amount[i]);
        }
    }

    function setSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    function setURI(string memory _uri) public onlyOwner {
        _setURI(_uri);
    }

    function withdraw(address account, uint256 amount) public onlyOwner {
        (bool success, ) = account.call{value: amount}("");

        if (!success) {
            revert TransferFailed();
        }
    }

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

    function canMint(
        address account,
        bytes memory data
    ) public view returns (bool) {
        (bytes memory message, bytes memory signature) = abi.decode(
            data,
            (bytes, bytes)
        );

        (address minter, bytes32 claimId, uint256 expiration) = abi.decode(
            message,
            (address, bytes32, uint256)
        );

        if (minter != account) return false;
        if (usedClaims[claimId]) return false;
        if (block.timestamp > expiration) return false;

        address _signer = ECDSA.recover(
            MessageHashUtils.toEthSignedMessageHash(message),
            signature
        );

        return _signer == signer;
    }

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwnerOrSigner() {
        if (msg.sender != owner() && msg.sender != signer) {
            revert Unauthorized();
        }
        _;
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
