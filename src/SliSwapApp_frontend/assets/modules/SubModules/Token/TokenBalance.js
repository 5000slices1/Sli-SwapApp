export class TokenBalance {

  #RawBalance;

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
    return number / (10 ** 8);
  };

  constructor(tokenBalance = 0.0) {
    this.#RawBalance = tokenBalance;
  };

  Reset() {
    this.#RawBalance = 0;
  };

}
;
