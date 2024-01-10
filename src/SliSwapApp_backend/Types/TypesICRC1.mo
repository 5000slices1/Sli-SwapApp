

module{


    public type Balance = Nat;

    ///This value-type is used for the token metadata
    public type Value = {#Nat8:Nat8; #Nat : Nat; #Int : Int; #Blob : Blob; #Text : Text};

    ///Single Metadata item-type
    public type MetaDatum = (Text, Value);
    
    ///This information is used by the token
    public type MetaData = [MetaDatum];

    ///Sub-account as blob
    public type Subaccount = Blob;

    public type Timestamp = Nat64;

    public type TxIndex = Nat;  

    public type SupportedStandard = {
        name : Text;
        url : Text;
    };

    ///Definition of account-type 
    public type Account = {
        owner : Principal;
        subaccount : ?Subaccount;
    };

    /// Arguments for a transfer operation
    public type TransferArgs = {
        from_subaccount : ?Subaccount;
        to : Account;
        amount : Balance;
        fee : ?Balance;
        memo : ?Blob;

        /// The time at which the transaction was created.
        /// If this is set, the canister will check for duplicate transactions and reject them.
        created_at_time : ?Nat64;
    };

    public type TimeError = {
        #TooOld;
        #CreatedInFuture : { ledger_time : Timestamp };
    };

    public type TransferError = TimeError or {
        #BadFee : { expected_fee : Balance };
        #BadBurn : { min_burn_amount : Balance };
        #InsufficientFunds : { balance : Balance };
        #Duplicate : { duplicate_of : TxIndex };
        #TemporarilyUnavailable;
        #GenericError : { error_code : Nat; message : Text };
    };

    public type TransferResult = {
        #Ok : TxIndex;
        #Err : TransferError;
    };




};