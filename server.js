import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { auth, resolver } from "@iden3/js-iden3-auth";
import getRawBody from "raw-body";
import cors from "cors";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, "static")));
console.log("Static dir:", path.join(__dirname, "static"));
app.use(cors());

const requestMap = new Map();
const verificationStatus = new Map(); 

function generateSessionId() {
    return crypto.randomBytes(16).toString("hex");
}

app.get("/api/sign-in", (req, res) => {
    console.log("GET /api/sign-in");
    getAuthRequest(req, res);
});

app.post("/api/callback", (req, res) => {
    console.log("POST /api/callback");
    callback(req, res);
});

app.get("/api/status", (req, res) => {
    const sessionId = req.query.sessionId;
    const status = verificationStatus.get(sessionId);
    if (status && status.verified) {
        res.json({ verified: true, name: status.name, programName: status.programName });
    } else {
        res.json({ verified: false });
    }
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});

// --- logic ---

async function getAuthRequest(req, res) {
    const hostUrl = "https://myloginpage-production.up.railway.app";
    const sessionId = generateSessionId();
    const callbackURL = "/api/callback";
    const audience = "did:iden3:polygon:amoy:xFZ5sUp9y7cHfkz3pAk1Z4HNQTvCWQsTRBHk8Pjnq";

    const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;

    const request = auth.createAuthorizationRequest("University Access", audience, uri);

    const proofRequest = {
        id: 1,
        circuitId: "credentialAtomicQuerySigV2",
        query: {
            allowedIssuers: ["*"],
            type: "Certificate",
            context: "ipfs://QmYUFjEsNgpfqtnn2Lp3qTLZSxoddVZm1pPRGmfPrLMbhq",
            credentialSubject: {
                programName: {
                    $eq: "Computer Science"
                }
            }
        }
    };

    request.body.scope = [...(request.body.scope ?? []), proofRequest];
    requestMap.set(sessionId, request);
    verificationStatus.set(sessionId, { verified: false });

    
    return res.status(200).json({ ...request, sessionId });
}

async function callback(req, res) {
    const sessionId = req.query.sessionId;
    const raw = await getRawBody(req);
    const tokenStr = raw.toString().trim();

    const keyDIR = path.join(__dirname, "keys");

    const resolvers = {
        ["polygon:amoy"]: new resolver.EthStateResolver(
            "https://rpc-amoy.polygon.technology",
            "0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124"
        ),
        ["privado:main"]: new resolver.EthStateResolver(
            "https://rpc-mainnet.privado.id",
            "0x3C9acB2205Aa72A05F6D77d708b5Cf85FCa3a896"
        )
    };

    const authRequest = requestMap.get(sessionId);
    if (!authRequest) return res.status(400).send("No auth request found for this session");

    try {
        const verifier = await auth.Verifier.newVerifier({
            stateResolver: resolvers,
            circuitsDir: keyDIR,
            ipfsGatewayURL: "https://ipfs.io"
        });

        const opts = {
            AcceptedStateTransitionDelay: 5 * 60 * 1000
        };

        const authResponse = await verifier.fullVerify(tokenStr, authRequest, opts);

        const credential = authResponse?.verifiedCredentialsData?.[0]?.credentialSubject || {};
        const name = credential.StudentFullname || "";
        const programName = credential.programName || "";

        verificationStatus.set(sessionId, { verified: true, name, programName });

        return res.sendStatus(200);
    } catch (error) {
        console.error("❌ Verification error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}