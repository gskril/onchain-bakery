// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
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
    error TransferFailed();
    error Unauthorized();
    error InvalidInput();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event OrderPlaced(
        address account,
        uint256 id,
        uint256 quantity,
        uint256 price
    );

    event CreditAdded(address account, uint256 quantity);

    event InventoryUpdated(uint256 id, uint256 quantity, uint256 price);

    /*//////////////////////////////////////////////////////////////
                               PARAMETERS
    //////////////////////////////////////////////////////////////*/

    /// @notice The account that can approve orders.
    address public signer;

    /// @notice The ProofOfBread NFT contract.
    address public proofOfBread;

    /// @notice A mapping of account addresses to their credit balance.
    mapping(address => uint256) public credit;

    /// @notice A mapping of token IDs to their inventory.
    mapping(uint256 id => Inventory) public inventory;

    /// @notice A mapping of claim IDs that have been used to place an order.
    mapping(bytes32 => bool) public usedClaims;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _owner,
        address _signer,
        address _proofOfBread,
        string memory _uri
    ) ERC1155(_uri) Ownable(_owner) {
        signer = _signer;
        proofOfBread = _proofOfBread;
    }

    /*//////////////////////////////////////////////////////////////
                            PUBLIC FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Place an order.
     *
     * @param account The address of the account to mint the NFT to.
     * @param id The token ID to mint.
     * @param quantity The amount of tokens to mint.
     * @param data ABI encoded message and signature to verify the order.
     */
    function buyBread(
        address account,
        uint256 id,
        uint256 quantity,
        bytes calldata data
    ) public payable {
        uint256 _price = price(account, id) * quantity;

        if (msg.value < _price) {
            revert InsufficientValue();
        }

        if ((!canOrder(account, data))) {
            revert Unauthorized();
        }

        _mintAndUpdateInventory(account, id, quantity, _price);
        _useClaimId(data);

        // Store overflow value as credit for future purchases
        uint256 remainder = msg.value - _price;
        if (remainder > 0) {
            _addCredit(account, remainder);
        }
    }

    /**
     * @notice Place an order with multiple items.
     *
     * @param account The address of the account to mint the NFTs to.
     * @param ids The token IDs to mint.
     * @param quantities The amount of tokens to mint.
     * @param data ABI encoded message and signature to verify the order.
     */
    function buyBreads(
        address account,
        uint256[] calldata ids,
        uint256[] calldata quantities,
        bytes[] calldata data
    ) public payable {
        for (uint256 i = 0; i < ids.length; i++) {
            buyBread(account, ids[i], quantities[i], data[i]);
        }
    }

    /**
     * @notice Get the price of a token for a given account, taking into account any credit they have.
     *
     * @param account The address of the account to check the price for.
     * @param id The token ID to check the price for.
     */
    function price(address account, uint256 id) public view returns (uint256) {
        uint256 fullPrice = inventory[id].price;
        uint256 discount = Math.min(credit[account], fullPrice);
        return fullPrice - discount;
    }

    /**
     * @notice Check if the signer approves of an order.
     *
     * @param account The address of the account trying to place an order.
     * @param data ABI encoded message and signature to verify the order.
     */
    function canOrder(
        address account,
        bytes calldata data
    ) public view returns (bool) {
        (bytes memory message, bytes memory signature) = abi.decode(
            data,
            (bytes, bytes)
        );

        (address buyer, bytes32 claimId, uint256 expiration) = abi.decode(
            message,
            (address, bytes32, uint256)
        );

        bool isExpired = block.timestamp > expiration;
        bool isBuyerMatched = account == buyer;
        bool isClaimUsed = usedClaims[claimId];

        if (isExpired || isBuyerMatched || isClaimUsed) {
            return false;
        }

        address _signer = ECDSA.recover(
            MessageHashUtils.toEthSignedMessageHash(message),
            signature
        );

        return _signer == signer;
    }

    /**
     * @notice Get the avaiable quantity of a batch of tokens.
     *
     * @param ids The token IDs to check the inventory for.
     */
    function inventoryBatch(
        uint256[] calldata ids
    ) public view returns (Inventory[] memory) {
        Inventory[] memory data = new Inventory[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            data[i] = inventory[ids[i]];
        }

        return data;
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Update the inventory for a token. This does not mint or burn any tokens.
     *
     * @param ids The token IDs to update.
     * @param quantities The new quantities of the tokens.
     * @param prices The new prices of the tokens in wei.
     */
    function updateInventory(
        uint256[] calldata ids,
        uint256[] calldata quantities,
        uint256[] calldata prices
    ) public onlyOwner {
        if (ids.length != quantities.length || ids.length != prices.length) {
            revert InvalidInput();
        }

        for (uint256 i = 0; i < ids.length; i++) {
            inventory[ids[i]] = Inventory(quantities[i], prices[i]);
            emit InventoryUpdated(ids[i], quantities[i], prices[i]);
        }
    }

    /**
     * @notice Mint a token to an account for free.
     *
     * @param account The address of the account to mint the token to.
     * @param id The token ID to mint.
     * @param quantity The amount of tokens to mint.
     */
    function adminOrder(
        address account,
        uint256 id,
        uint256 quantity
    ) public onlyOwner {
        _mintAndUpdateInventory(account, id, quantity, 0);
    }

    /**
     * @notice Add credit to an account. This can be used to give discounts.
     *
     * @param account The address of the account to add credit to.
     * @param amount The amount of credit to add.
     */
    function addCredit(address account, uint256 amount) public onlyOwner {
        _addCredit(account, amount);
    }

    /**
     * @notice Revoke an NFT, essentially canceling an order.
     *
     * @param account The address of the account to revoke the NFT from.
     * @param id The token ID to revoke.
     * @param quantity The amount of tokens to revoke.
     */
    function revokeOrder(
        address account,
        uint256 id,
        uint256 quantity
    ) public onlyOwner {
        _burn(account, id, quantity);
        inventory[id].quantity += quantity;
    }

    function setProofOfBread(address _proofOfBread) public onlyOwner {
        proofOfBread = _proofOfBread;
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

    function _mintAndUpdateInventory(
        address account,
        uint256 id,
        uint256 quantity,
        uint256 _price
    ) internal {
        if ((inventory[id].quantity - quantity) < 0) {
            revert SoldOut(id);
        }

        _mint(account, id, quantity, "");
        inventory[id].quantity -= quantity;
        emit OrderPlaced(account, id, quantity, _price);
    }

    function _addCredit(address account, uint256 amount) internal {
        credit[account] += amount;
        emit CreditAdded(account, amount);
    }

    function _useClaimId(bytes calldata data) internal {
        // Extract the message from the encoded data
        bytes memory message = abi.decode(data, (bytes));

        // Extract the claim ID from the message
        (, bytes32 claimId) = abi.decode(message, (address, bytes32));

        // Mark the claim as used
        usedClaims[claimId] = true;
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
