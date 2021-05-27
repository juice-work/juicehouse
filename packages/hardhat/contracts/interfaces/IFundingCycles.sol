// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IPrices.sol";
import "./IFundingCycleBallot.sol";

/// @notice The funding cycle structure represents a project stewarded by an address, and accounts for which addresses have helped sustain the project.
struct FundingCycle {
    // A unique number that's incremented for each new funding cycle, starting with 1.
    uint256 id;
    // The ID of the project contract that this funding cycle belongs to.
    uint256 projectId;
    // The number of this funding cycle for the project.
    uint256 number;
    // The ID of the project's funding cycle that came before this one. 0 if none.
    uint256 previous;
    // The time when this funding cycle was last configured.
    uint256 configuration;
    // A number determining the amount of redistribution shares this funding cycle will issue to each sustainer.
    uint256 weight;
    // The ballot contract to use to determine a subsequent funding cycle's reconfiguration status.
    IFundingCycleBallot ballot;
    // The time when this funding cycle will become active.
    uint256 start;
    // The number of seconds until this funding cycle's surplus is redistributed.
    uint256 duration;
    // The amount that this funding cycle is targeting in terms of the currency.
    uint256 target;
    // The currency that the target is measured in.
    uint256 currency;
    // The percentage of each payment to send as a fee to the Juice admin.
    uint256 fee;
    // A percentage indicating how much more weight to give a funding cycle compared to its predecessor.
    uint256 discountRate;
    // The amount of available funds that have been tapped by the project in terms of the currency.
    uint256 tapped;
    // A packed list of extra data. The first 8 bytes are reserved for versioning.
    uint256 metadata;
}

interface IFundingCycles {
    function latestId(uint256 _project) external view returns (uint256);

    function count() external view returns (uint256);

    function BASE_WEIGHT() external view returns (uint256);

    function get(uint256 _fundingCycleId)
        external
        view
        returns (FundingCycle memory);

    function getQueued(uint256 _projectId)
        external
        view
        returns (FundingCycle memory);

    function getCurrent(uint256 _projectId)
        external
        view
        returns (FundingCycle memory);

    function configure(
        uint256 _projectId,
        uint256 _target,
        uint256 _currency,
        uint256 _duration,
        uint256 _discountRate,
        uint256 _fee,
        IFundingCycleBallot _ballot,
        uint256 _metadata,
        bool _configureActiveFundingCycle
    ) external returns (uint256 fundingCycleId);

    function tap(uint256 _projectId, uint256 _amount)
        external
        returns (uint256 fundingCycleId);
}
