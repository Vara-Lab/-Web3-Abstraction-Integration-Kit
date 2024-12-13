import { HexString } from '@gear-js/api';

interface ContractSails {
  programId: HexString,
  idl: string
}

export const ACCOUNT_ID_LOCAL_STORAGE_KEY = 'account';

export const ADDRESS = {
  NODE: 'wss://testnet.vara.network', // import.meta.env.VITE_NODE_ADDRESS,
};

export const ROUTES = {
  HOME: '/',
  EXAMPLES: '/examples',
  NOTFOUND: '*',
};

// To use the example code, enter the details of the account that will pay the vouchers, etc. (name and mnemonic)
export const sponsorName = "";
export const sponsorMnemonic = "";

export const CONTRACT_DATA: ContractSails = {
  programId: '0x285b178b5ec7720e8ae614e2dc032b86c0135e8a8579fe80c07ab655062e791b',
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
      Green : () -> TrafficLightEvent;
      Red : () -> TrafficLightEvent;
      Yellow : () -> TrafficLightEvent;
      query TrafficLight : () -> IoTrafficLightState;
    };
  `
};