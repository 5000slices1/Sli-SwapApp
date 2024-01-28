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

    private func CheckAndSetDepositSliDip20StartedState(principal:Principal, 
    depositState:T.DepositState):async Result.Result<Text,Text>{


        let principalBlob = Principal.toBlob(principal);
        let depositStateTime = StableTrieMap.get(depositState.sliDepositInProgress, Blob.equal, Blob.hash, principalBlob);

        switch(depositStateTime){
            case (?lastDepositTime){
                       
                if (lastDepositTime + expirationDuration > Time.now()){     
                    
                    return #err("Deposit is still ongoing.");      
                                               
                }
                else{
                    StableTrieMap.delete(depositState.sliDepositInProgress, Blob.equal, Blob.hash, principalBlob);
                    StableTrieMap.put(depositState.sliDepositInProgress, Blob.equal, Blob.hash, principalBlob, Time.now());
                    return #ok("The state was set.");
                };
            };
            case (_) {
                StableTrieMap.put(depositState.sliDepositInProgress, Blob.equal, Blob.hash, principalBlob, Time.now());
                return #ok("The state was set.");
            };
        };
    };

    private func CheckAndSetDepositGldsDip20StartedState(principal:Principal, 
    depositState:T.DepositState):async Result.Result<Text,Text>{

        let principalBlob = Principal.toBlob(principal);
        let depositStateTime = StableTrieMap.get(depositState.gldsDepositInProgress, Blob.equal, Blob.hash, principalBlob);

        switch(depositStateTime){
            case (?lastDepositTime){

                 if (lastDepositTime + expirationDuration > Time.now()){
                    return #err("Deposit is still ongoing.");
                }
                else{
                    StableTrieMap.delete(depositState.gldsDepositInProgress, Blob.equal, Blob.hash, principalBlob);
                    StableTrieMap.put(depositState.gldsDepositInProgress, Blob.equal, Blob.hash, principalBlob, Time.now());
                    return #ok("The state was set.");
                };
            };
            case (_) {
                StableTrieMap.put(depositState.gldsDepositInProgress, Blob.equal, Blob.hash, principalBlob, Time.now());
                return #ok("The state was set.");
            };
        };
    };


    public func CanUserDepositSliDip20(principal:Principal, depositState:T.DepositState): Bool{
        let principalBlob = Principal.toBlob(principal);
        let depositStateTime = StableTrieMap.get(depositState.sliDepositInProgress, Blob.equal, Blob.hash, principalBlob);

        switch(depositStateTime){
            case (?lastDepositTime){                      
                if (lastDepositTime + expirationDuration > Time.now()){     
                    return false;                         
                }
                else{
                    return true;
                };
            };
            case (_) {
                return true;
            };
        };
    };

    public func CanUserDepositGldsDip20(principal:Principal, depositState:T.DepositState): Bool{
        let principalBlob = Principal.toBlob(principal);
        let depositStateTime = StableTrieMap.get(depositState.gldsDepositInProgress, Blob.equal, Blob.hash, principalBlob);

        switch(depositStateTime){
            case (?lastDepositTime){
                let duration:Int = 900000000000; // 15 minutes                        
                if (lastDepositTime + duration > Time.now()){     
                    return false;                         
                }
                else{
                    return true;
                };
            };
            case (_) {
                return true;
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


    public func DepositDip20Tokens(callerPrincipal:Principal, usersPrincipal:Principal, dip20CanisterId:Text, swapAppPrincipal:Principal, 
    usersSwapInfo:T.UsersSwapInfo, approvedWallets:T.ApprovedWallets ,
    depositState:T.DepositState , amount:Nat, fee:Nat, tokenType:T.SpecificTokenType):async Result.Result<Text,Text>{

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
        var depositStateResponse:Result.Result<Text,Text> = #err("nothing");

        switch(tokenType){
            case (#Dip20Sli){
                depositStateResponse:=await CheckAndSetDepositSliDip20StartedState(usersPrincipal, depositState);
            };
            case (#Dip20Glds){
                depositStateResponse:=await CheckAndSetDepositGldsDip20StartedState(usersPrincipal, depositState);
            };
            case (_)  { 
                return #err("Only DIP20 tokens are supported for deposit.")
            };
        };

        switch(depositStateResponse){
            case (#ok(okText)){
                //do nothing
            };
            case (#err(message)){
                return depositStateResponse;
            };
        };


        //Get the swapWallet-Principal, where the tokens should transfered to.
        let swapWalletResponse = getSwapWallet(usersPrincipal, usersSwapInfo);
        var swapWalletPrincipal:Principal = Principal.fromText("aaaaa-aa");
        switch(swapWalletResponse){
            case (#Ok(swapWallet)){
                swapWalletPrincipal :=swapWallet;
            };
            case (#Err(text)){
                return #err(text);
            };
            case (#NotExist){
                if (List.size(approvedWallets.approvedWalletsFree) <=0){
                    return #err("No free sli-swap-wallet available. Please inform our Team about this issue. Thanks!");
                };

                //Now we need to get the swap-wallet:
                let popResult = List.pop(approvedWallets.approvedWalletsFree);
                approvedWallets.approvedWalletsFree:=popResult.1;
                var swapWalletPrincipal:Principal = Principal.fromText("aaaaa-aa"); // Default principal

                switch(popResult.0){
                    case (?swapWalletPrincipalResult)
                    {
                        swapWalletPrincipal:=swapWalletPrincipalResult;
                    };
                    case (_){
                        return #err("The asigned sli-swap-wallet cannot be used");
                    };
                };

                //Create new user id
                let newUserId:Blob = await Random.blob();

                //Add new entries for the user
                let newEntry:T.UserSwapInfoItem = {
                    swapWallet = swapWalletPrincipal;
                    depositCount = 0;
                };
                StableTrieMap.put(usersSwapInfo.userSwapInfoItems, Blob.equal, Blob.hash, usersPrincipalBlob, newEntry);
                StableTrieMap.put(usersSwapInfo.principalMappings, Blob.equal, Blob.hash, newUserId, usersPrincipal);
            };
        };

        //Now do the transfer:
        //let transferResult = await actorDip20.transfer(swapWalletPrincipal, amount);
        var transferResult:TypesDip20.TxReceipt = #Ok(0);

        try{

            transferResult := await actorDip20.transferFrom(usersPrincipal, swapWalletPrincipal, amount);
        }
        catch(error)
        {
            
        };
       
        //Remove the depositing state
        StableTrieMap.delete(depositState.sliDepositInProgress, Blob.equal, Blob.hash, usersPrincipalBlob);

        switch (transferResult) {
            case (#Err (e)) {               
                return #err(debug_show(e));
               
            };
            case (_) {

                let itemToChange = StableTrieMap.get(usersSwapInfo.userSwapInfoItems, Blob.equal, Blob.hash, usersPrincipalBlob);
                switch(itemToChange){
                    case (?userSwapInfo){
                        let currentDepositCount = userSwapInfo.depositCount;
                        let newEntry:T.UserSwapInfoItem = {
                            swapWallet = swapWalletPrincipal;
                            depositCount = currentDepositCount +1;                       
                        };
                        ignore StableTrieMap.replace(usersSwapInfo.userSwapInfoItems, Blob.equal, Blob.hash, usersPrincipalBlob, newEntry);
                    };
                    case (_){
                        //do nothing
                    }
                };
                return #ok("The deposit was successful.");
            };
        };

    };
};