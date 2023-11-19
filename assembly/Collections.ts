import {
  System,
  SafeMath,
  Protobuf,
  Storage,
  Arrays,
  authority,
  Token,
  error,
  StringBytes,
  Base58,
} from "@koinos/sdk-as";
import { collections } from "./proto/collections";

import { Constants } from "./Constants";

const TOKENS_SPACE_ID = 18;
const BALANCES_SPACE_ID = 19;
const APPROVALS_SPACE_ID = 20;
const OPERATORS_SPACE_ID = 21;
const TOKEN_OF_SPACE_ID = 22;
const SUPPLY_SPACE_ID = 23;
const CONFIG_SPACE_ID = 24;

export class Collections {
  _contractId: Uint8Array;
  _supply!: Storage.Obj<collections.balance_object>;
  _tokens!: Storage.Map<string, collections.token_object>;
  _balances!: Storage.Map<Uint8Array, collections.balance_object>;
  _approvals!: Storage.Map<string, collections.token_approval_object>;
  _operators!: Storage.Map<string, collections.operator_approval_object>;
  _tokensOf!: Storage.Map<Uint8Array, collections.tokens_of_result>;
  _config!: Storage.Obj<collections.config_object>;

  constructor() {
    this._contractId = System.getContractId();

    this._supply = new Storage.Obj(
      this._contractId,
      SUPPLY_SPACE_ID,
      collections.balance_object.decode,
      collections.balance_object.encode,
      () => new collections.balance_object(0)
    );
    this._tokens = new Storage.Map(
      this._contractId,
      TOKENS_SPACE_ID,
      collections.token_object.decode,
      collections.token_object.encode,
      null
    );
    this._balances = new Storage.Map(
      this._contractId,
      BALANCES_SPACE_ID,
      collections.balance_object.decode,
      collections.balance_object.encode,
      () => new collections.balance_object(0)
    );
    this._approvals = new Storage.Map(
      this._contractId,
      APPROVALS_SPACE_ID,
      collections.token_approval_object.decode,
      collections.token_approval_object.encode,
      null
    );
    this._operators = new Storage.Map(
      this._contractId,
      OPERATORS_SPACE_ID,
      collections.operator_approval_object.decode,
      collections.operator_approval_object.encode,
      null
    );
    this._tokensOf = new Storage.Map(
      this._contractId,
      TOKEN_OF_SPACE_ID,
      collections.tokens_of_result.decode,
      collections.tokens_of_result.encode,
      () => new collections.tokens_of_result([])
    );
    this._config = new Storage.Obj(
      this._contractId,
      CONFIG_SPACE_ID,
      collections.config_object.decode,
      collections.config_object.encode,
      () =>
        new collections.config_object(
          Constants.OWNER.length == 0
            ? System.getContractId()
            : Constants.OWNER,
          []
        ) // Default owner to CONSTANTS.OWNER or _contractId if not owner set
    );
  }

  /**
   * Get name of the token
   * @external
   * @readonly
   */
  name(args: collections.name_arguments): collections.string_object {
    return new collections.string_object(Constants.NAME);
  }

  /**
   * Get the symbol of the token
   * @external
   * @readonly
   */
  symbol(args: collections.symbol_arguments): collections.string_object {
    return new collections.string_object(Constants.SYMBOL);
  }

  /**
   * Get the uri of the token for getting the metadata
   * @external
   * @readonly
   */
  uri(args: collections.uri_arguments): collections.string_object {
    return new collections.string_object(Constants.URI);
  }

  /**
   * Get total supply
   * @external
   * @readonly
   */
  total_supply(
    args: collections.total_supply_arguments
  ): collections.uint64_object {
    const supply = this._supply.get()!;
    return new collections.uint64_object(supply.value);
  }

  /**
   * Get the royalties percentage when selling a token
   * @external
   * @readonly
   */
  royalties(
    args: collections.royalties_arguments
  ): collections.royalties_result {
    const config = this._config.get()!;
    return new collections.royalties_result(config.royalties);
  }

