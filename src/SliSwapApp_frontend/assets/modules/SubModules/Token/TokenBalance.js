export class TokenBalance {

  #RawBalance;
  #Decimals;

  SetDecimals(decimals){
    this.#Decimals = decimals;
  }
  
  SetRawBalance(balanceValue) {
    this.#RawBalance = balanceValue;
  }

  //Raw balance as BigInteger with 10⁸ notation
  GetRawBalance() {
    return this.#RawBalance;
  }

  //Display-Balance
  GetBalance() {
    let number = Math.max(Number(this.#RawBalance), 0);
    return number / (10 ** this.#Decimals);
  };

  constructor(tokenBalance = 0.0,decimals = 8) {
    this.#RawBalance = tokenBalance;
    this.#Decimals = decimals;
  };

  Reset() {
    this.#RawBalance = 0;
  };

}
;
