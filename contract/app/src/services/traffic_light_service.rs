// necesary cretes
use sails_rs::{
    prelude::*,
    gstd::msg
};

// import the state
use crate::states::traffic_light_state::{
    TrafficLightState,
    IoTrafficLightState
};

// import the keyring accounts state
use keyring_service::{
    state::KeyringAccounts,
    service_enums::KeyringError
};

// Traffic light service struct to build the service 
#[derive(Default)]
pub struct TrafficLightService;

// Impl for seed related function to init the state
impl TrafficLightService {
    // Related function to init the service state (call only once)
    // Another related function is created that initializes the state 
    // to avoid unnecessary imports in the "lib.rs" file, you can see 
    // that it remains more "structured"
    pub fn seed() {
        TrafficLightState::init_state();
    }
}

// Trffic light service
#[service]
impl TrafficLightService {
    // Service constructor
    pub fn new() -> Self {
        Self
    }

    // Remote call "green" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn green(
        &mut self,
        user_coded_name: String
    ) -> TrafficLightEvent {
        // first check if the user is registered
        let caller = msg::source();
        // Check if the user coded name are linked to the keyring address account
        let result = KeyringAccounts::state_ref()
            .check_keyring_address_by_user_coded_name(
                caller, 
                user_coded_name
            );

        // If the user coded name are not linked, return an error
        if let Err(error) = result {
            return TrafficLightEvent::KeyringError(error);
        }

        let current_light = "Green".to_string();

        // Changing state
        TrafficLightState::state_mut()
            .current_light = current_light.clone();

        TrafficLightState::state_mut()
            .all_users
            .insert(msg::source().into(), current_light);

        // returning the response
        TrafficLightEvent::Green
    }

    // Remote call "yellow" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn yellow(
        &mut self,
        user_coded_name: String
    ) -> TrafficLightEvent {
        // first check if the user is registered
        let caller = msg::source();
        // Check if the user coded name are linked to the keyring address account
        let result = KeyringAccounts::state_ref()
            .check_keyring_address_by_user_coded_name(
                caller, 
                user_coded_name
            );

        // If the user coded name are not linked, return an error
        if let Err(error) = result {
            return TrafficLightEvent::KeyringError(error);
        }

        let current_light = "Yellow".to_string();

        // Changing state
        TrafficLightState::state_mut()
            .current_light = current_light.clone();
        TrafficLightState::state_mut()
            .all_users
            .insert(msg::source().into(), current_light);

        // returning the response
        TrafficLightEvent::Yellow
    }

    // Remote call "yellow" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn red(
        &mut self,
        user_coded_name: String
    ) -> TrafficLightEvent {
        // first check if the user is registered
        let caller = msg::source();
        // Check if the user coded name are linked to the keyring address account
        let result = KeyringAccounts::state_ref()
            .check_keyring_address_by_user_coded_name(
                caller, 
                user_coded_name
            );

        // If the user coded name are not linked, return an error
        if let Err(error) = result {
            return TrafficLightEvent::KeyringError(error);
        }

        let current_light = "Red".to_string();

        // Changing state
        TrafficLightState::state_mut()
            .current_light = current_light.clone();
        TrafficLightState::state_mut()
            .all_users
            .insert(msg::source().into(), current_light);

        // returning the response
        TrafficLightEvent::Red
    }

    // Remote call "traffic_light" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a query, keeping everything unchanged and returning some data. (&self)
    pub fn traffic_light(&self) -> IoTrafficLightState {
        TrafficLightState::state_ref()
            .to_owned()
            .into()
    }
}

// struct to use as a response to the user
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]

pub enum TrafficLightEvent {
    Green,
    Yellow,
    Red,
    KeyringError(KeyringError)
}




