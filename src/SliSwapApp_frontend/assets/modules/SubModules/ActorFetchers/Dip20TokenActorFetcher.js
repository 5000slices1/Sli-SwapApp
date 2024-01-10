import { Dip20Interface } from "../../Types/Interfaces";
import { TokenBalance } from "../Token/TokenBalance";

export class Dip20TokenActorFetcher {

    //private fields    
    #principal;
    #internalActor;

    async Init(provider, principal, canisterId) {

        if (!provider || !canisterId || provider == null || canisterId == null
            || provider == undefined || canisterId == undefined) {

            this.#internalActor = null;
            this.#principal = null;
            return;
        }
        
        this.#principal = principal;
        this.#internalActor = await provider.createActor({ canisterId: canisterId, interfaceFactory: Dip20Interface });
    };

    async GetBalance() {

        if (this.#internalActor == null) {
            return new TokenBalance(0);
        }

        return new TokenBalance(await this.#internalActor.balanceOf(this.#principal));
    }

    async GetMetadata() {
        if (this.#internalActor == null) {
            return null;
        }
        return await this.#internalActor.getMetadata();        
    };
}
