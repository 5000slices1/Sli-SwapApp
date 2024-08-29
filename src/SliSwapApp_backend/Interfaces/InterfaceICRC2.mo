import ICRC1Types "../Types/TypesICRC1";

module {
    
    public type ApproveError = {
        #BadFee : { expected_fee : Nat };

        // The caller does not have enough funds to pay the approval fee.
        #InsufficientFunds : { balance : Nat };

        // The caller specified the [expected_allowance] field, and the current
        // allowance did not match the given value.
        #AllowanceChanged : { current_allowance : Nat };

        // The approval request expired before the ledger had a chance to apply it.
        #Expired : { ledger_time : Nat64 };

        #TooOld;
        #CreatedInFuture : { ledger_time : Nat64 };
        #Duplicate : { duplicate_of : Nat };
        #TemporarilyUnavailable;
        #GenericError : { message : Text; error_code : Nat };

    };

    public type Balance = ICRC1Types.Balance;
    public type Memo = ?Blob;
    public type Subaccount = Blob;
    public type Account = ICRC1Types.Account;
    public type Allowance = { allowance : Nat; expires_at : ?Nat64 };
    public type AllowanceArgs = { account : ICRC1Types.Account; spender : ICRC1Types.Account };
        
    public type AllowanceInfo = { spender:ICRC1Types.Account; allowance : Nat; expires_at : ?Nat64 };
     public type ApproveResult = {
        #Ok : Nat;
        #Err : ApproveError;
    };
    public type ApproveResponse = ApproveResult;

     public type ApproveArgs = {
        from_subaccount : ?Subaccount;      
        spender : Account;       
        amount : Balance;       
        expected_allowance : ?Nat;
        expires_at : ?Nat64;
        fee : ?Balance;
        memo : ?Memo;
        created_at_time : ?Nat64;
    };

    public type TransferFromError = {
        #GenericError : { message : Text; error_code : Nat };
        #TemporarilyUnavailable;
        #InsufficientAllowance : { allowance : Nat };
        #BadBurn : { min_burn_amount : Nat };
        #Duplicate : { duplicate_of : Nat };
        #BadFee : { expected_fee : Nat };
        #CreatedInFuture : { ledger_time : Nat64 };
        #TooOld;
        #InsufficientFunds : { balance : Nat };
    };

       public type TransferFromArgs = {
        spender_subaccount : ?Subaccount;

        // Transfers a token amount from the from account to the to account using the allowance of the
        // spender's account (SpenderAccount = { owner = caller; subaccount = spender_subaccount }).
        // The ledger draws the fees from the from account.
        from : Account;
        to : Account;
        amount : Balance;
        fee : ?Balance;
        memo : ?Memo;
        created_at_time : ?Nat64;
    };

    public type TransferFromResponse = {
        #Ok : Nat;
        #Err : TransferFromError;
    };

    /// Interface for the ICRC token canister
    public type Icrc2Interface = actor {

        // Retrieves the allowance for a given spender.
        icrc2_allowance : shared query AllowanceArgs -> async Allowance;

        // Approves a spender to transfer tokens on behalf of the owner.
        icrc2_approve : shared ApproveArgs -> async ApproveResponse;

        // Transfers tokens from one account to another using the allowance mechanism.
        icrc2_transfer_from : shared TransferFromArgs -> async TransferFromResponse;
    };

};
