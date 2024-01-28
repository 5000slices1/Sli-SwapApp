import Bool "mo:base/Bool";
import StableTrieMap "mo:StableTrieMap";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import T "../../Types/TypesCommon";

class StableTrieMapAccessor<K,V>(keyEqualityComparer : (K, K) -> Bool, keyHashFunction : (K) -> Hash.Hash){

    let keyEq: (K, K) -> Bool = keyEqualityComparer;
    let keyHash:(K) -> Hash.Hash = keyHashFunction;

    public func containsKey(self : StableTrieMap.StableTrieMap<K, V>, key : K):Bool{

        return StableTrieMap.containsKey(self, keyEq, keyHash, key);
    };

    public func isEmpty(self : StableTrieMap.StableTrieMap<K, V>):Bool{
        StableTrieMap.isEmpty(self);
    };

    public func put(self : StableTrieMap.StableTrieMap<K, V>, key : K, value:V){
        StableTrieMap.put(self, keyEq, keyHash, key, value);
    };

     public func get(self : StableTrieMap.StableTrieMap<K, V>, key : K):?V{
        StableTrieMap.get(self, keyEq, keyHash, key);
    };

    public func delete(self : StableTrieMap.StableTrieMap<K, V>, key : K){
        StableTrieMap.delete(self, keyEq, keyHash, key);
    };

    public func bla(){

       

        let STM_SwapInfo:StableTrieMapAccessor<Principal, T.SwapInfo> =
    
        StableTrieMapAccessor.StableTrieMapAccessor<Principal, T.SwapInfo>(Blob.equal, Blob.hash ) ;

    };
};