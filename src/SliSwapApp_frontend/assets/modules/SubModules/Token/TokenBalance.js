
export class TokenBalance {

  #RawBalance;
  #Decimals;

  SetDecimals(decimals){
    this.#Decimals = Number(decimals);
    return this;
  }
  
  SetRawBalance(balanceValue) {
    this.#RawBalance = balanceValue;
    return this;
  }

  SetBalance(amount){

    this.#RawBalance = BigInt( Number(amount) * (10 ** Number(this.#Decimals)));
    return this;
  }

  //Raw balance as BigInteger with 10⁸ notation
  GetRawBalance() {
    return this.#RawBalance;
  }

  //Display-Balance
  GetBalance() {
    let number = Math.max(Number(this.#RawBalance), 0);
    return number / (10 ** Number(this.#Decimals));
  }

  constructor(tokenBalance = 0.0,decimals = 8) {
    this.#RawBalance = tokenBalance;
    this.#Decimals = Number(decimals);
  }

  Reset() {
    this.#RawBalance = 0;
  }

}

