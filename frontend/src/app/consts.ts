import { HexString } from '@gear-js/api';

interface ContractSails {
  programId: HexString,
  idl: string
}

export const ACCOUNT_ID_LOCAL_STORAGE_KEY = 'account';

export const ADDRESS = {
  NODE: 'wss://testnet.vara.network',
};

export const ROUTES = {
  HOME: '/',
  EXAMPLES: '/examples',
  NOTFOUND: '*',
};

// To use the example code, enter the details of the account that will pay the vouchers, etc. (name and mnemonic)
export const sponsorName = "MEGAHACKATHON";
export const sponsorMnemonic = "pipe material yellow hour brother velvet mimic cycle mango cram obtain minute";

export const CONTRACT_DATA: ContractSails = {
  programId: '0x17cf40e9dfde5ede9fd4c7314a25a63cb989751f8e3e3dd0d29c01baf31c6da6',
  idl: `
    type KeyringData = struct {
      address: str,
      encoded: str,
    };

    type KeyringEvent = enum {
      KeyringAccountSet,
      Error: KeyringError,
    };

    type KeyringError = enum {
      KeyringAddressAlreadyEsists,
      UserAddressAlreadyExists,
      UserCodedNameAlreadyExists,
      UserDoesNotHasKeyringAccount,
      KeyringAccountAlreadyExists,
      SessionHasInvalidCredentials,
      UserAndKeyringAddressAreTheSame,
    };

    type KeyringQueryEvent = enum {
      LastWhoCall: actor_id,
      SignlessAccountAddress: opt actor_id,
      SignlessAccountData: opt KeyringData,
    };

    type TrafficLightEvent = enum {
      Green,
      Yellow,
      Red,
      KeyringError: KeyringError,
    };

    type IoTrafficLightState = struct {
      current_light: str,
      all_users: vec struct { actor_id, str },
    };

    constructor {
      New : ();
    };

    service Keyring {
      BindKeyringDataToUserAddress : (user_address: actor_id, keyring_data: KeyringData) -> KeyringEvent;
      BindKeyringDataToUserCodedName : (user_coded_name: str, keyring_data: KeyringData) -> KeyringEvent;
      query KeyringAccountData : (keyring_address: actor_id) -> KeyringQueryEvent;
      query KeyringAddressFromUserAddress : (user_address: actor_id) -> KeyringQueryEvent;
      query KeyringAddressFromUserCodedName : (user_coded_name: str) -> KeyringQueryEvent;
    };

    service TrafficLight {
      Green : (user_coded_name: str) -> TrafficLightEvent;
      Red : (user_coded_name: str) -> TrafficLightEvent;
      Yellow : (user_coded_name: str) -> TrafficLightEvent;
      query TrafficLight : () -> IoTrafficLightState;
    };
  `
};