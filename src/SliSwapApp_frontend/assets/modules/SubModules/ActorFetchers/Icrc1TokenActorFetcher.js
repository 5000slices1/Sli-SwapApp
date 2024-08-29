import { Icrc1Interface } from "../../Types/Interfaces";
import { TokenBalance } from "../Token/TokenBalance";
import { GetResultFromVariant } from "../../Utils/CommonUtils";

export class Icrc1TokenActorFetcher {

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
        this.#internalActor = await provider.createActor({ canisterId: canisterId, interfaceFactory: Icrc1Interface });
    }

    async GetBalance(decimal) {

        return await this.GetBalanceForPrincipal(this.#principal, decimal);
    }

    async GetBalanceForPrincipal(principal, decimal) {
        if (this.#internalActor == null) {
            return new TokenBalance(BigInt(0), decimal);
        }

        let balance = await this.#internalActor.icrc1_balance_of({
            owner: principal,
            subaccount: [],
        });

        return new TokenBalance(balance, decimal);

    }

  
    async GetTotalSupply(decimals) {

        if (this.#internalActor == null) {
            return new TokenBalance(BigInt(0), decimals);
        }

        let totalSupply = await this.#internalActor.icrc1_total_supply();
        return new TokenBalance(totalSupply, decimals);
    }
}
