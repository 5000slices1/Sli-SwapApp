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


module{

    let expirationDuration:Int = 900000000000; // 15 minutes  
   
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

    // private func IsSomeConversionStillOnProgress(encodedPrincipal:Blob, dataPerToken:T.CommonDataPerToken){
    //     var result = GetProgressStartedTime(encodedPrincipal, dataPerToken.convertState.convertInProgress);


    // };

    private func CheckAndSetDepositDip20StartedState(principal:Principal, 
    dataPerToken:T.CommonDataPerToken):async Result.Result<Text,Text>{


        let principalBlob = Principal.toBlob(principal);
        let depositStateTime = StableTrieMap.get(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, principalBlob);

        switch(depositStateTime){
            case (?lastDepositTime){
                       
                if (lastDepositTime + expirationDuration > Time.now()){     
                    
                    return #err("Deposit is still ongoing.");      
                                               
                }
                else{
                    StableTrieMap.delete(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, principalBlob);
                    StableTrieMap.put(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, principalBlob, Time.now());
                    return #ok("The state was set.");
                };
            };
            case (_) {
                StableTrieMap.put(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, principalBlob, Time.now());
                return #ok("The state was set.");
            };
        };
    };
 
    public func CanUserDepositDip20(principal:Principal, dataPerToken:T.CommonDataPerToken): Bool{

        let principalBlob = Principal.toBlob(principal);
        let depositStateTime = StableTrieMap.get(dataPerToken.depositState.depositInProgress, Blob.equal, Blob.hash, principalBlob);

        switch(depositStateTime){
            case (?lastDepositTime){                      
                if (lastDepositTime + expirationDuration > Time.now()){     
                    return false;                         
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
                    return false;
                };
                return true;
            };
            case (#Ok(principalValue)){
                return true;
            };
            case (#Err(text)){
                return false;
            };
        };
    };

    public func GetDip20DepositedAmount(usersPrincipal:Principal, 
    dip20CanisterId:Text,usersSwapInfo:T.UsersSwapInfo, transferFee:Nat) : async Result.Result<Nat, Text>{

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
        var depositedAmount = await actorDip20.balanceOf(swapWalletPrincipal);
        depositedAmount:= depositedAmount + ( depositCount * (transferFee * 2));
        return #ok(depositedAmount);
    };
  
    public func DepositDip20Tokens(usersPrincipal:Principal, 
    dip20CanisterId:Text, swapAppPrincipal:Principal, dataPerToken:T.CommonDataPerToken, 
    amount:Nat, fee:Nat):async Result.Result<Text,Text>{

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
            //let text = "Your balance is not enough."# "userBalance:" # debug_show(userBalance)# " allowanceAmountResult:" # debug_show(allowanceAmount);
            return #err("Approval amount is not enough.");
            //return #err(text);
        };

        //Check if the deposit was already started, and if not then the start state is set automatically
        var depositStateResponse:Result.Result<Text,Text> = 
            await CheckAndSetDepositDip20StartedState(usersPrincipal,dataPerToken);

        switch(depositStateResponse){
            case (#ok(okText)){
                //do nothing
            };
            case (#err(message)){
                return depositStateResponse;
            };
        };


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

                    if (Blob.equal(item, subAccount) == true){
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
    icrcCanisterId:Text):async* Result.Result<Text,Text>{

        let usersPrincipalAsText:Text = Principal.toText(usersPrincipal);
        let icrc1Actor:Interfaces.InterfaceICRC1 = actor(icrcCanisterId);
        let encodedPrincipal:T.EncodedPrincipal = Principal.toBlob(usersPrincipal);

        let conversionIsStillonProgress = IsProgressStateSet(GetProgressStartedTime(encodedPrincipal, 
            dataPerToken.convertState.convertInProgress));

        if (conversionIsStillonProgress == true){
            return #err("Conversion is still on progress");
        };

        //Create and add/update new subAccount
        
        let subAccount:TypesIcrc.Subaccount = await* GetNewSubAccount(dataPerToken);
        
        //Get the current amount on this SubAccount (Just in case there are tokens in it)
        //And we want to this before setting/chaning the conversion-state, just in case this step will fail
        let optionalSubAccount = Option.make(subAccount);
        let balanceOnSubAccountResponse = await TokensInfoLib.IcrcGetBalance(icrcCanisterId, usersPrincipalAsText,optionalSubAccount);
        var balanceOnSubAccount:Nat = 0;
        switch(balanceOnSubAccountResponse){
            case (#ok(amount)){
                balanceOnSubAccount:=amount;
            };
            case (_){
                balanceOnSubAccount:=0;
            };
        };

        //Now save the used subAccount for the current conversion process 
        StableTrieMap.put(dataPerToken.convertState.temporarySubaccounts,Blob.equal, Blob.hash,encodedPrincipal,subAccount );
        
        //Set the two conversion-states
        StableTrieMap.put(dataPerToken.convertState.convertInProgress, Blob.equal, Blob.hash, encodedPrincipal, Time.now());
        StableTrieMap.put(dataPerToken.convertState.transferToSubaccountStarted, Blob.equal, Blob.hash, encodedPrincipal, Time.now());
        
   


        return #ok("blabla");
    };

    public func ConvertOldDip20Tokens(userId:Blob, dataPerToken:T.CommonDataPerToken,dip20CanisterId:Text, 
        dip20TransferFee:Nat, icrcCanisterId:Text,appPrincipal:Principal)
    : async  Result.Result<Text, Text>{
        

        let icrc1Actor:Interfaces.InterfaceICRC1 = actor(icrcCanisterId);
        let dip20Actor:Interfaces.InterfaceDip20 = actor(dip20CanisterId);


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

        //Check if deposit action is not currently taking place and that enough free swap-wallets are available
        if (CanUserDepositDip20(usersPrincipal,dataPerToken) == false){
                    return #err("Conversion is currently not possible.");
        };
                       
        //Get the deposit-count
        let userInfo = getUserSwapInfoItem(usersPrincipal,dataPerToken.swapInfo );
        var depositCount = 0;
        var swapWallet:Principal =  Principal.fromText("aaaaa-aa");
        switch(userInfo){
            case (#ok(foundUserInfo)){
                depositCount:=foundUserInfo.depositCount;
                swapWallet:=foundUserInfo.swapWallet;
            };
            case (_){
                return #err("No deposit information found");
            };
        };

        let depositedAmountResponse = await GetDip20DepositedAmount(usersPrincipal, dip20CanisterId,
        dataPerToken.swapInfo, dip20TransferFee);
        var depositedAmount:Nat = 0;

        switch(depositedAmountResponse){
            case (#ok(amount)){
                depositedAmount :=amount;
            };
            case (_){
                return #err("No deposit information found");
            };
        };




        //Get real depositedAmount
        let realDepositedAmount:Nat =  await dip20Actor.balanceOf(swapWallet);

        //Get the ICRC1 fee
        let icrc1Fee:Nat = await icrc1Actor.icrc1_fee();
 
        //transfer the tokens now
        let transferArgs:TypesIcrc.TransferArgs = {

            from_subaccount : ?TypesIcrc.Subaccount = null;
            to : TypesIcrc.Account = {
                owner : Principal = usersPrincipal;
                subaccount : ?TypesIcrc.Subaccount = null;
            };
            amount : TypesIcrc.Balance = depositedAmount;
            fee : ?TypesIcrc.Balance = null;
            memo : ?Blob = null;

            /// The time at which the transaction was created.
            /// If this is set, the canister will check for duplicate transactions and reject them.
            created_at_time : ?Nat64 = Option.make(Nat64.fromIntWrap(Time.now()));
        };

     
        let transferResult = await icrc1Actor.icrc1_transfer(transferArgs);
        var blockIndex:Nat = 0;
        switch(transferResult){
            case (#Ok(txIndex)){              
              blockIndex:=txIndex;
            };
            case (#Err(transferError)){
                return #err(debug_show(transferError));
            };
        };


        //Set deposit-count now to 0
        let principalBlob:Blob = Principal.toBlob(usersPrincipal);
        let item = StableTrieMap.get(dataPerToken.swapInfo.userSwapInfoItems, Blob.equal, Blob.hash, principalBlob);
        switch(item) {
            case(?userSwapInfoItem) { 
                    let newEntry:T.UserSwapInfoItem = {                        
                        swapWallet:Principal = userSwapInfoItem.swapWallet;                        
                        depositCount:Nat = 0;                        
                        userId:Blob = userSwapInfoItem.userId;
                    };
                    ignore StableTrieMap.replace(dataPerToken.swapInfo.userSwapInfoItems, Blob.equal, Blob.hash, principalBlob, newEntry);                    
                };
            case(_) { //do nothing
             };
        };   


                
        //Transfer the old dip20 token to main app wallet
        
        //Get allowance value
        //let allowanceResponse = await dip20Actor.allowance(swapWallet,appPrincipal);
        
        // amount-fee
        
       
        if ( realDepositedAmount < dip20TransferFee)
        {
            return #ok("Conversion was succesfull");
        }
        else
        {

            let secondTransferAmount:Nat = realDepositedAmount - dip20TransferFee;
            

            let secondTransferResponse = await dip20Actor.transferFrom(swapWallet,appPrincipal,
            secondTransferAmount );
            switch(secondTransferResponse){
                    case (#Ok(index)){
                        //do nothing
                    };
                    case (#Err(errorDescription)){
                        //TODO: we should mark this, so that re-convert is not possible.
                        return #err(debug_show(errorDescription));
                    };
            };


            //Now burn the old Dip20 tokens

            //First get the current amount of Dip20
            let dip20AmountInSwapApp = await dip20Actor.balanceOf(appPrincipal);

            //Now burn:
            let burnResponse = await dip20Actor.burn(dip20AmountInSwapApp);
            switch(burnResponse){
                case (#Ok(index)){
                    return #ok("Conversion was succesfull");
                };
                case (#Err(errorDescription)){ 
                    return #err("Burning was not sucessful");
                }
            }
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
 
};