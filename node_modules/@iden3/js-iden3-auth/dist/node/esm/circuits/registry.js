import { AuthPubSignalsV2 } from '../circuits/authV2.js';
import { AtomicQueryMTPV2PubSignalsVerifier } from '../circuits/atomicMtpV2.js';
import { AtomicQuerySigV2PubSignalsVerifier } from '../circuits/atomicSigV2.js';
import { AtomicQueryV3PubSignalsVerifier } from '../circuits/atomicV3.js';
import { LinkedMultiQueryVerifier } from '../circuits/linkedMultiQuery.js';
const authV2 = AuthPubSignalsV2;
const credentialAtomicQueryMTPV2 = AtomicQueryMTPV2PubSignalsVerifier;
const credentialAtomicQuerySigV2 = AtomicQuerySigV2PubSignalsVerifier;
const credentialAtomicQueryV3 = AtomicQueryV3PubSignalsVerifier;
const linkedMultiQuery10 = LinkedMultiQueryVerifier;
const supportedCircuits = {
    authV2,
    credentialAtomicQueryMTPV2,
    credentialAtomicQuerySigV2,
    credentialAtomicQueryV3,
    linkedMultiQuery10
};
export class Circuits {
    static getCircuitPubSignals(id) {
        id = id.split('-')[0];
        return supportedCircuits[id];
    }
}