  /**
   * Set the royalties percentage when selling a token
   * @external
   */
  set_royalties(
    args: collections.set_royalties_arguments
  ): collections.empty_object {
    // check owner
    const config = this._config.get()!;
    this._checkOwner(config);
    // check max royaltie
    const royalties = args.value;
    let royaltiesTotal: u64 = 0;
    let impacted: Uint8Array[] = [];
    for (let index = 0; index < royalties.length; index++) {
      let royalty = royalties[index];
      impacted.push(royalty.address);
      royaltiesTotal = SafeMath.add(royaltiesTotal, royalty.amount);
    }
    System.require(
      royaltiesTotal <= 10000,
      "MarketplaceV1.execute: ROYALTY_EXCEEDED_MAX"
    );
    // update royalties
    config.royalties = args.value;
    this._config.put(config);

    const royaltiesEvent = new collections.royalties_event(royalties);
    System.event(
      "collections.royalties_event",
      Protobuf.encode(royaltiesEvent, collections.royalties_event.encode),
      impacted
    );

    return new collections.empty_object();
  }

  /**
   * Get the owner of the collection
   * @external
   * @readonly
   */
  owner(args: collections.owner_arguments): collections.address_object {
    const config = this._config.get()!;
    return new collections.address_object(config.owner);
  }

  /**
   * Transfer the ownernship of the collection
   * @external
   */
  transfer_ownership(
    args: collections.transfer_ownership_arguments
  ): collections.empty_object {
    // check owner
    const config = this._config.get()!;
    this._checkOwner(config);

    // event
    const ownerEvent = new collections.owner_event(config.owner, args.owner);
    const impacted = [config.owner, args.owner];

    // update owner
    config.owner = args.owner;
    this._config.put(config);

    System.event(
      "collections.owner_event",
      Protobuf.encode(ownerEvent, collections.owner_event.encode),
      impacted
    );

    return new collections.empty_object();
  }

  /**
   * Get balance of an account
   * @external
   * @readonly
   */
  balance_of(
    args: collections.balance_of_arguments
  ): collections.uint64_object {
    const owner = args.owner;
    const balanceObj = this._balances.get(owner)!;
    return new collections.uint64_object(balanceObj.value);
  }

  /**
   * Get the tokens ids of a specific owner
   * @external
   * @readonly
   */
  tokens_of(
    args: collections.tokens_of_arguments
  ): collections.tokens_of_result {
    const owner = args.owner;
    const tokensIds = new collections.tokens_of_result(
      this._tokensOf.get(owner)!.token_id
    );
    return tokensIds;
  }

  /**
   * Get the owner of a specific token
   * @external
   * @readonly
   */
  owner_of(args: collections.owner_of_arguments): collections.address_object {
    const token_id = StringBytes.bytesToString(args.token_id);
    const res = new collections.address_object();
    const token = this._tokens.get(token_id);
    if (token) {
      res.value = token.owner;
    }
    return res;
  }

  /**
   * Get the approvals for a specific token
   * @external
   * @readonly
   */
  get_approved(
    args: collections.get_approved_arguments
  ): collections.address_object {
    const token_id = StringBytes.bytesToString(args.token_id);
    const res = new collections.address_object();
    const approval = this._approvals.get(token_id);
    if (approval) {
      res.value = approval.address;
    }
    return res;
  }

  /**
   * Get the storing key of the operators
   * @internal
   * @readonly
   */
  _get_approved_operator_key(operator: Uint8Array, owner: Uint8Array): string {
    return `${Base58.encode(operator)}_${Base58.encode(owner)}`;
  }

  /**
   * Check if there is a global approval
   * @external
   * @readonly
   */
  is_approved_for_all(
    args: collections.is_approved_for_all_arguments
  ): collections.bool_object {
    const owner = args.owner as Uint8Array;
    const operator = args.operator as Uint8Array;
    const res = new collections.bool_object();
    const approval = this._operators.get(
      this._get_approved_operator_key(operator, owner)
    );
    if (approval) {
      res.value = approval.approved;
    }
    return res;
  }

