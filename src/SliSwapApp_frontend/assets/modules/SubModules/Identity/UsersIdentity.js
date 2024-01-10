export class UsersIdentity {

  //Connected, true or false
  IsConnected;

  //Type of the connection. (stoic, plug, dfinity)
  Type;

  //Display-name of the connected wallet (Stoic, Plug, Dfinity)
  Name;

  //The users wallet-principal as Text
  AccountPrincipalText;

  //The users wallet-principal
  AccountPrincipal;

  constructor() {
    this.Reset();
  }

  Reset() {
    this.IsConnected = false;
    this.Type = "";
    this.Name = "";
    this.AccountPrincipalText = "";
    this.AccountPrincipal = "";
  }
}
;
