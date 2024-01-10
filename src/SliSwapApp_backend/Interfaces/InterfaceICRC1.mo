import ICRC1Types "../Types/TypesICRC1";


module {
   /// Interface for the ICRC token canister
    public type TokenInterface = actor {

        /// Returns the name of the token
        icrc1_name : shared query () -> async Text;

        /// Returns the symbol of the token
        icrc1_symbol : shared query () -> async Text;

        /// Returns the number of decimals the token uses
        icrc1_decimals : shared query () -> async Nat8;

        /// Returns the fee charged for each transfer
        icrc1_fee : shared query () -> async ICRC1Types.Balance;

        /// Returns the tokens metadata
        icrc1_metadata : shared query () -> async ICRC1Types.MetaData;

        /// Returns the total supply of the token
        icrc1_total_supply : shared query () -> async ICRC1Types.Balance;

        /// Returns the account that is allowed to mint new tokens
        icrc1_minting_account : shared query () -> async ?ICRC1Types.Account;

        /// Returns the balance of the given account
        icrc1_balance_of : shared query (ICRC1Types.Account) -> async ICRC1Types.Balance;

        /// Transfers the given amount of tokens from the sender to the recipient
        icrc1_transfer : shared (ICRC1Types.TransferArgs) -> async ICRC1Types.TransferResult;

        /// Returns the standards supported by this token's implementation
        icrc1_supported_standards : shared query () -> async [ICRC1Types.SupportedStandard];

    };

};