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
import ExperimentalStableMemory "mo:base/ExperimentalStableMemory";
import List "mo:base/List";
import Time "mo:base/Time";
import Interfaces "../Interfaces/Interfaces";
import TypesHistory "../Types/TypesHistory";
import TypesDip20 "../Types/TypesDip20";


shared ({ caller = swapApp_canisterId }) actor class HistoryCanister() : async Interfaces.InterfaceHistory = this{

  // Index of saved log entry.
  public type Index = Nat64;

  // Element = Position and size of a saved Blob.
  // type Elem = {
  //   pos : Nat64;
  //   size : Nat64;
  // };

  let elem_size = 16 : Nat64; /* two Nat64s, for pos and size. */

  //----------------------------------------------------------------
  //helper functions

  private func getNewHistoryItem():HistoryItem{
    let result:HistoryItem = {
        bytes = Region.new();
        var bytes_count : Nat64 = 0;
        elems = Region.new ();
        var elems_count : Nat64 = 0;
    };
    return result;
  };

  private func getSize(item:HistoryItem) : async Nat64 {
      item.elems_count;
  };

  private func getBlobByIndex(item:HistoryItem, index : Index) : async Blob {
    assert index < item.elems_count;
    let pos = Region.loadNat64(item.elems, index * elem_size);
    let size = Region.loadNat64(item.elems, index * elem_size + 8);
    let elem = { pos ; size };
    Region.loadBlob(item.bytes, elem.pos, Nat64.toNat(elem.size));
  };
  //----------------------------------------------------------------


  public type HistoryItem = {
    bytes:Region;
    var bytes_count : Nat64;

    elems:Region;
    var elems_count : Nat64;
  };

  stable var entries = {
    var usedSubAccounts:List.List<TypesHistory.UsedSubAccount> = List.nil<TypesHistory.UsedSubAccount>();
    
    //usedSubAccounts:HistoryItem = getNewHistoryItem();
  };


  //History of SubAccount
  public shared func SubAccount_Add(subAccount:Blob){
    
    let newEntry:TypesHistory.UsedSubAccount = {
      subAccount:Blob = subAccount;
      createdAt:Time.Time = Time.now();
    };
    entries.usedSubAccounts:=List.push(newEntry, entries.usedSubAccounts);
  };

  public shared func SubAccount_Delete(subAccount:Blob){
    entries.usedSubAccounts:= List.filter<TypesHistory.UsedSubAccount>(entries.usedSubAccounts, func n {Blob.equal(subAccount, n.subAccount) == false });
  };

  public shared query func SubAccount_Count():async Nat{
    return List.size(entries.usedSubAccounts);
  };

  public shared query func SubAccount_GetItems(from:Nat, to:Nat): async [TypesHistory.UsedSubAccount]{
    let length =  List.size(entries.usedSubAccounts);
    if (from >=length ){
      return [];
    };
    var newTo:Nat = to;
    newTo := Nat.min(to, length-1);

    var resultAsList:List.List<TypesHistory.UsedSubAccount> = List.nil<TypesHistory.UsedSubAccount>();
    for (index in Iter.range(from, newTo)) {
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







  // Internal representation uses two regions, working together.
  stable var state = {
    bytes = Region.new();
    var bytes_count : Nat64 = 0;
    elems = Region.new ();
    var elems_count : Nat64 = 0;
  };

  // Grow a region to hold a certain number of total bytes.
  func regionEnsureSizeBytes(r : Region, new_byte_count : Nat64) {
    let pages = Region.size(r);
    if (new_byte_count > pages << 16) {
      let new_pages = pages - ((new_byte_count + ((1 << 16) - 1)) / (1 << 16));
      assert Region.grow(r, new_pages) == pages
    }
  };

 

  // Count of elements (Blobs) that have been logged.
  public func size() : async Nat64 {
      state.elems_count
  };

  // Constant-time random access to previously-logged Blob.
  public func get(index : Index) : async Blob {
    assert index < state.elems_count;
    let pos = Region.loadNat64(state.elems, index * elem_size);
    let size = Region.loadNat64(state.elems, index * elem_size + 8);
    let elem = { pos ; size };
    Region.loadBlob(state.bytes, elem.pos, Nat64.toNat(elem.size))
  };

  // Add Blob to the log, and return the index of it.
  public func add(blob : Blob) : async Index {
    let elem_i = state.elems_count;
    state.elems_count += 1;

    let elem_pos = state.bytes_count;
    state.bytes_count += Nat64.fromNat(blob.size());

    regionEnsureSizeBytes(state.bytes, state.bytes_count);
    Region.storeBlob(state.bytes, elem_pos, blob);

    regionEnsureSizeBytes(state.elems, state.elems_count * elem_size);
    Region.storeNat64(state.elems, elem_i * elem_size + 0, elem_pos);
    Region.storeNat64(state.elems, elem_i * elem_size + 8, Nat64.fromNat(blob.size()));
    elem_i
  };



    /// Deposit cycles into this archive canister.
    public shared func deposit_cycles() : async () {
        let amount = Cycles.available();
        let accepted = Cycles.accept(amount);
        assert (accepted == amount);
    };

    public shared query func cycles_available() : async Nat {
      Cycles.balance();      
    };


};