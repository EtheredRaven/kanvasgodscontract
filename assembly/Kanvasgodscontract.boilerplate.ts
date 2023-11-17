import { System, Protobuf, authority } from "@koinos/sdk-as";
import { kanvasgodscontract } from "./proto/kanvasgodscontract";

export class Kanvasgodscontract {
  name(
    args: kanvasgodscontract.name_arguments
  ): kanvasgodscontract.string_object {
    // YOUR CODE HERE

    const res = new kanvasgodscontract.string_object();
    // res.value = ;

    return res;
  }

  uri(
    args: kanvasgodscontract.uri_arguments
  ): kanvasgodscontract.string_object {
    // YOUR CODE HERE

    const res = new kanvasgodscontract.string_object();
    // res.value = ;

    return res;
  }

  symbol(
    args: kanvasgodscontract.symbol_arguments
  ): kanvasgodscontract.string_object {
    // YOUR CODE HERE

    const res = new kanvasgodscontract.string_object();
    // res.value = ;

    return res;
  }

  get_approved(
    args: kanvasgodscontract.get_approved_arguments
  ): kanvasgodscontract.address_object {
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.address_object();
    // res.value = ;

    return res;
  }

  is_approved_for_all(
    args: kanvasgodscontract.is_approved_for_all_arguments
  ): kanvasgodscontract.bool_object {
    // const owner = args.owner;
    // const operator = args.operator;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.bool_object();
    // res.value = ;

    return res;
  }

  total_supply(
    args: kanvasgodscontract.total_supply_arguments
  ): kanvasgodscontract.uint64_object {
    // YOUR CODE HERE

    const res = new kanvasgodscontract.uint64_object();
    // res.value = ;

    return res;
  }

  royalties(
    args: kanvasgodscontract.royalties_arguments
  ): kanvasgodscontract.royalties_result {
    // YOUR CODE HERE

    const res = new kanvasgodscontract.royalties_result();
    // res.value = ;

    return res;
  }

  set_royalties(
    args: kanvasgodscontract.set_royalties_arguments
  ): kanvasgodscontract.empty_object {
    // const value = args.value;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.empty_object();

    return res;
  }

  owner(
    args: kanvasgodscontract.owner_arguments
  ): kanvasgodscontract.address_object {
    // YOUR CODE HERE

    const res = new kanvasgodscontract.address_object();
    // res.value = ;

    return res;
  }

  transfer_ownership(
    args: kanvasgodscontract.transfer_ownership_arguments
  ): kanvasgodscontract.empty_object {
    // const owner = args.owner;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.empty_object();

    return res;
  }

  balance_of(
    args: kanvasgodscontract.balance_of_arguments
  ): kanvasgodscontract.uint64_object {
    // const owner = args.owner;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.uint64_object();
    // res.value = ;

    return res;
  }

  tokens_of(
    args: kanvasgodscontract.tokens_of_arguments
  ): kanvasgodscontract.tokens_of_result {
    // const owner = args.owner;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.tokens_of_result();
    // res.token_id = ;

    return res;
  }

  owner_of(
    args: kanvasgodscontract.owner_of_arguments
  ): kanvasgodscontract.address_object {
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.address_object();
    // res.value = ;

    return res;
  }

  mint(
    args: kanvasgodscontract.mint_arguments
  ): kanvasgodscontract.empty_object {
    // const to = args.to;
    // const number_tokens_to_mint = args.number_tokens_to_mint;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.empty_object();

    return res;
  }

  burn(
    args: kanvasgodscontract.burn_arguments
  ): kanvasgodscontract.empty_object {
    // const from = args.from;
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.empty_object();

    return res;
  }

  transfer(
    args: kanvasgodscontract.transfer_arguments
  ): kanvasgodscontract.empty_object {
    // const from = args.from;
    // const to = args.to;
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.empty_object();

    return res;
  }

  approve(
    args: kanvasgodscontract.approve_arguments
  ): kanvasgodscontract.empty_object {
    // const approver_address = args.approver_address;
    // const to = args.to;
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.empty_object();

    return res;
  }

  set_approval_for_all(
    args: kanvasgodscontract.set_approval_for_all_arguments
  ): kanvasgodscontract.empty_object {
    // const approver_address = args.approver_address;
    // const operator_address = args.operator_address;
    // const approved = args.approved;

    // YOUR CODE HERE

    const res = new kanvasgodscontract.empty_object();

    return res;
  }
}
