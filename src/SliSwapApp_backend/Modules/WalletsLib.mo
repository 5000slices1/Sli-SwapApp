import T "../Types/TypesCommon";
import Principal "mo:base/Principal";
import List "mo:base/List";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Interfaces "../Interfaces/Interfaces";
import TypesIcrc "../Types/TypesICRC1";
import Dip20Types "../Types/TypesDip20";
import CommonLib "CommonLib";
 
module{

   public func AddNewApprovedWallet(caller : Principal,appSettings : T.AppSettings,
    approvedWallets:T.ApprovedWallets,
    principal:Principal):async* Result.Result<Text, Text> {

        let userIsAdminOrOwner = await* CommonLib.UserIsOwnerOrAdmin(appSettings, caller);

        if (userIsAdminOrOwner != true) {
            return #err("Only canister owner or admins can call this method");
        };

        let walletPrincipal = Principal.toText(principal);

        func listFindFunc(x : Principal) : Bool {x  == principal;};

        if (List.size(approvedWallets.approvedWalletsFree) > 0){

            let containsInFreeList = List.some<Principal>(approvedWallets.approvedWalletsFree,
            listFindFunc);

            if (containsInFreeList == true){
                return #err("This wallet" #walletPrincipal #" exist already.");
            };

            let containsInUseList = List.some<Principal>(approvedWallets.approvedWalletsInUse,
            listFindFunc);
            
            if (containsInUseList == true){
                return #err("This wallet" #walletPrincipal #" is already in use.");
            };          
        };

        approvedWallets.approvedWalletsFree := List.push(principal, approvedWallets.approvedWalletsFree);

        return #ok("The approved wallet " #walletPrincipal #" was added.");
    };


    public func GetNumberOfApprovedWallets(approvedWallets:T.ApprovedWallets):(Nat,Nat){  
        let numberOfFreeWallets = List.size(approvedWallets.approvedWalletsFree);
        let numberOfUsedWallets = List.size(approvedWallets.approvedWalletsInUse);
        return (numberOfFreeWallets,numberOfUsedWallets );
    };


    public func ApprovedWalletsPrincipalExist(principal:Principal, 
    approvedWalletsSli:T.ApprovedWallets, approvedWalletsGlds:T.ApprovedWallets):Bool{
        
        func ExistInWallet(list:List.List<Principal>):Bool  {
            if (List.size(list) <= 0){
                return false;
            };

            func listFindFunc(x : Principal) : Bool {x  == principal;};

            if (List.some<Principal>(list,listFindFunc) == true){
                return true;
            };

            return false;
        };
        
        if (ExistInWallet(approvedWalletsSli.approvedWalletsFree) == true){
            return true;
        };

        if (ExistInWallet(approvedWalletsSli.approvedWalletsInUse) == true){
            return true;
        };

        if (ExistInWallet(approvedWalletsGlds.approvedWalletsFree) == true){
            return true;
        };

        if (ExistInWallet(approvedWalletsGlds.approvedWalletsInUse) == true){
            return true;
        };

        return false;

    };
};