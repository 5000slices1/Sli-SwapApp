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

module {

    public func AddAdminUser(caller : Principal, appSettings : T.AppSettings, principal : Text) : async* Result.Result<Text, Text> {

        if (caller != appSettings.SwapAppCreator) {
            return #err("Only owner of SwapApp can add admin user");
        };
        let realPrincipal = Principal.fromText(principal);

        let userIsAlreadyAdminOrOwner = CommonLib.UserIsOwnerOrAdmin(appSettings, realPrincipal);
        if (userIsAlreadyAdminOrOwner == false) {
            appSettings.SwapAppAdmins := List.push<Text>(principal, appSettings.SwapAppAdmins);
            return #ok("Principal was added as admin user.");
        };

        return #ok("Is already admin user or owner.");
    };

    public func RemoveAdminUser(caller : Principal, appSettings : T.AppSettings, principal : Text) : async* Result.Result<Text, Text> {

        if (caller != appSettings.SwapAppCreator) {
            return #err("Only owner of SwapApp can remove admin user");
        };
        let realPrincipal = Principal.fromText(principal);

        let userIsAlreadyAdminOrOwner = CommonLib.UserIsOwnerOrAdmin(appSettings, realPrincipal);
        if (userIsAlreadyAdminOrOwner == true) {
            appSettings.SwapAppAdmins := List.filter<Text>(appSettings.SwapAppAdmins, func n { n != principal });
            return #ok("Principal is no longer an admin user.");
        };

        return #ok("Principal was not in the admin list.");
    };

    public func GetListOfAdminUsers(appSettings : T.AppSettings) : [Text] {
        return List.toArray<Text>(appSettings.SwapAppAdmins);
    };

};
