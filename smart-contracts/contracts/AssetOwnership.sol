// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetOwnership is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct AssetMetadata {
        uint256 capacity; // in kW
        string location;
        uint256 installationDate;
        bool verified;
    }

    mapping(uint256 => AssetMetadata) public assetDetails;

    constructor() ERC721("SolarAsset", "SOLAR") Ownable(msg.sender) {}

    function safeMint(address to, string memory uri, uint256 capacity, string memory location) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        assetDetails[tokenId] = AssetMetadata({
            capacity: capacity,
            location: location,
            installationDate: block.timestamp,
            verified: true
        });
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
