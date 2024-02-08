import T "../Types/TypesCommon";
import Principal "mo:base/Principal";
import List "mo:base/List";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Blob "mo:base/Blob";
import Time "mo:base/Time";
import Option "mo:base/Option";
import Random "mo:base/Random";
import Interfaces "../Interfaces/Interfaces";
import TypesIcrc "../Types/TypesICRC1";
import Dip20Types "../Types/TypesDip20";
import CommonLib "CommonLib";
import StableTrieMap "mo:StableTrieMap";
import TypesDip20 "../Types/TypesDip20";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Nat64";
import Nat "mo:base/Nat";
import TokensInfoLib "TokensInfoLib";
import InterfaceHistoryCanister "../Interfaces/InterfaceHistoryCanister";
import TypesArchive "../Types/TypesArchive";
import TypesCommon "../Types/TypesCommon";


module{

    //let expirationDuration:Int = 900000000000; // 15 minutes  
    let expirationDuration:Int = 1800000000000; // 30 minutes  
   
    public func getSwapWallet(caller:Principal,
        usersSwapInfo:T.UsersSwapInfo):T.ResponseGetUsersSwapWallet
    {
        if (Principal.isAnonymous(caller)){
            return #Err("Call by Anonymous principal not allowed.");
        };
        return getSwapWalletFromUserPrincipal(caller, usersSwapInfo);
    };

    private func getSwapWalletFromUserPrincipal(principal: Principal,
    usersSwapInfo:T.UsersSwapInfo ): T.ResponseGetUsersSwapWallet {
              
        let principalBlob:Blob = Principal.toBlob(principal);

        let item = StableTrieMap.get(usersSwapInfo.userSwapInfoItems, Blob.equal, Blob.hash, principalBlob);
        switch(item) {
            case(?userSwapInfoItem) { 
                    return #Ok(userSwapInfoItem.swapWallet);                  
                };
            case(_) { return #NotExist; };
        };       
    };

    private func getUserSwapInfoItem(principal: Principal,
    usersSwapInfo:T.UsersSwapInfo ): Result.Result<T.UserSwapInfoItem,Text> {
              
        let principalBlob:Blob = Principal.toBlob(principal);

        let item = StableTrieMap.get(usersSwapInfo.userSwapInfoItems, Blob.equal, Blob.hash, principalBlob);
        switch(item) {
            case(?userSwapInfoItem) { 
                    return #ok(userSwapInfoItem);                  
                };
            case(_) { return #err("not exist"); };
        };       
    };

    public func RemoveAllConvertionStates(encodedPrincipal:Blob,dataPerToken:T.CommonDataPerToken){
        StableTrieMap.delete(dataPerToken.convertState.transferToSubaccountStarted, Blob.equal, Blob.hash, encodedPrincipal); 
        StableTrieMap.delete(dataPerToken.convertState.transferFromSubaccountStarted, Blob.equal, Blob.hash, encodedPrincipal); 
        StableTrieMap.delete(dataPerToken.convertState.convertInProgress, Blob.equal, Blob.hash, encodedPrincipal); 
    };


    private func GetProgressStartedTime(encodedPrincipal:Blob, progressItem:StableTrieMap.StableTrieMap<T.EncodedPrincipal, Time.Time>): Result.Result<Time.Time, Text>{

        let result = StableTrieMap.get(progressItem, Blob.equal, Blob.hash, encodedPrincipal);
        switch(result){
            case (?theTime){
                return #ok(theTime);
            };
            case (_){
                return #err("not found");
            };
        };
    };

    private func IsProgressStateSet(fromResponse:Result.Result<Time.Time, Text>): Bool{

         switch(fromResponse){
            case (#ok(theTime)){
                return true;
            };
            case (_){
                return false;
            };
        };
    };

      public func SomeDepositDip20StillOnProgress(principal:Principal, dataPerToken:T.CommonDataPerToken): Bool{

        let principalBlob = Principal.toBlob(principal);
        let depositStateTime = StableTrieMap.get(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, principalBlob);

        switch(depositStateTime){
            case (?lastDepositTime){                      
                if ( (lastDepositTime + expirationDuration) > Time.now()){     
                    return true;                         
                };
            };
            case (_) {
                // do nothing
            };
        };

        return false; 
    };

    public func SomeConversionIcrc1StillOnProgress(principal:Principal, dataPerToken:T.CommonDataPerToken): Bool{


        let encodedPrincipal = Principal.toBlob(principal);
        let conversionStartedStateInfo= GetProgressStartedTime(encodedPrincipal, 
            dataPerToken.convertState.convertInProgress);

        switch(conversionStartedStateInfo){
                case (#ok(startedTime)){
                   
                    let transferToSubAccountState = GetProgressStartedTime(encodedPrincipal, dataPerToken.convertState.transferToSubaccountStarted);
                    switch(transferToSubAccountState){
                        case (#ok(secondTime)){                       
                            if ( (secondTime + expirationDuration) > Time.now()){
                                return true;
                            };
                        };
                        case (_)
                        {
                           
                        };
                    };

                    let transferToUsersWalletStarted = GetProgressStartedTime(encodedPrincipal, dataPerToken.convertState.transferFromSubaccountStarted);
                    switch(transferToUsersWalletStarted){
                        case (#ok(thirdTime)){
                            if ( (thirdTime + expirationDuration) > Time.now()){
                                return true;
                            }
                        };
                        case (_)
                        {
                             
                        };
                    };

                   
                };
                case (_){

                    return false;
                };
        };

        return false;
    };
 
    public func CanUserDepositDip20(principal:Principal, dataPerToken:T.CommonDataPerToken): (Bool, Result.Result<Text,Text>){

        let principalBlob = Principal.toBlob(principal);
        let depositStateTime = StableTrieMap.get(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, principalBlob);

        switch(depositStateTime){
            case (?lastDepositTime){                      
                if ( (lastDepositTime + expirationDuration) > Time.now()){     
                    return (false, #err("Deposit still on progress"));                         
                };
            };
            case (_) {
                // do nothing
            };
        };

        let userInfo = getSwapWalletFromUserPrincipal(principal,dataPerToken.swapInfo );
        switch(userInfo){
            case (#NotExist){
                if (List.size(dataPerToken.approvedWallets.approvedWalletsFree) <=0){
                    return (false, #err("No free swap wallets available"));
                };
            };
            case (#Ok(principalValue)){
                //do nothing here, but later do addition check if conversion is on progress or not.
            };
            case (#Err(text)){
                return (false, #err(text));
            };
        };

        if (SomeConversionIcrc1StillOnProgress(principal, dataPerToken) == true){
            return (false, #err("Conversion process still on progress"));
        };

        return (true, #ok("Deposit is possible."));

    };

    //This returns not the real-amount, but the amount that should be considered for convertion to the new ICRC1 tokens,
    //so that real 1:1 convertion will take place. (In reality there is smaller amount of dip20 tokens inside the deposit-wallet,
    //because of the applied transfer-fees for the approval and transfer) 
    public func GetDip20DepositedAmount(usersPrincipal:Principal, 
    dip20CanisterId:Text,usersSwapInfo:T.UsersSwapInfo, transferFee:Nat) : async* Result.Result<(Nat,Nat, Principal), Text>{

        let usersPrincipalBlob = Principal.toBlob(usersPrincipal);

        if (Principal.isAnonymous(usersPrincipal)){
            return #err("Anonymous principals is not supported.");
        };

        let reponse = getUserSwapInfoItem(usersPrincipal,usersSwapInfo );
        var swapWalletPrincipal:Principal = Principal.fromText("aaaaa-aa");
        var depositCount = 0;
        switch(reponse){
            case (#err(text)){
                return #err(text);
            };
            case (#ok(userSwapInfoItem)){
                swapWalletPrincipal:= userSwapInfoItem.swapWallet;
                depositCount:=userSwapInfoItem.depositCount;
            };
        };
        
        let actorDip20 : Interfaces.InterfaceDip20 = actor (dip20CanisterId);
        var realDepositedAmount = await actorDip20.balanceOf(swapWalletPrincipal);
        let depositedAmount = realDepositedAmount + ( depositCount * (transferFee * 2));
        return #ok(depositedAmount, realDepositedAmount, swapWalletPrincipal);
    };
  
    public func DepositDip20Tokens(usersPrincipal:Principal, 
    dip20CanisterId:Text, swapAppPrincipal:Principal, dataPerToken:T.CommonDataPerToken, 
    amount:Nat, fee:Nat,archive:InterfaceHistoryCanister.ArchiveData, tokenType:TypesCommon.SpecificTokenType):async* Result.Result<Text,Text>{

        let usersPrincipalBlob = Principal.toBlob(usersPrincipal);

        if (Principal.isAnonymous(usersPrincipal)){
            return #err("Anonymous principals is not supported.");
        };

        if (Principal.equal(usersPrincipal, swapAppPrincipal) == true){
            return #err("Depositing from SwapApp-Principal is not supported.");
        };

        let actorDip20 : Interfaces.InterfaceDip20 = actor (dip20CanisterId);
        let userBalance = await actorDip20.balanceOf(usersPrincipal);
        
        let amountNeeded = amount+fee;
        if (userBalance < amountNeeded){

            return #err("Your balance is too low for depositing " # debug_show(amount) #" tokens.");
        };

        //Now check if approval amount is enough
        let allowanceAmount = await actorDip20.allowance(usersPrincipal, swapAppPrincipal);
        if (allowanceAmount < amount){        
            return #err("Approval amount is not enough.");
        };

        //Check if the deposit was already started, and if not then the start state is set automatically
        let canUserDepositDip20Result = CanUserDepositDip20(usersPrincipal, dataPerToken);
        if (canUserDepositDip20Result.0 == false){
            return canUserDepositDip20Result.1;
        };

        RemoveAllConvertionStates(usersPrincipalBlob,dataPerToken);      
        StableTrieMap.delete(dataPerToken.convertState.temporarySubaccounts,Blob.equal, Blob.hash, usersPrincipalBlob);
           
        StableTrieMap.put(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, usersPrincipalBlob, Time.now());
        
        //Get the swapWallet-Principal, where the tokens should transfered to.
        let swapWalletResponse = getSwapWallet(usersPrincipal,dataPerToken.swapInfo);
        var swapWalletPrincipal:Principal = Principal.fromText("aaaaa-aa");
        switch(swapWalletResponse){
            case (#Ok(swapWallet)){
                swapWalletPrincipal :=swapWallet;
            };
            case (#Err(text)){

                //Remove the depositing state
                StableTrieMap.delete(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, usersPrincipalBlob);                                      
                return #err(text);
            };
            case (#NotExist){
                if (List.size(dataPerToken.approvedWallets.approvedWalletsFree) <=0){
                    return #err("No free sli-swap-wallet available. Please inform our Team about this issue. Thanks!");
                };

                //Now we need to get the swap-wallet:
                let popResult = List.pop(dataPerToken.approvedWallets.approvedWalletsFree);
                dataPerToken.approvedWallets.approvedWalletsFree:=popResult.1;
              
                switch(popResult.0){
                    case (?swapWalletPrincipalResult)
                    {
                        swapWalletPrincipal:=swapWalletPrincipalResult;
                    };
                    case (_){
                        return #err("The asigned sli-swap-wallet cannot be used");
                    };
                };

                dataPerToken.approvedWallets.approvedWalletsInUse:= List.push(swapWalletPrincipal,
                    dataPerToken.approvedWallets.approvedWalletsInUse);                

                //Create new user id
                let newUserId:Blob = await Random.blob();

                //Add new entries for the user
                let newEntry:T.UserSwapInfoItem = {
                    swapWallet = swapWalletPrincipal;
                    depositCount = 0;
                    userId = newUserId;
                };
                StableTrieMap.put(dataPerToken.swapInfo.userSwapInfoItems, Blob.equal, Blob.hash, usersPrincipalBlob, newEntry);
                StableTrieMap.put(dataPerToken.swapInfo.principalMappings, Blob.equal, Blob.hash, newUserId, usersPrincipal);
            };
        };


        //Create depositId and save it
        let newDepositId:Blob = await Random.blob();
        let depositIdsOrNull = StableTrieMap.get(dataPerToken.depositState.depositIds, Blob.equal, Blob.hash, usersPrincipalBlob);
        var depositIdList:List.List<Blob> = List.nil<Blob>();

        switch(depositIdsOrNull){
            case (?foundDepositList){
                 depositIdList:= List.push(newDepositId,foundDepositList);
            };
            case (_){
                depositIdList:= List.push(newDepositId,depositIdList);
            };
        };

        StableTrieMap.put(dataPerToken.depositState.depositIds, Blob.equal, Blob.hash, usersPrincipalBlob,depositIdList);

        let archiveDepositItem:TypesArchive.ArchivedDeposit = {
            tokenType:TypesCommon.SpecificTokenType = tokenType;
            amount:Nat = amount + (2 * fee);
            realAmount:Nat = amount;
            from:Principal = usersPrincipal;
            to:Principal = swapWalletPrincipal;
            depositId:Blob = newDepositId;
            time:Time.Time = Time.now();
        };

        try{
            let depositItemAddResult = await archive.canister.deposit_Add(archiveDepositItem);
            switch(depositItemAddResult) {
                case(#ok(text)) { 
                    //do nothing  
                };
                case(#err(text)) { return #err(text); };
            };
        }catch(error){
            //ignore error
            return #err(Error.message(error));
        };
       
        //Now do the transfer:    
        var transferResult:TypesDip20.TxReceipt = #Ok(0);

        try{

            transferResult := await actorDip20.transferFrom(usersPrincipal, swapWalletPrincipal, amount);
        }
        catch(error)
        {
            
        };
       
        //Remove the depositing state  

        StableTrieMap.delete(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, usersPrincipalBlob);                                      

                         
        switch (transferResult) {
            case (#Err (e)) {               
                return #err(debug_show(e));
               
            };
            case (_) {

                let itemToChange = StableTrieMap.get(dataPerToken.swapInfo.userSwapInfoItems, Blob.equal, Blob.hash, usersPrincipalBlob);
                switch(itemToChange){
                    case (?userSwapInfo){
                        let currentDepositCount = userSwapInfo.depositCount;
                        let newEntry:T.UserSwapInfoItem = {
                            swapWallet = swapWalletPrincipal;
                            depositCount = currentDepositCount +1;  
                            userId = userSwapInfo.userId;                     
                        };
                        ignore StableTrieMap.replace(dataPerToken.swapInfo.userSwapInfoItems, Blob.equal, Blob.hash, usersPrincipalBlob, newEntry);
                    };
                    case (_){
                        //do nothing
                    }
                };
                return #ok("The deposit was successful.");
            };
        };

    };
 
    private func GetNewSubAccount(dataPerToken:T.CommonDataPerToken):async* TypesIcrc.Subaccount{
        
        //Create new subaccount blob
        var subAccount:Blob = await Random.blob();
                         
        //We need to check if this subAccount already in use. And if yes, then 
        if (StableTrieMap.size(dataPerToken.convertState.temporarySubaccounts) > 0){
            
            let usedSubAccountsIter = StableTrieMap.vals(dataPerToken.convertState.temporarySubaccounts);
            var exist = true;
            while(exist == true){

                var subAccountWasFound = false;
                for(item in usedSubAccountsIter){

                    if (Blob.equal(item.subAccount, subAccount) == true){
                        subAccountWasFound:=true;
                        subAccount:= await Random.blob();
                    }
                };

                if (subAccountWasFound == false){
                    exist := false;
                }
            };            
        };

        return subAccount;
    };


    private func PrepareAndTransferTheIcrc1TokensIntoSwapAppSubAccount(usersPrincipal:Principal, dataPerToken:T.CommonDataPerToken, 
    icrcCanisterId:Text, dip20CanisterId:Text, dip20TransferFee:Nat, swapAppCanisterId:Principal,
    archive:InterfaceHistoryCanister.ArchiveData
    ):async* T.ResponseConversion{

        let usersPrincipalAsText:Text = Principal.toText(usersPrincipal);
        let icrc1Actor:Interfaces.InterfaceICRC1 = actor(icrcCanisterId);
        let encodedPrincipal:T.EncodedPrincipal = Principal.toBlob(usersPrincipal);
        let dip20Actor:Interfaces.InterfaceDip20 = actor(dip20CanisterId);
    


        //---------------------------------------------------------------------------------------------------
        // Deposit state

        //Check if deposit is still on progress

        let depositOnProgressResult = SomeDepositDip20StillOnProgress(usersPrincipal, dataPerToken);
        if (depositOnProgressResult == true){
            return #err("Deposit is still on progress");
        };
        
        StableTrieMap.delete(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, encodedPrincipal); 

        //---------------------------------------------------------------------------------------------------

        //---------------------------------------------------------------------------------------------------
        //Conversion state

        //Check if conversion is taking place
        let conversionStartedStateInfo= GetProgressStartedTime(encodedPrincipal, 
            dataPerToken.convertState.convertInProgress);
        switch(conversionStartedStateInfo){
                case (#ok(startedTime)){

                    let transferToSubAccountState = GetProgressStartedTime(encodedPrincipal, 
                        dataPerToken.convertState.transferToSubaccountStarted);
                        switch(transferToSubAccountState){
                            case (#ok(secondTime)){
                                if ( (secondTime + expirationDuration) > Time.now()){
                                    return #convertionOnProgress("");
                                }
                            };
                            case (_)
                            {
                                //If we are then some further convertion step is on progress...
                                return #convertionOnProgress("");
                            };
                        };
 
                };
                case (_){

                    //do nothing -> we are here if no conversion progress is already ongoing 
                };
        };
        
        //Remove all states (in case deletion of some sub-states went wrong last time)
        RemoveAllConvertionStates(encodedPrincipal,dataPerToken);      
        StableTrieMap.delete(dataPerToken.convertState.temporarySubaccounts,Blob.equal, Blob.hash, encodedPrincipal);
        //---------------------------------------------------------------------------------------------------

        //---------------------------------------------------------------------------------------------------
        // Deposited amount + swapWallet-principal

        var depositAmountToConsider:Nat = 0;
        var realDepositedAmount:Nat = 0;
        var swapWalletPrincipal:Principal = Principal.fromText("aaaaa-aa");
        try{

            let depositedAmountToConsiderResponse = await* GetDip20DepositedAmount(usersPrincipal, dip20CanisterId,dataPerToken.swapInfo, dip20TransferFee);
        
            switch(depositedAmountToConsiderResponse){
                case (#ok(amount)){
                    depositAmountToConsider:=amount.0;
                    realDepositedAmount:=amount.1;
                    swapWalletPrincipal:=amount.2;
                };
                case (#err(text)){
                    return #err(text);
                };
            };

        }
        catch(error){
            return #err("Conversion failed in step 'GetDip20DepositedAmount'. Error-message: "#debug_show(Error.message(error)));
        };
       

        if (realDepositedAmount < dip20TransferFee){
            return #err("Deposited amount is too small for the conversion process.");
        };
        //---------------------------------------------------------------------------------------------------

        //---------------------------------------------------------------------------------------------------
        // Some additional checks


        try
        {
            let balanceOnSwapWallet = await* TokensInfoLib.IcrcGetBalance(icrcCanisterId, usersPrincipalAsText,null);
        
            switch(balanceOnSwapWallet){
                case (#ok(amount)){
                    if (amount < depositAmountToConsider){
                        return #err("Not enough ICRC1 tokens available inside swapApp wallet");
                    };
                };
                case (#err(text)){
                    return #err("Conversion failed in step 'transferIntoSubAccount->IcrcGetBalance for main account'. message: "#debug_show(text));
                };
            };
        }
        catch(error){
            return #err("Conversion failed in step 'transferIntoSubAccount->IcrcGetBalance for main account'. Error-message: "#debug_show(Error.message(error)));
        };

        //---------------------------------------------------------------------------------------------------


        //---------------------------------------------------------------------------------------------------
        //ICRC1 SubAccount

        //Create and add/update new subAccount
        let subAccount:TypesIcrc.Subaccount = await* GetNewSubAccount(dataPerToken);

        //Get the current amount on this SubAccount (Just in case there are tokens in it)
        //And we want to this before setting/chaning the conversion-state, just in case this step will fail
        let optionalSubAccount = Option.make(subAccount);
        var balanceOnSubAccount:Nat = 0;
        try
        {
            let balanceOnSubAccountResponse = await* TokensInfoLib.IcrcGetBalance(icrcCanisterId, usersPrincipalAsText,optionalSubAccount);
        
            switch(balanceOnSubAccountResponse){
                case (#ok(amount)){
                    balanceOnSubAccount:=amount;
                };
                case (_){
                    balanceOnSubAccount:=0;
                };
            };
        }
        catch(error){
            return #err("Conversion failed in step 'transferIntoSubAccount->IcrcGetBalance' on SubAccount. Error-message: "#debug_show(Error.message(error)));
        };
       
        //---------------------------------------------------------------------------------------------------


        //---------------------------------------------------------------------------------------------------
        // Save the new states (with information)


        //Get first the ICRC1 fee, because fee is also part of some statusinfo property-value 
        var icrc1Fee:Nat = 100000;
        
        try
        {
            icrc1Fee:= await icrc1Actor.icrc1_fee();
        }
        catch(error){
            return #err("Conversion failed in step 'transferIntoSubAccount->icrc1_fee'. Error-message: "#debug_show(Error.message(error)));
        };

        //Now save the used subAccount for the current conversion process 
        let subAccountInfo:T.SubAccountInfo = {
            subAccount:Blob = subAccount;
            initialIcrc1BalanceAmount:Nat = balanceOnSubAccount;
            icrc1Fee:Nat = icrc1Fee;
            depositedDip20AmountToConsider:Nat = depositAmountToConsider;
            depositedDip20RealAmount:Nat = realDepositedAmount;
            dip20SwapWallet:Principal = swapWalletPrincipal;
         
            dip20TransferFee:Nat = dip20TransferFee;
            dip20CanisterId:Text = dip20CanisterId;
            conversionId:Blob = await Random.blob();
        };

        StableTrieMap.put(dataPerToken.convertState.temporarySubaccounts,Blob.equal, Blob.hash,encodedPrincipal,subAccountInfo );
        
        StableTrieMap.put(dataPerToken.convertState.convertInProgress, Blob.equal, Blob.hash, encodedPrincipal, Time.now());
        StableTrieMap.put(dataPerToken.convertState.transferToSubaccountStarted, Blob.equal, Blob.hash, encodedPrincipal, Time.now());
        
        //---------------------------------------------------------------------------------------------------


        //---------------------------------------------------------------------------------------------------
        // Save subAccount into archive.
        try{
            await archive.canister.subAccount_Add(subAccount);
        }catch(error){
            //Do nothing in case of error. The used subaccount in the archive is only a nice to have feature.
        };
        //---------------------------------------------------------------------------------------------------


        //---------------------------------------------------------------------------------------------------
        // Save conversion start into archive.
        

        //---------------------------------------------------------------------------------------------------


        //---------------------------------------------------------------------------------------------------
        //Now start the transfer of ICRC1 tokens from swap-app main-wallet to swapApp Subaccount:

        let icrc1AmountPlusFees = depositAmountToConsider + icrc1Fee; 
 
        //transfer the tokens now into subAccount
        let transferArgs:TypesIcrc.TransferArgs = {

            from_subaccount : ?TypesIcrc.Subaccount = null;
            to : TypesIcrc.Account = {
                owner : Principal = swapAppCanisterId;
                subaccount : ?TypesIcrc.Subaccount = Option.make(subAccount);
            };
            amount : TypesIcrc.Balance = icrc1AmountPlusFees;
            fee : ?TypesIcrc.Balance = Option.make(icrc1Fee);
            memo : ?Blob = null;

            /// The time at which the transaction was created.
            /// If this is set, the canister will check for duplicate transactions and reject them.
            created_at_time : ?Nat64 = Option.make(Nat64.fromIntWrap(Time.now()));
        };

     
        try{

            let transferResult = await icrc1Actor.icrc1_transfer(transferArgs);
            var blockIndex:Nat = 0;
            switch(transferResult){
                case (#Ok(txIndex)){              
                blockIndex:=txIndex;
                };
                case (#Err(transferError)){
                     RemoveAllConvertionStates(encodedPrincipal,dataPerToken);
                     StableTrieMap.delete(dataPerToken.convertState.temporarySubaccounts,Blob.equal, Blob.hash, encodedPrincipal);
                    return #err(debug_show(transferError));
                };
            };
        }
        catch(error){

            RemoveAllConvertionStates(encodedPrincipal,dataPerToken);
            StableTrieMap.delete(dataPerToken.convertState.temporarySubaccounts,Blob.equal, Blob.hash, encodedPrincipal);
            return #err("Conversion failed in step 'transferIntoSubAccount->icrc1_transfer'. Error-message: "#debug_show(Error.message(error)));
        };

      
        //---------------------------------------------------------------------------------------------------

        //If we are here then all was ok


        return #ok("Transfer into subAccount was done.");
    };


    private func TransferAndBurnDip20Tokens(accountInfo:T.TransferAndBurnDip20Info, appPrincipal:Principal ):async* Result.Result<Text,Text>{

        if (accountInfo.depositedDip20RealAmount < accountInfo.dip20TransferFee){

            return #ok("Dip20 amount is too small for transfer + burn. Nothing more to do...");
        };

        let dip20Actor:Interfaces.InterfaceDip20 = actor(accountInfo.dip20CanisterId);

        let dip20AmountInSwapWallet = await dip20Actor.balanceOf(accountInfo.dip20SwapWallet);
        if (dip20AmountInSwapWallet < accountInfo.dip20TransferFee){

            return #ok("This step was already done");
        };

        let transferAmount:Nat = accountInfo.depositedDip20RealAmount - accountInfo.dip20TransferFee;

        let transferResponse = await dip20Actor.transferFrom(accountInfo.dip20SwapWallet,appPrincipal,transferAmount);
        switch(transferResponse){
                case (#Ok(index)){
                   
                    //burn

                    //First get the total current amount of Dip20 tokens on AppWallet
                    let dip20AmountInSwapApp = await dip20Actor.balanceOf(appPrincipal);

                    //Now burn:
                    try{
                        let burnResponse = await dip20Actor.burn(dip20AmountInSwapApp);
                        switch(burnResponse){
                            case (#Ok(index)){
                                return #ok("Transfered and burned sucessfully");
                            };
                            case (#Err(errorDescription)){ 
                                return #ok("Burning was not sucessful. But no problem this will be done later automatically on backend timer-tick.");
                            };
                        };
                    }catch(error){
                        return #ok("Burning was not sucessful. But no problem this will be done later automatically on backend timer-tick.");
                    };
                    
                };
                case (#Err(errorDescription)){       
                    return #err(debug_show(errorDescription));
                };
        };
    };


    private func TransferIcrc1ToUserWalletAndBurnOldDip20(usersPrincipal:Principal, dataPerToken:T.CommonDataPerToken,
    icrcCanisterId:Text,appPrincipal:Principal): async* T.ResponseConversion{
         
        let encodedPrincipal:Blob = Principal.toBlob(usersPrincipal);
        let usersPrincipalText = Principal.toText(usersPrincipal);

        let appPrincipalText:Text = Principal.toText(appPrincipal);

        let previousStepWasStarted = IsProgressStateSet(GetProgressStartedTime(encodedPrincipal, 
            dataPerToken.convertState.transferToSubaccountStarted));

        if (previousStepWasStarted == false){
            //Then maybe this second step already started

             let transferToUsersWalletState = GetProgressStartedTime(encodedPrincipal, dataPerToken.convertState.transferFromSubaccountStarted);
                switch(transferToUsersWalletState){
                    case (#ok(time)){
                        if ( (time + expirationDuration) <= Time.now()){
                            //timer expired

                            RemoveAllConvertionStates(encodedPrincipal,dataPerToken);
                            StableTrieMap.delete(dataPerToken.convertState.temporarySubaccounts,Blob.equal, Blob.hash, encodedPrincipal);
                            return #err("Please try again...");
                        };
                    };
                    case (_){
                          RemoveAllConvertionStates(encodedPrincipal,dataPerToken);
                          StableTrieMap.delete(dataPerToken.convertState.temporarySubaccounts,Blob.equal, Blob.hash, encodedPrincipal);
                          return #err("Please try again...");
                    };
                };
        };

        let responseSubAccountInfo = StableTrieMap.get(dataPerToken.convertState.temporarySubaccounts, Blob.equal, Blob.hash, encodedPrincipal);
       
        //Create default item
        var subAccountInfo:T.SubAccountInfo = {
            subAccount:Blob = Principal.toBlob(Principal.fromText("aaaaa-aa"));
            initialIcrc1BalanceAmount:Nat = 0;
            depositedDip20AmountToConsider:Nat = 0;
            depositedDip20RealAmount:Nat = 0;
            dip20SwapWallet:Principal = Principal.fromText("aaaaa-aa");
            icrc1Fee:Nat = 100000;
            dip20TransferFee:Nat = 100000;
            dip20CanisterId:Text = "aaaaa-aa";
            conversionId:Blob = Principal.toBlob(Principal.fromText("aaaaa-aa"));
        };

        switch(responseSubAccountInfo){
            case (?subAccountInfoItem){
                subAccountInfo:=subAccountInfoItem;
            };
            case (_){
                return #err("The Sub account information was not found.");
            };

        };

        //Check if the tokens arrived
        let icrc1Actor:Interfaces.InterfaceICRC1 = actor(icrcCanisterId);
        var balanceOnSubAccount:Nat = 0;

        try{
             let balanceOnSubAccountResponse = await* TokensInfoLib.IcrcGetBalance(icrcCanisterId,appPrincipalText, Option.make(subAccountInfo.subAccount));
       
            switch(balanceOnSubAccountResponse){
                case (#ok(amount)){
                    balanceOnSubAccount:=amount;
                };
                case (_){
                    balanceOnSubAccount:=0;
                };
            };

        } catch(error){

            return #err("Conversion failed in step 'transferToUserWallet->IcrcGetBalance'. Error-message: "#debug_show(Error.message(error)));
        };

        let initialAmount = subAccountInfo.initialIcrc1BalanceAmount;
        if (balanceOnSubAccount <= initialAmount){
            return #err("The icrc1 tokens not arrived on subAccount, yet. Please wait some minutes.");
        };


        //Add new state for this step
        StableTrieMap.put(dataPerToken.convertState.transferFromSubaccountStarted, Blob.equal, Blob.hash, encodedPrincipal, Time.now());

        //Delete previous state
        StableTrieMap.delete(dataPerToken.convertState.transferToSubaccountStarted, Blob.equal, Blob.hash, encodedPrincipal); 


        //--------------------------------------------------------------------------------------
        // Dip20 actions first.
        // If after the DIP20 actions the user still not received ICRC1 tokens we can send the
        // ICRC1 tokens on admin-page manually.


        var transferAndBurnInfo:T.TransferAndBurnDip20Info = {
            depositedDip20AmountToConsider:Nat = subAccountInfo.depositedDip20AmountToConsider;
            depositedDip20RealAmount:Nat = subAccountInfo.depositedDip20RealAmount;
            dip20SwapWallet:Principal = subAccountInfo.dip20SwapWallet;
            dip20TransferFee:Nat = subAccountInfo.dip20TransferFee;
            dip20CanisterId:Text = subAccountInfo.dip20CanisterId;
            conversionId:Blob = subAccountInfo.conversionId;
            createdAt:Time.Time = Time.now();
        };

        let itemTransferAndBurn = StableTrieMap.get(dataPerToken.convertState.transferAndBurnDip20Tokens, Blob.equal, Blob.hash, subAccountInfo.conversionId);
        switch(itemTransferAndBurn){
            case (?itemFound){
                transferAndBurnInfo:=itemFound;
            };
            case (_){
                StableTrieMap.put(dataPerToken.convertState.transferAndBurnDip20Tokens, Blob.equal, Blob.hash, subAccountInfo.conversionId, transferAndBurnInfo);
            };
                
        };

        var burnResultMessage:Text = "";

        let transferAndBurnResult = await* TransferAndBurnDip20Tokens(transferAndBurnInfo, appPrincipal);
        switch(transferAndBurnResult){

            case (#ok(text)){
                burnResultMessage:=text;
                StableTrieMap.delete(dataPerToken.convertState.transferAndBurnDip20Tokens, Blob.equal, Blob.hash, subAccountInfo.conversionId);
            };
            case (#err(text)){
                burnResultMessage:=text;
                return #err("Internal step for transfering old DIP20 tokens not possibe. Message: "#text);
            };
        };
        //--------------------------------------------------------------------------------------

        //Transfer now the tokens from subAccount to users Wallet
        let transferArgs:TypesIcrc.TransferArgs = {

            from_subaccount : ?TypesIcrc.Subaccount = Option.make(subAccountInfo.subAccount);
            to : TypesIcrc.Account = {
                owner : Principal = usersPrincipal;
                subaccount : ?TypesIcrc.Subaccount = null;
            };
            amount : TypesIcrc.Balance = subAccountInfo.depositedDip20AmountToConsider;
            fee : ?TypesIcrc.Balance = Option.make(subAccountInfo.icrc1Fee);
            memo : ?Blob = null;

            /// The time at which the transaction was created.
            /// If this is set, the canister will check for duplicate transactions and reject them.
            created_at_time : ?Nat64 = Option.make(Nat64.fromIntWrap(Time.now()));
        };
 
        try{           
            let transferResult = await icrc1Actor.icrc1_transfer(transferArgs);
            var blockIndex:Nat = 0;
            switch(transferResult){
                case (#Ok(txIndex)){              
                    blockIndex:=txIndex;

                    RemoveAllConvertionStates(encodedPrincipal,dataPerToken);
                    StableTrieMap.delete(dataPerToken.convertState.temporarySubaccounts,Blob.equal, Blob.hash, encodedPrincipal);

                    let swapInfoItemResponse = getUserSwapInfoItem(usersPrincipal, dataPerToken.swapInfo);
                    switch(swapInfoItemResponse){
                        case (#ok(swapInfoItem)){
                            let newSwapInfoItem = { swapInfoItem with depositCount = 0};
                            StableTrieMap.put(dataPerToken.swapInfo.userSwapInfoItems,Blob.equal, 
                                Blob.hash, encodedPrincipal, newSwapInfoItem);

                        };
                        case (#err(text)){
                            //do nothing
                        };

                    };
                };
                case (#Err(transferError)){
                    return #err(debug_show(transferError));
                };
            };
        }catch(error){        
            return #err("Conversion failed in step 'transferToUserWallet->icrc1_transfer'. Error-message: "#debug_show(Error.message(error)));
        };
    
        return #ok("The transfer of ICRC1 tokens from subAccount into users-wallet was started.");
    };
  

    //This method is called when initiated by the user from the front-end
    public func ConvertOldDip20Tokens(userId:Blob, dataPerToken:T.CommonDataPerToken,dip20CanisterId:Text, 
        dip20TransferFee:Nat, icrcCanisterId:Text,appPrincipal:Principal)
    : async*  Result.Result<Text, Text>{

        //get principal from blob
        let getPrincipalResponse = GetPrincipalFromBlob(userId,dataPerToken.swapInfo);
        var usersPrincipal:Principal = Principal.fromText("aaaaa-aa");
        
        switch(getPrincipalResponse){
            case (#ok(principalFound)){
                usersPrincipal:=principalFound;
            };
            case (_){
                return #err("Error. Probably the deposit amount is empty.");
            };
        };

        let encodedPrincipal:Blob = Principal.toBlob(usersPrincipal);
        let secondStepAlreadyStarted = IsProgressStateSet(GetProgressStartedTime(encodedPrincipal, 
            dataPerToken.convertState.transferFromSubaccountStarted));

        var response:T.ResponseConversion = #err("hello");

        //Step 1
        if (secondStepAlreadyStarted == false){
            
            response := await* PrepareAndTransferTheIcrc1TokensIntoSwapAppSubAccount(usersPrincipal, dataPerToken, icrcCanisterId,
            dip20CanisterId,dip20TransferFee, appPrincipal);
            var result = ResponseConversion(response);
            if (result.0 == false){
                return result.1;
            };
        };

        //Step 2
        response := await* TransferIcrc1ToUserWalletAndBurnOldDip20(usersPrincipal, dataPerToken, 
        icrcCanisterId, appPrincipal);
        let result = ResponseConversion(response);
        if (result.0 == false){
            return result.1;
        } else{
            return #ok("Token conversion is done.");
        };
    };

    private func ResponseConversion(response:T.ResponseConversion): (Bool, Result.Result<Text,Text>){
        switch(response){
            case (#ok(text)){
                return (true,#ok(text));
            };
            case (#err(text)){
                return (false, #err(text));
            };
            case (#depositOnProgress(text)){
                return (false,#err("Deposit still progressing: " # text));
            };
            case (#convertionOnProgress(text)){
                return (false,#err("Conversion still progressing: " # text));
            };
            case (#maxRetriesOccured(number)){
                return (false,#err("Maximum number of retries achieved."));
            };
        };
    };


    private func GetPrincipalFromBlob(userId:Blob, 
    usersSwapInfo:T.UsersSwapInfo): Result.Result<Principal, Text>{

        let item = StableTrieMap.get(usersSwapInfo.principalMappings, Blob.equal, Blob.hash, userId);
        switch(item){
            case (?principalFound){
                return #ok(principalFound);
            };
            case (_){
                return #err("not found");
            }
        };
    };

    public func GetUserId(principal: Principal,
    usersSwapInfo:T.UsersSwapInfo ):  Result.Result<Blob, Text>{


        let userInfo = getUserSwapInfoItem(principal, usersSwapInfo);
        switch(userInfo){
            case (#ok(userInfoData)){
                let userId = userInfoData.userId;
                return #ok(userId);
            };
            case (_){
                return #err("not found");
            };

        };
    };

    public func BlobToText(blob:Blob): Text{

        var result:Text = "";
        let hexNumbers = ["0","1","2", "3", "4", "5","6","7","8","9","a","b","c","d","e", "f"];

        for (byte : Nat8 in blob.vals()) { // iterate over the Blob
              let firstNumber:Nat8 = byte % 16;
              let secondNumber:Nat8 = (byte - firstNumber) / 16;
              let index1:Nat = Nat8.toNat(firstNumber);
              let index2:Nat = Nat8.toNat(secondNumber);
              let addString:Text = hexNumbers[index1]#hexNumbers[index2];
              result:=addString#result;
        };

        return result;

    };
 
};