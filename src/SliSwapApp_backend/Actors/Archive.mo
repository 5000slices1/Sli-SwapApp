import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Region "mo:base/Region";
import Prim "mo:prim";
import Option "mo:base/Option";
import Bool "mo:base/Bool";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Result "mo:base/Result";
import Cycles "mo:base/ExperimentalCycles";
//import ExperimentalStableMemory "mo:base/ExperimentalStableMemory";
import List "mo:base/List";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Random "mo:base/Random";
import Interfaces "../Interfaces/Interfaces";
import TypesDip20 "../Types/TypesDip20";
import TypesArchive "../Types/TypesArchive";
import TypesCommon "../Types/TypesCommon";
import StableTrieMap "mo:StableTrieMap";


shared ({ caller = swapApp_canisterId }) actor class Archive() : async Interfaces.InterfaceArchive= this{


  stable var swapAppCanisterId:Principal = Principal.fromText("aaaaa-aa");
  stable var swapAppCanisterIdWasSet:Bool = false;

  // Index of saved log entry.
  public type Index = Nat64;
  let elem_size = 16 : Nat64; /* two Nat64s, for pos and size. */

  private func getNewHistoryItem():TypesArchive.ArchiveItem{
    let result:TypesArchive.ArchiveItem = {
        bytes = Region.new();
        var bytes_count : Nat64 = 0;
        elems = Region.new ();
        var elems_count : Nat64 = 0;
    };
    return result;
  };

  stable var entries = {
    var usedSubAccounts:List.List<TypesArchive.UsedSubAccount> = List.nil<TypesArchive.UsedSubAccount>();

    deposits:TypesArchive.ArchiveItem = getNewHistoryItem();
    deposits_Indizes:StableTrieMap.StableTrieMap<TypesCommon.EncodedPrincipal, List.List<Nat64>> = StableTrieMap.new();
    //usedSubAccounts:HistoryItem = getNewHistoryItem();
  };


  public shared func setSwapAppCanisterId(principal:Principal):async Result.Result<Text,Text>{
    
    if (swapAppCanisterIdWasSet == true){
      return #err("Was already set.");
    };
    swapAppCanisterId:=principal;
    swapAppCanisterIdWasSet:=true;
    return #ok("The swapApp canister Id was set");
  };

  public shared query func getArchiveCanisterId():async Principal{
    return Principal.fromActor(this);
  };

  //--------------------------------------------------------------------
  //History of SubAccount
  public shared ({ caller }) func subAccount_Add(subAccount:Blob):async (){
    if (caller != swapAppCanisterId){
      return;
    };

    let newEntry:TypesArchive.UsedSubAccount = {
      subAccount:Blob = subAccount;
      createdAt:Time.Time = Time.now();
    };
    entries.usedSubAccounts:=List.push(newEntry, entries.usedSubAccounts);
  };

  public shared  ({ caller }) func subAccount_Delete(subAccount:Blob):async (){
     if (caller != swapAppCanisterId){
      return;
    };
    entries.usedSubAccounts:= List.filter<TypesArchive.UsedSubAccount>(entries.usedSubAccounts, func n {Blob.equal(subAccount, n.subAccount) == false });
  };

  public shared query func subAccount_Count():async Nat{
    return List.size(entries.usedSubAccounts);
  };

  public shared query func subAccount_GetItems(from:Nat, count:Nat): async [TypesArchive.UsedSubAccount]{
    let length =  List.size(entries.usedSubAccounts);
    if (from >=length ){
      return [];
    };

    var lastIndex:Nat = from + count;
    lastIndex := Nat.min(lastIndex, length);
  
    var resultAsList:List.List<TypesArchive.UsedSubAccount> = List.nil<TypesArchive.UsedSubAccount>();
    for (index in Iter.range(from, lastIndex)) {
      let itemOrNull = List.get(entries.usedSubAccounts, index);
      switch(itemOrNull){
        case (?item){
          resultAsList:= List.push(item, resultAsList);
        };
        case (_){
          // do nothing
        };

      };
    };

    //Reverse the list
    resultAsList:= List.reverse(resultAsList);
    let returnResult = List.toArray(resultAsList);
    return returnResult;
  };
  //--------------------------------------------------------------------


  //--------------------------------------------------------------------
  // History of deposits
 
  public shared query func deposit_Total_Count():async Nat64{
    return getSize(entries.deposits);
  };

  public shared query func deposit_FromPrincipal_Count(principal:Principal):async Nat64{

    let encodedPrincipal = Principal.toBlob(principal);
    let currentIndizesOrNull =  StableTrieMap.get(entries.deposits_Indizes,Blob.equal, Blob.hash, encodedPrincipal);
    switch(currentIndizesOrNull){
        case (?indizesListItem){
          return Nat64.fromNat(List.size<Nat64>(indizesListItem));
        };
        case (_){
          return 0;
        };
    };
  };

  public shared query func deposit_Indizes_For_Principal(principal:Principal):async Result.Result<[Nat64], Text>{

    let encodedPrincipal = Principal.toBlob(principal);
    let currentIndizesOrNull =  StableTrieMap.get(entries.deposits_Indizes,Blob.equal, Blob.hash, encodedPrincipal);
        switch(currentIndizesOrNull){
            case (?indizesListItem){
              return #ok(List.toArray<Nat64>(indizesListItem));
            };
            case (_){
              return #err("not found");
            };
        };
  };

  public shared query func deposit_Get_Item_By_Index(index:Nat64):async Result.Result<TypesArchive.ArchivedDeposit, Text>{

      let blob:Blob = getBlobByIndex(entries.deposits, index);
      let resultOrNull:?TypesArchive.ArchivedDeposit = from_candid(blob);
      switch(resultOrNull){
        case (?resultItem){
          return #ok(resultItem);
        };
        case (_){
          return #err("not found");
        };
      };
  };

    public shared query func deposit_Get_Items(from:Nat, count:Nat):async Result.Result<[TypesArchive.ArchivedDeposit], Text>{

      let blobsCount:Nat = Nat64.toNat(getSize(entries.deposits));

      if (from >= blobsCount){
        return #err("startindex is too high.");
      };

      var lastIndex:Nat = from + count;
      lastIndex:= Nat.min(lastIndex, blobsCount);

      var result:List.List<TypesArchive.ArchivedDeposit> = List.nil<TypesArchive.ArchivedDeposit>();

      for (index in Iter.range(from, lastIndex)){

        try
        {
            let blob:Blob = getBlobByIndex(entries.deposits, Nat64.fromNat(index));

            let resultOrNull:?TypesArchive.ArchivedDeposit = from_candid(blob);
            switch(resultOrNull){
              case (?resultItem){
                result:= List.push<TypesArchive.ArchivedDeposit>(resultItem, result);
              };
              case (_){
                //do nothing
              };
            };
          }
          catch(error)
          {
            //do nothing
          }

      };
      return #ok(List.toArray(result));

  };



  public shared func Clear():async Result.Result<Text,Text>{
    // let depositItem:TypesArchive.ArchivedDeposit = {
    //   tokenType:TypesCommon.SpecificTokenType = #Dip20Sli;
    //     amount:Nat = 500;
    //     realAmount:Nat = 500;
    //     from:Principal = Principal.fromText("aaaaa-aa");
    //     to:Principal = Principal.fromText("aaaaa-aa");
    //     depositId:Blob = await Random.blob();
    //     time:Time.Time = Time.now();
    // };
    // return await deposit_Add(depositItem);
    return #ok("did nothing.");

  };


  public shared ({ caller }) func deposit_Add(depositItem:TypesArchive.ArchivedDeposit):async Result.Result<Text, Text>{

    if (caller != swapAppCanisterId){
      return #err("caller is not swapAppPrincipal. caller:" #Principal.toText(caller)#" , swapapp-principal: "#Principal.toText(swapApp_canisterId));
    };

    let encodedPrincipal = Principal.toBlob(depositItem.from);
    let depositBlob = to_candid(depositItem);


    var indizesList:List.List<Nat64> = List.nil<Nat64>();
    let currentIndizesOrNull =  StableTrieMap.get(entries.deposits_Indizes,Blob.equal, Blob.hash, encodedPrincipal);
    switch(currentIndizesOrNull){
      case (?indizesListItem){
        indizesList:=indizesListItem;
      };
      case (_){
        //do nothing
      };
    };

    //store blob
    let storedIndex = insertNewBlob(encodedPrincipal, entries.deposits,depositBlob);
   
    //Update the indizes list
    indizesList:= List.push<Nat64>(storedIndex, indizesList);
    StableTrieMap.put(entries.deposits_Indizes,Blob.equal, Blob.hash, encodedPrincipal, indizesList);
    return #ok("deposit item was added");
  };







  // private func GetIndexLimits(encodedPrincipal:Blob, indexLimits:StableTrieMap.StableTrieMap
  // <TypesCommon.EncodedPrincipal,TypesArchive.ArchiveIndexLimits>): (Bool, TypesArchive.ArchiveIndexLimits){
  //   let indexLimitsOrNull = StableTrieMap.get(indexLimits,  Blob.equal, Blob.hash, encodedPrincipal);
  //   switch(indexLimitsOrNull){
  //     case (?indexLimit){
  //       return (true, indexLimit);
  //     };
  //     case (_){
  //       return (false, {  firstUsedIndex:Nat64 = 0; lastUsedIndex:Nat64 = 0;});
  //     }
  //   };
  // };

  //  private func AddOrUpdateIndexLimits(encodedPrincipal:Blob, indexLimits:StableTrieMap.StableTrieMap
  // <TypesCommon.EncodedPrincipal,TypesArchive.ArchiveIndexLimits>,
  // firstIndex:Nat64, lastIndex:Nat64){

  //   let itemToAddOrUpdate:TypesArchive.ArchiveIndexLimits = {
  //     firstUsedIndex:Nat64 = firstIndex;
  //     lastUsedIndex:Nat64 = lastIndex;
  //   };

  //   StableTrieMap.put(indexLimits,  Blob.equal, Blob.hash, encodedPrincipal, itemToAddOrUpdate);

  // };



  //--------------------------------------------------------------------

 


  // Internal representation uses two regions, working together.
  // stable var state = {
  //   bytes = Region.new();
  //   var bytes_count : Nat64 = 0;
  //   elems = Region.new ();
  //   var elems_count : Nat64 = 0;
  // };

  // Count of elements (Blobs) that have been logged.
  // public func size() : async Nat64 {
  //     state.elems_count
  // };

  // Constant-time random access to previously-logged Blob.
  // public func get(index : Index) : async Blob {
  //   assert index < state.elems_count;
  //   let pos = Region.loadNat64(state.elems, index * elem_size);
  //   let size = Region.loadNat64(state.elems, index * elem_size + 8);
  //   let elem = { pos ; size };
  //   Region.loadBlob(state.bytes, elem.pos, Nat64.toNat(elem.size))
  // };

  // Add Blob to the log, and return the index of it.
  // public func add(blob : Blob) : async Index {
  //   let elem_i = state.elems_count;
  //   state.elems_count += 1;

  //   let elem_pos = state.bytes_count;
  //   state.bytes_count += Nat64.fromNat(blob.size());

  //   regionEnsureSizeBytes(state.bytes, state.bytes_count);
  //   Region.storeBlob(state.bytes, elem_pos, blob);

  //   regionEnsureSizeBytes(state.elems, state.elems_count * elem_size);
  //   Region.storeNat64(state.elems, elem_i * elem_size + 0, elem_pos);
  //   Region.storeNat64(state.elems, elem_i * elem_size + 8, Nat64.fromNat(blob.size()));
  //   elem_i
  // };



    /// Deposit cycles into this archive canister.
    public shared func deposit_cycles() : async () {
        let amount = Cycles.available();
        let accepted = Cycles.accept(amount);
        assert (accepted == amount);
    };

    public shared query func cycles_available() : async Nat {
      Cycles.balance();
    };

    //----------------------------------------------------------------
  //helper functions

  // Grow a region to hold a certain number of total bytes.
  func regionEnsureSizeBytes(r : Region, new_byte_count : Nat64) {
    let pages = Region.size(r);
    if (new_byte_count > pages << 16) {
      let new_pages = pages + ((new_byte_count + ((1 << 16) - 1)) / (1 << 16));
      assert Region.grow(r, new_pages) == pages
    }
  };



  private func getSize(item:TypesArchive.ArchiveItem) : Nat64 {
      item.elems_count;
  };

  private func getBlobByIndex(item: TypesArchive.ArchiveItem, index : Index) : Blob {
    assert index < item.elems_count;
    let pos = Region.loadNat64(item.elems, index * elem_size);
    let size = Region.loadNat64(item.elems, index * elem_size + 8);
    let elem = { pos ; size };
    Region.loadBlob(item.bytes, elem.pos, Nat64.toNat(elem.size));
  };

    private func insertNewBlob (encodedPrincipal:Blob, item:TypesArchive.ArchiveItem, blobToStore:Blob): Nat64{
    let index = item.elems_count;
    item.elems_count += 1;

    let elem_pos = item.bytes_count;
    item.bytes_count += Nat64.fromNat(blobToStore.size());
    regionEnsureSizeBytes(item.bytes, item.bytes_count);
    Region.storeBlob(item.bytes, elem_pos, blobToStore);

    regionEnsureSizeBytes(item.elems, item.elems_count * elem_size);
    Region.storeNat64(item.elems, index * elem_size + 0, elem_pos);
    Region.storeNat64(item.elems, index * elem_size + 8, Nat64.fromNat(blobToStore.size()));
    return index;
  };
  //----------------------------------------------------------------

};