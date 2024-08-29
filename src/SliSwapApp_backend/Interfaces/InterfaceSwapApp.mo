import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";
import Result "mo:base/Result";
import List "mo:base/List";
import Text "mo:base/Text";
import T "../Types/TypesCommon";
import Icrc2Interface "InterfaceICRC2";
 
module {

    public type SliSwapAppInterface = actor {
        GetUserRole : shared query () -> async T.UserRole;
        GetSwapAppPrincipalText : shared query () -> async Text;

        SliIcrc1_SetCanisterId : shared (canisterId : Principal) -> async Result.Result<Text, Text>;
        GldsIcrc1_SetCanisterId : shared (canisterId : Principal) -> async Result.Result<Text, Text>;

        SliIcrc1_GetCanisterId : shared query () -> async Text;
        GldsIcrc1_GetCanisterId : shared query () -> async Text;

        AddAdminUser : shared (principal : Principal) -> async Result.Result<Text, Text>;
        RemoveAdminUser : shared (principal : Principal) -> async Result.Result<Text, Text>;
        GetListOfAdminUsers : shared query () -> async [Text];

        add_burning_allowances(): async Result.Result<[Icrc2Interface.ApproveResult],Text>;
    };
 
};
