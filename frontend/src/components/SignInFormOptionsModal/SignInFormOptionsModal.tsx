import { Modal } from "@gear-js/vara-ui";
import { Button } from "@chakra-ui/react";
import { SignlessForm } from "../SignlessForm/SignlessForm";
import { GoogleAuthButton } from "../GoogleAuthButton/GoogleAuthButton";
import { useSailsCalls } from "@/app/hooks";
import { useState } from "react";
import { addTokensToVoucher, encryptString, renewVoucher } from "@/app/utils";
import { KeyringPair } from "@polkadot/keyring/types";
import { decodeAddress, HexString } from "@gear-js/api";
import { useAlert } from "@gear-js/react-hooks";
import { useDappContext } from "@/Context";

interface Props {
    closeForm: () => void;
    onGetKeyring?: any;
};

export const SignInFormOptionsModal = ({ closeForm, onGetKeyring }: Props) => {
    const sails = useSailsCalls();
    const alert = useAlert();
    const [signlessFormOpen, setsignlessFormOpen] = useState(false);
    const [userIsSignIn, setUserIsSignIn] = useState(false);
    const {
        setSignlessAccount,
        setCurrentVoucherId,
        setNoWalletSignlessAccountName
    } = useDappContext();

    const checkUpdatesForVoucher = (address: HexString, voucherId: HexString): Promise<void> => {
            return new Promise(async (resolve, reject) => {
                if (!sails) {
                    alert.error();
                    reject('SailsCalls is not started');
                    return;
                }
    
                try {
                    await renewVoucher(
                        sails,
                        address,
                        voucherId,
                        1_200, // Amout of blocks (one hour)
                        {
                            onLoad() { alert.info('Will renew the voucher') },
                            onSuccess() { alert.success('Voucher renewed!') },
                            onError() { alert.error('Error while renewing voucher') }
                        }
                    );
        
                    await addTokensToVoucher(
                        sails,
                        address,
                        voucherId,
                        1,
                        2,
                        {
                            onLoad() { alert.info('Will add tokens to voucher') },
                            onSuccess() { alert.success('Tokens added to voucher') },
                            onError() { alert.error('Error while adding tokens to voucher') }
                        }
                    );
                    resolve();
                } catch(e) {
                    alert.error('Error while updating signless account voucher');
                    reject(e);
                    return;
                } 
            });
        }

    const setWalletlessAccount = async (name: string, password: string) => { 
        if (!sails) {
            console.error('SailsCalls is not ready');
            return;
        }

        const encryptedName = encryptString(name);  
        const encryptedPassword = encryptString(password);

        let contractState: any = await sails.query(
            'Keyring/KeyringAddressFromUserCodedName',
            {
                callArguments: [
                    encryptedName
                ]
            }
        );

        const { signlessAccountAddress } = contractState;
        let walletlessAccount: KeyringPair;
        let voucherId: HexString;

        if (!signlessAccountAddress) {
            const newWalletlessAccount = await sails.createNewKeyringPair(name);
            const lockedWalletLessAccount = sails.lockkeyringPair(
                newWalletlessAccount, 
                encryptedPassword
            );
            const formatedLockedWalletlessAccount = sails.modifyPairToContract(lockedWalletLessAccount);
            walletlessAccount = newWalletlessAccount;
            voucherId = await sails.createVoucher(
                decodeAddress(newWalletlessAccount.address),
                2, // Initial amount of tokens
                30, // Initial expiration time (30 blocks - 10 minutes)
                {
                    onLoad() { alert.info('Will issue voucher to account...') },
                    onSuccess() { alert.success('Voucher created for account!') },
                    onError() { alert.error('Error while issue voucher to account') }
                }
            );
            
            try {
                await sails.command(
                    'Keyring/BindKeyringDataToUserCodedName',
                    newWalletlessAccount,
                    {
                        voucherId: voucherId,
                        callArguments: [
                            encryptedName,
                            formatedLockedWalletlessAccount
                        ],
                        callbacks: {
                            onLoad() { alert.info('Will send a message') },
                            onSuccess() { alert.success('Signless account send!') },
                            onBlock(blockHash) { alert.info(`Message is in block: ${blockHash}`) },
                            onError() { alert.error('Error while sending singless account') }
                        }
                    }
                );
            } catch(e) {
                console.error('Error while sending walletless account');
                console.error(e);
                return;
            }
        } else {
            contractState = await sails.query(
                'Keyring/KeyringAccountData',
                {
                    callArguments: [
                        signlessAccountAddress
                    ]
                }
            );

            const { signlessAccountData } = contractState;

            try {
                const lockedSignlessData = sails.formatContractSignlessData(
                    signlessAccountData,
                    name
                );
                walletlessAccount = sails.unlockKeyringPair(
                    lockedSignlessData,
                    encryptedPassword
                );
                const decodedSignlessAccountAddress = decodeAddress(walletlessAccount.address);
                const vouchersId = await sails.vouchersInContract(
                    decodedSignlessAccountAddress
                );

                await checkUpdatesForVoucher(
                    decodedSignlessAccountAddress,
                    vouchersId[0]
                );

                voucherId = vouchersId[0];
            } catch(e) {
                alert.error('Incorrect password for signless account!');
                console.error(e);
                return;
            }
        }

        setSignlessAccount(walletlessAccount);
        setCurrentVoucherId(voucherId);
        setNoWalletSignlessAccountName(name);
        onGetKeyring && onGetKeyring(encryptedName, walletlessAccount, voucherId);
        setUserIsSignIn(false);
        closeForm();
    }

    return (
        <>
            {
                !signlessFormOpen && 
                <Modal
                    close={() => {
                        if (!userIsSignIn) closeForm();
                        else console.error('Cant close form while user is signing in');
                    }}
                    heading="Sign in with:"
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}
                    >
                        <Button
                            backgroundColor={'green.300'}
                            onClick={() => setsignlessFormOpen(true)}
                            isLoading={userIsSignIn}
                        >
                            User and password
                        </Button>
                        <GoogleAuthButton 
                            onSignInSuccess={(userData) => {
                                const password = userData.name + userData.email + userData.id;
                                setWalletlessAccount(userData.name, password);
                            }}
                            onSignInError={(error) => {
                                setUserIsSignIn(false);
                                console.error('Login Failed:', error);
                            }}
                            onUserIsSignIn={() => setUserIsSignIn(true)}
                        />
                        <Button
                            isLoading={userIsSignIn}
                            onClick={closeForm}
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal>
            }
            {
                signlessFormOpen &&
                <SignlessForm 
                    closeForm={() => setsignlessFormOpen(false)} 
                    onGetKeyring={(userCodedName: string, keyring: KeyringPair, voucherId: HexString) => {
                        onGetKeyring && onGetKeyring(userCodedName, keyring, voucherId);
                        closeForm();
                    }}
                />
            }
        </>
    );
}

