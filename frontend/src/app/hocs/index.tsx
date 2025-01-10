import {
  ApiProvider as GearApiProvider,
  AlertProvider as GearAlertProvider,
  AccountProvider,
  ProviderProps,
} from '@gear-js/react-hooks';
import { ComponentType } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ADDRESS } from '@/app/consts';
import { Alert, alertStyles } from '@/components/ui/alert';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { DAppContextProvider, SailsProvider } from "@/Context";

function GoogleAuthProvider({ children }: ProviderProps) {
  return <GoogleOAuthProvider clientId='769595087840-thaa1p2cogfcc4hikqje459rdfnnkbgc.apps.googleusercontent.com'>{children}</GoogleOAuthProvider>;
}

function ApiProvider({ children }: ProviderProps) {
  return <GearApiProvider initialArgs={{ endpoint: ADDRESS.NODE }}>{children}</GearApiProvider>;
}

function AlertProvider({ children }: ProviderProps) {
  return (
    <GearAlertProvider template={Alert} containerClassName={alertStyles.root}>
      {children}
    </GearAlertProvider>
  );
}

const providers = [
  GoogleAuthProvider,
  BrowserRouter, 
  DAppContextProvider,
  SailsProvider,
  AlertProvider, 
  ApiProvider, 
  AccountProvider
];

function withProviders(Component: ComponentType) {
  return () => providers.reduceRight((children, Provider) => <Provider appName='dApp template'>{children}</Provider>, <Component />);
}

export { withProviders };