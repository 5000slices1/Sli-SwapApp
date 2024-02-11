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

module {

    public func UserIsOwnerOrAdmin(appSettings : T.AppSettings, principal : Principal) : Bool {

        let userRole = GetUserRole(appSettings, principal);
        if (userRole == #Owner or userRole == #Admin) {
            return true;
        };

        return false;
    };

    public func GetUserRole(appSettings : T.AppSettings, principal : Principal) : T.UserRole {

        if (Principal.isAnonymous(principal)) {
            return #Anonymous;
        };

        if (principal == appSettings.SwapAppCreator) {
            return #Owner;
        };

        let principalText = Principal.toText(principal);
        if (
            List.size<Text>(appSettings.SwapAppAdmins) > 0 and List.some<Text>(appSettings.SwapAppAdmins, func(n) { n == principalText })
        ) {
            return #Admin;
        };

        return #NormalUser;
    };

};
