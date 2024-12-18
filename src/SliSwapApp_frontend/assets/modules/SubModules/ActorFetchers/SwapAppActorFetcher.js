import { CommonIdentityProvider, ResultInfo, ResultTypes } from "../../Types/CommonTypes.js";
import { SwapAppActorInterface } from "../../Types/Interfaces.js";
import { GetResultFromVariant } from "../../Utils/CommonUtils.js"

export class SwapAppActorFetcher {

  #provider;
  #swapAppActor;


  #ProviderIsDefined() {
    if (this.#provider == null || this.#provider == undefined || this.#provider == false) {
      return false;
    }
    return true;
  }

  async Init(provider) {
    this.#provider = provider;

    if (this.#ProviderIsDefined() == false) {
      this.#provider = null;
      this.#swapAppActor = null;
      return;
    }

    let dAppPrincipalText = CommonIdentityProvider.SwapAppPrincipalText;
    this.#swapAppActor = await this.#provider.createActor({ canisterId: dAppPrincipalText, interfaceFactory: SwapAppActorInterface });

  }

  async GetUserRole() {

    if (this.#ProviderIsDefined() == false) {

      return { 'NormalUser': null };
    }

    try {

      let userRole = await this.#swapAppActor.GetUserRole();
      return userRole;
    }
    catch (error) {
      return { 'NormalUser': null };
    }
  }

  //Set Sli canister-id in the backend:
  async SliIcrc1_SetCanisterId(canisterId) {

    if (this.#ProviderIsDefined() == false) {
      return new ResultInfo(ResultTypes.err, "You are not connected.");
    }
    return GetResultFromVariant(await this.#swapAppActor.SliIcrc1_SetCanisterId(canisterId));
  }

  //Set Glds canister-id in the backend:
  async GldsIcrc1_SetCanisterId(canisterId) {
    if (this.#ProviderIsDefined() == false) {
      return new ResultInfo(ResultTypes.err, "You are not connected.");
    }
    return GetResultFromVariant(await this.#swapAppActor.GldsIcrc1_SetCanisterId(canisterId));
  }


  async AddApprovalWalletSli(approvalWalletPrincipal) {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.AddNewApprovedSliWallet(approvalWalletPrincipal);
      return GetResultFromVariant(result);
    }
    catch (error) {
      return new ResultInfo(ResultTypes.err, error);
    }
  }

  async AddApprovalWalletGlds(approvalWalletPrincipal) {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.AddNewApprovedGldsWallet(approvalWalletPrincipal);
      return GetResultFromVariant(result);
    }
    catch (error) {
      return new ResultInfo(ResultTypes.err, error);
    }
  }

  async DepositSliDip20Tokens(amount) {



    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.DepositSliDip20Tokens(amount);
      return GetResultFromVariant(result);
    }
    catch (error) {
      return new ResultInfo(ResultTypes.err, error);
    }
  }


  async DepositGldsDip20Tokens(amount) {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.DepositGldsDip20Tokens(amount);
      return GetResultFromVariant(result);
    }
    catch (error) {
      return new ResultInfo(ResultTypes.err, error);
    }
  }

  async GetDepositedSliAmount() {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.GetSliDip20DepositedAmount();
      let parsedResult = GetResultFromVariant(result);
      return parsedResult;
    }
    catch (error) {
      return new ResultInfo(ResultTypes.err, error);
    }
  }

  async GetDepositedGldsAmount() {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.GetGldsDip20DepositedAmount();
      let parsedResult = GetResultFromVariant(result);
      return parsedResult;
    }
    catch (error) {
      return new ResultInfo(ResultTypes.err, error);
    }
  }

  async GetUserIdForSli() {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.GetUserIdForSli();
      let parsedResult = GetResultFromVariant(result);
      return parsedResult;
    }
    catch (error) {
      return new ResultInfo(ResultTypes.err, error);
    }
  }

  async GetUserIdForGlds() {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.GetUserIdForGlds();
      let parsedResult = GetResultFromVariant(result);
      return parsedResult;
    }
    catch (error) {
      return new ResultInfo(ResultTypes.err, error);
    }
  }

  async set_changing_icrc1_canister_ids_to_locked_state() {
    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.set_changing_icrc1_canister_ids_to_locked_state();
      let parsedResult = GetResultFromVariant(result);
      return parsedResult;
    }
    catch (error) {
      return new ResultInfo(ResultTypes.err, error);
    }

  }

  async burn_sli_icrc1_tokens(amount) {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      await this.#swapAppActor.SliIcrc1_BurnTokens(amount);     
    }
    catch (error) {
      // do nothing
    }
  }

  async burn_glds_icrc1_tokens(amount) {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      await this.#swapAppActor.GldsIcrc1_BurnTokens(amount);     
    }
    catch (error) {
      // do nothing
    }
  }

  async SliIcrc1_AutoTransferTokens(principalText, amount) {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.SliIcrc1_AutoTransferTokens(principalText,amount);     
      return result;
    }
    catch (error) {
      // do nothing
    }
  };

  async GldsIcrc1_AutoTransferTokens(principalText, amount) {

    if (this.#ProviderIsDefined() == false) {
      new ResultInfo(ResultTypes.err, "Not initialized");
    }

    try {
      let result = await this.#swapAppActor.GldsIcrc1_AutoTransferTokens(principalText,amount);     
      return result;
    }
    catch (error) {
      // do nothing
    }
  };


}