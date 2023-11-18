import {
  Base58,
  MockVM,
  Arrays,
  Protobuf,
  authority,
  chain,
} from "@koinos/sdk-as";
import { Kanvasgodscontract } from "../Kanvasgodscontract";
import { kanvasgodscontract } from "../proto/kanvasgodscontract";

const CONTRACT_ID = Base58.decode("1KANGodsneBDiXyvGT5fYrfDcZpJCjxRQU");
const MOCK_ACCT1 = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqG");
const MOCK_ACCT2 = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqK");
const CONTRACT_EMPTY = Base58.decode("");

function numToUint8Array(num: number): Uint8Array {
  let arr = new Uint8Array(8);

  for (let i = 0; i < 8; i++) {
    arr[i] = (num % 256) as u32;
    num = Math.floor(num / 256);
  }

  return arr;
}
const FIRST_TOKEN_ID = numToUint8Array(1);

describe("token", () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(CONTRACT_ID);
    MockVM.setCaller(
      new chain.caller_data(new Uint8Array(0), chain.privilege.user_mode)
    );
    const auth = new MockVM.MockAuthority(
      authority.authorization_type.contract_call,
      CONTRACT_ID,
      true
    );
    MockVM.setAuthorities([auth]);
  });

  it("should get the name", () => {
    const tkn = new Kanvasgodscontract();

    const args = new kanvasgodscontract.name_arguments();
    const res = tkn.name(args);

    expect(res.value).toBe("Kanvas Gods");
  });

  it("should get the symbol", () => {
    const tkn = new Kanvasgodscontract();

    const args = new kanvasgodscontract.symbol_arguments();
    const res = tkn.symbol(args);

    expect(res.value).toBe("KANGODS");
  });

  it("should get the uri", () => {
    const tkn = new Kanvasgodscontract();

    const args = new kanvasgodscontract.uri_arguments();
    const res = tkn.uri(args);

    expect(res.value).toBe(
      "https://kanvas-app.com/api/kanvas_gods/get_metadata"
    );
  });

  it("should mint tokens", () => {
    const tkn = new Kanvasgodscontract();

    // set caller before mint
    let callerData = new chain.caller_data(
      CONTRACT_ID,
      chain.privilege.user_mode
    );
    MockVM.setCaller(callerData);
    const argsMint = new kanvasgodscontract.mint_arguments(CONTRACT_ID, 3);
    tkn.mint(argsMint);

    const argsBalance = new kanvasgodscontract.balance_of_arguments(
      CONTRACT_ID
    );
    const resBalance = tkn.balance_of(argsBalance);

    expect(resBalance.value).toBe(3);

    const totalSupplyArgs = new kanvasgodscontract.total_supply_arguments();
    const totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(3);

    const tokensOfArgs = new kanvasgodscontract.tokens_of_arguments(
      CONTRACT_ID
    );
    const tokensOfRes = tkn.tokens_of(tokensOfArgs);
    expect(tokensOfRes.token_id.length).toBe(3);
    expect(tokensOfRes.token_id[0]).toBe("1");
    expect(tokensOfRes.token_id[1]).toBe("2");
    expect(tokensOfRes.token_id[2]).toBe("3");
  });

  it("should not mint tokens if not contract account", () => {
    const tkn = new Kanvasgodscontract();
    const auth = new MockVM.MockAuthority(
      authority.authorization_type.contract_call,
      MOCK_ACCT1,
      true
    );
    MockVM.setAuthorities([auth]);

    // check total supply
    const totalSupplyArgs = new kanvasgodscontract.total_supply_arguments();
    let totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(0);

    // check balance
    const balanceArgs = new kanvasgodscontract.balance_of_arguments(MOCK_ACCT1);
    let balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(0);

    const callerData = new chain.caller_data(
      MOCK_ACCT1,
      chain.privilege.user_mode
    );
    MockVM.setCaller(callerData);
    // save the MockVM state because the mint is going to revert the transaction
    MockVM.commitTransaction();

    expect(() => {
      // try to mint tokens
      const tkn = new Kanvasgodscontract();
      const mintArgs = new kanvasgodscontract.mint_arguments(MOCK_ACCT1, 1);
      tkn.mint(mintArgs);
    }).toThrow();

    // check balance
    balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(0);

    // check total supply
    totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(0);
  });

  /*
  it("should transfer tokens", () => {
    const tkn = new Kanvasgodscontract();

    MockVM.setContractArguments(new Uint8Array(0));
    MockVM.setEntryPoint(1);

    // set contract_call authority for CONTRACT_ID to true so that we can mint tokens
    const authContractId = new MockVM.MockAuthority(
      authority.authorization_type.contract_call,
      CONTRACT_ID,
      true
    );
    // set contract_call authority for MOCK_ACCT1 to true so that we can transfer tokens
    const authMockAcct1 = new MockVM.MockAuthority(
      authority.authorization_type.contract_call,
      MOCK_ACCT1,
      true
    );
    MockVM.setAuthorities([authContractId, authMockAcct1]);

    // set caller before mint
    MockVM.setCaller(
      new chain.caller_data(CONTRACT_ID, chain.privilege.user_mode)
    );

    // mint tokens
    const mintArgs = new kanvasgodscontract.mint_arguments(CONTRACT_ID, 3);
    tkn.mint(mintArgs);

    // transfer tokens
    const transferArgs = new kanvasgodscontract.transfer_arguments(
      CONTRACT_ID,
      MOCK_ACCT1,
      FIRST_TOKEN_ID
    );
    tkn.transfer(transferArgs);

    // check balances
    let balanceArgs = new kanvasgodscontract.balance_of_arguments(CONTRACT_ID);
    let balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(2);

    balanceArgs = new kanvasgodscontract.balance_of_arguments(MOCK_ACCT1);
    balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(1);

    let tokensOfFromArgs = new kanvasgodscontract.tokens_of_arguments(
      CONTRACT_ID
    );
    let tokensOfFromRes = tkn.tokens_of(tokensOfFromArgs);
    expect(tokensOfFromRes.token_id.length).toBe(2);
    expect(tokensOfFromRes.token_id[0]).toBe("2");
    expect(tokensOfFromRes.token_id[1]).toBe("3");

    let tokensOfToArgs = new kanvasgodscontract.tokens_of_arguments(MOCK_ACCT1);
    let tokensOfToRes = tkn.tokens_of(tokensOfToArgs);
    expect(tokensOfToRes.token_id.length).toBe(1);
    expect(tokensOfFromRes.token_id[0]).toBe("1");
  });*/

  /*it("should get approval", () => {
    const tkn = new Kanvasgodscontract();

    const args = new kanvasgodscontract.get_approved_arguments(FIRST_TOKEN_ID);
    const res = tkn.get_approved(args);

    expect(res.value).toBe(null);

    MockVM.setCaller(
      new chain.caller_data(MOCK_ACCT1, chain.privilege.user_mode)
    );

    const approveArgs = new kanvasgodscontract.approve_arguments(
      MOCK_ACCT1,
      CONTRACT_ID,
      500
    );
    tkn.approve(approveArgs);

    // Check allowance
    let allowanceArgs = new kanvascontract.allowance_arguments(
      MOCK_ACCT1,
      CONTRACT_ID
    );
    let allowanceRes = tkn.allowance(allowanceArgs);
    expect(allowanceRes.value).toBe(500);
  });*/
});
