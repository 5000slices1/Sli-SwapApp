import { Dip20Interface } from "../../Types/Interfaces";
import { TokenBalance } from "../Token/TokenBalance";
import { GetResultFromVariant } from "../../Utils/CommonUtils";
import { ResultInfo, ResultTypes } from "../../Types/CommonTypes";
import { Principal } from "@dfinity/principal";

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
    }

    async GetBalance(decimal) {

        return await this.GetBalanceForPrincipal(this.#principal, decimal);
    }

    async GetBalanceForPrincipal(principal, decimal) {
        if (this.#internalActor == null) {
            return new TokenBalance(0, decimal);
        }

        let balance = await this.#internalActor.balanceOf(principal);
        return new TokenBalance(balance, decimal);

    }

    async GetMetadata() {
        if (this.#internalActor == null) {
            return null;
        }
        return await this.#internalActor.getMetadata();
    }

    async GetTotalSupply(decimals) {

        if (this.#internalActor == null) {
            return new TokenBalance(0, decimals);
        }

        let totalSupply = await this.#internalActor.totalSupply();
        return new TokenBalance(totalSupply, decimals);
    }

    async GetTokenHolders(){
        if (this.#internalActor == null) {
            return null;
        }
        return await this.#internalActor.getTokenHolders();
    }

    async TransferTokens(targetPrincipal, amount) {

        if (this.#internalActor == null) {
            new ResultInfo(ResultTypes.err, "Not initialized");
        }

        try {
            let resultResponse = await this.#internalActor.transfer(targetPrincipal, amount);
            let returnResult = GetResultFromVariant(resultResponse);
            return returnResult;
        }
        catch (error) {
            return new ResultInfo(ResultTypes.err, error);
        }

    }

    async Approve(targetPrincipal, amount) {

        if (this.#internalActor == null) {
            new ResultInfo(ResultTypes.err, "Not initialized");
        }

        try {
            let resultResponse = await this.#internalActor.approve(targetPrincipal, amount);
            let returnResult = GetResultFromVariant(resultResponse);
            return returnResult;
        }
        catch (error) {
            return new ResultInfo(ResultTypes.err, error);
        }

    }

    async Allowance(sourcePrincipal, targetPrincipal) {

        if (this.#internalActor == null) {
            new ResultInfo(ResultTypes.err, "Not initialized");
        }

        try {
            let resultResponse = await this.#internalActor.allowance(sourcePrincipal, targetPrincipal);
            return resultResponse;
        }
        catch (error) {
            return new ResultInfo(ResultTypes.err, error);
        }

    }

}
