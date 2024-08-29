import icrc1 "InterfaceICRC1";
import swapApp "InterfaceSwapApp";
import InterfaceIcrc1 "InterfaceICRC1";
import InterfaceDip20 "InterfaceDip20";
import InterfaceHistoryCanister "InterfaceHistoryCanister";
import TrabyterTokenInterface "InterfaceTrabyter";

module {

    public type InterfaceIcrc = icrc1.TokenInterface;
    public type InterfaceSwapApp = swapApp.SliSwapAppInterface;
    public type InterfaceICRC1 = InterfaceIcrc1.TokenInterface;
    public type InterfaceDip20 = InterfaceDip20.InterfaceDip20;
    public type InterfaceArchive = InterfaceHistoryCanister.InterfaceArchive;
    public type InterfaceTrabyter = TrabyterTokenInterface.TrabyterTokenInterface;
};
