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
import Interfaces "../Interfaces/Interfaces";
import TypesIcrc "../Types/TypesICRC1";
import Dip20Types "../Types/TypesDip20";
import CommonLib "CommonLib";
import StableTrieMap "mo:StableTrieMap";



module{

    //type STM = StableTrieMap;


    public func getSwapWallet(caller:Principal,
        usersSwapInfo:T.UsersSwapInfo):T.ResponseGetUsersSwapWallet
    {
        if (Principal.isAnonymous(caller)){
            return #Err("Call by Anonymous principal not allowed.");
        };
        return getSwapWalletFromUserPrincipal(caller, usersSwapInfo);
    };

    public func AddUserSwapInfo(caller:Principal, 
        usersSwapInfo:T.UsersSwapInfo, approvedWallets:T.ApprovedWallets ){
            
            // if (List.List.size(approvedWallets.approvedWalletsFree) <=0){


            // };

            let popResult = List.pop(approvedWallets.approvedWalletsFree);
            let wallet = Option.get(popResult.0, Principal.fromText("aaaaa-aa"));
            //TODO: check if wallet is default-wallet or not

            approvedWallets.approvedWalletsFree:= popResult.1;

            let newItem:T.UserSwapInfoItem = {
                swapWallet:Principal = wallet;
                var depositActionStatus:T.SwapActionStatus = #Idle(Time.now());
                var conversionActionStatus:T.SwapActionStatus= #Idle(Time.now());
            };

            let principalBlob:Blob = Principal.toBlob(caller);
            StableTrieMap.put(usersSwapInfo.items, Blob.equal, Blob.hash, principalBlob, newItem);

    };


    // public func getSwapWallet(caller:Principal,
    // usersSwapInfo:T.UsersSwapInfo, sliApprovedWallets:T.ApprovedWallets ):async* Result.Result<Principal, Text>
    // {
    //     if (Principal.isAnonymous(caller)){
    //         return #err("Call by Anonymous principal not allowed.");
    //     };
    //     GetApprovedWalletFromForPrincipal(caller, )

    //     return #err("hello");
    // };


    private func getSwapWalletFromUserPrincipal(principal: Principal,
    usersSwapInfo:T.UsersSwapInfo ): T.ResponseGetUsersSwapWallet {
              
        let principalBlob:Blob = Principal.toBlob(principal);

        let item = StableTrieMap.get(usersSwapInfo.items, Blob.equal, Blob.hash, principalBlob);
        switch(item) {
            case(?item) { 
                    return #Ok(item.swapWallet);                  
                };
            case(_) { return #NotExist; };
        };       
    };
};