  /**
   * Mint a new token
   * @external
   */
  mint(args: collections.mint_arguments): collections.empty_object {
    const OWNER = this._config.get()!.owner;
    const to = Constants.MINT_FEE ? args.to : OWNER; // if everyone can mint, then you can take into account args.to, otherwise it is to the owner anyway

    // process
    const supply = this._supply.get()!;
    const balance = this._balances.get(to)!;
    const tokens = SafeMath.add(supply.value, args.number_tokens_to_mint);

    // pay mint price token or check creator
    if (Constants.MINT_FEE) {
      const token_pay = new Token(Constants.TOKEN_PAY);
      const _result = token_pay.transfer(
        args.to,
        Constants.ADDRESS_PAY,
        SafeMath.mul(args.number_tokens_to_mint, Constants.MINT_PRICE)
      );
      System.require(_result, "Failed to pay mint");
    } else if (OWNER.length > 0) {
      // if OWNER is setup
      System.requireAuthority(
        authority.authorization_type.contract_call,
        OWNER
      );
    } else {
      // otherwise, check contract id permissions
      System.requireAuthority(
        authority.authorization_type.contract_call,
        this._contractId
      );
    }

    // check limit amount tokens
    System.require(tokens > 0, "token id out of bounds");
    // check limit amount tokens
    System.require(tokens <= Constants.MAX_SUPPLY, "token id out of bounds");

    // assign the new token's owner
    const start = SafeMath.add(supply.value, 1);
    const newToken = new collections.token_object();
    let tokenId: string;

    for (let index = start; index <= tokens; index++) {
      tokenId = index.toString();

      // mint token
      newToken.owner = to;
      this._tokens.put(tokenId, newToken);

      const tokensOf = this._tokensOf.get(to)!;
      tokensOf.token_id.push(tokenId);
      this._tokensOf.put(to, tokensOf);

      // events
      const mintEvent = new collections.mint_event(
        to,
        StringBytes.stringToBytes(tokenId)
      );

      const impacted = [to];
      System.event(
        "collections.mint_event",
        Protobuf.encode(mintEvent, collections.mint_event.encode),
        impacted
      );
    }

    // update the owner's balance
    balance.value = SafeMath.add(balance.value, args.number_tokens_to_mint);

    // check limit address
    System.require(
      balance.value <= Constants.MAX_SUPPLY,
      "exceeds the limit of tokens per address"
    );

    // increment supply
    supply.value = SafeMath.add(supply.value, args.number_tokens_to_mint);

    // save new states
    this._balances.put(to, balance);
    this._supply.put(supply);

    return new collections.empty_object();
  }

  burn(args: collections.burn_arguments): collections.empty_object {
    return new collections.empty_object();
  }

  /**
   * Transfer tokens
   * @external
   */
  transfer(args: collections.transfer_arguments): collections.empty_object {
    // data
    const from = args.from;
    const to = args.to;
    const token_id = StringBytes.bytesToString(args.token_id);

    // process
    const token = this._tokens.get(token_id);

    // check if the token exists
    System.require(
      token != null,
      "nonexistent token",
      error.error_code.failure
    );

    // check if owner if from
    System.require(
      Arrays.equal(token!.owner, from),
      "from is not a owner",
      error.error_code.authorization_failure
    );

    // check authorize tokens
    let isTokenApproved: bool = false;
    const caller = System.getCaller();
    if (!Arrays.equal(caller.caller, from)) {
      const approval = this._approvals.get(token_id);
      if (approval) {
        let approvedAddress = approval.address as Uint8Array;
        isTokenApproved = Arrays.equal(approvedAddress, caller.caller);
      }
      if (!isTokenApproved) {
        const operatorApproval = this._operators.get(
          this._get_approved_operator_key(caller.caller, token!.owner)
        );
        if (operatorApproval) {
          isTokenApproved = operatorApproval.approved;
        }
        if (!isTokenApproved) {
          isTokenApproved = System.checkAuthority(
            authority.authorization_type.contract_call,
            from
          );
        }
      }
      System.require(
        isTokenApproved,
        "from has not authorized transfer",
        error.error_code.authorization_failure
      );
    }
    // clear the token approval
    this._approvals.remove(token_id);

    // update the owner token
    token!.owner = to;

    // update the current owner's balance
    const balance_from = this._balances.get(from)!;
    balance_from.value = SafeMath.sub(balance_from.value, 1);

    // update the new owner's balance
    const balance_to = this._balances.get(to)!;
    balance_to.value = SafeMath.add(balance_to.value, 1);

    // update the tokens of list
    let tokens_list_from = this._tokensOf.get(from)!.token_id;
    let tokens_list_to = this._tokensOf.get(to)!.token_id;
    let token_index = tokens_list_from.indexOf(token_id);
    // This error should never happend, for testing purposes only
    System.require(
      token_index >= 0,
      "the sender do not own this token according to tokens list"
    );
    tokens_list_from.splice(token_index, 1);
    tokens_list_to.push(token_id);
    this._tokensOf.put(
      from,
      new collections.tokens_of_result(tokens_list_from)
    );
    this._tokensOf.put(to, new collections.tokens_of_result(tokens_list_to));

    // save new states
    this._tokens.put(token_id, token!);
    this._balances.put(to, balance_to);
    this._balances.put(from, balance_from);

    // generate event
    const transferEvent = new collections.transfer_event(
      from,
      to,
      args.token_id
    );
    const impacted = [to, from];
    System.event(
      "collections.transfer_event",
      Protobuf.encode(transferEvent, collections.transfer_event.encode),
      impacted
    );

    return new collections.empty_object();
  }

