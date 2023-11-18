import { Base58 } from "@koinos/sdk-as";

export namespace Constants {
  export const NAME: string = "Kanvas Gods";
  export const SYMBOL: string = "KANGODS";
  export const MINT_PRICE: u64 = 0;
  export const MINT_FEE: bool = false;
  export const MAX_SUPPLY: u64 = 1000;
  export const URI: string =
    "https://kanvas-app.com/api/kanvas_gods/get_metadata";

  // TODO : A changer
  export const OWNER: Uint8Array = Base58.decode(
    "1KJzFZ1Gy7H5WdVPnMKAvppmYx6Lj5m5bs"
  );

  // token mint
  export const TOKEN_PAY: Uint8Array = Base58.decode(
    "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL"
  );
  export const ADDRESS_PAY: Uint8Array = Base58.decode(
    "1KJzFZ1Gy7H5WdVPnMKAvppmYx6Lj5m5bs"
  );
}