  /**
   * Approves the spender to transfer a specific amount of tokens on behalf of the owner.
   * @external
   */
  approve(args: collections.approve_arguments): collections.empty_object {
    const approver_address = args.approver_address;
    const to = args.to;
    const token_id = StringBytes.bytesToString(args.token_id);

    // require authority of the approver_address
    System.requireAuthority(
      authority.authorization_type.contract_call,
      approver_address
    );

    // check that the token exists
    let token = this._tokens.get(token_id);
    System.require(
      token != null,
      "nonexistent token",
      error.error_code.failure
    );

    // check that the to is not the owner
    System.require(
      !Arrays.equal(token!.owner, to),
      "approve to current owner",
      error.error_code.failure
    );

    // check that the approver_address is allowed to approve the token
    if (!Arrays.equal(token!.owner, approver_address)) {
      let approval = this._operators.get(
        this._get_approved_operator_key(approver_address, token!.owner)
      );
      System.require(
        approval != null,
        "approved does not exist",
        error.error_code.authorization_failure
      );
      System.require(
        approval!.approved,
        "approver_address is not owner",
        error.error_code.authorization_failure
      );
    }

    // update approval
    let approval = new collections.token_approval_object(to);
    this._approvals.put(token_id, approval);

    // generate event
    const approvalEvent = new collections.token_approval_event(
      approver_address,
      to,
      args.token_id
    );
    const impacted = [to, approver_address];
    System.event(
      "collections.token_approval_event",
      Protobuf.encode(approvalEvent, collections.token_approval_event.encode),
      impacted
    );

    return new collections.empty_object();
  }

  /**
   * Approves for all
   * @external
   */
  set_approval_for_all(
    args: collections.set_approval_for_all_arguments
  ): collections.empty_object {
    const approver_address = args.approver_address;
    const operator_address = args.operator_address;
    const approved = args.approved;

    // only the owner of approver_address can approve an operator for his account
    System.requireAuthority(
      authority.authorization_type.contract_call,
      approver_address
    );

    // check that the approver_address is not the address to approve
    System.require(
      !Arrays.equal(approver_address, operator_address),
      "approve to operator_address",
      error.error_code.authorization_failure
    );

    // update the approval
    let approval = new collections.operator_approval_object(approved);
    this._operators.put(
      this._get_approved_operator_key(operator_address, approver_address),
      approval
    );

    // generate event
    const approvalEvent = new collections.operator_approval_event(
      approver_address,
      operator_address,
      approved
    );
    const impacted = [operator_address, approver_address];
    System.event(
      "collections.operator_approval_event",
      Protobuf.encode(
        approvalEvent,
        collections.operator_approval_event.encode
      ),
      impacted
    );

    return new collections.empty_object();
  }

  /**
   * Helpers
   */
  _checkOwner(config: collections.config_object): void {
    System.requireAuthority(
      authority.authorization_type.contract_call,
      config.owner
    );
  }
}
