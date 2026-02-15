import crypto from 'crypto';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

function loadEnv() {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const lines = envContent.split('\n');
        lines.forEach(line => {
            const [key, value] = line.split('=').map(s => s.trim());
            if (key && !key.startsWith('#')) {
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

function md5c(text = "", _type = "lower") {
    const hash = crypto.createHash("md5").update(text, "utf-8").digest("hex");
    console.log("Hash", hash);
    return _type === "lower" ? hash.toLowerCase() : hash.toUpperCase();
}

function generateSignature(apiKey, apiPath) {
    const timestamp = new Date().getTime();
    console.log("date and time is", timestamp);
    // Signature is calculated as: path\r\ntoken\r\ntimestamp
    // IMPORTANT: Use literal \r\n (backslash-r backslash-n), not actual CR LF
    let signatureRaw = `${apiPath}\\r\\n${apiKey}\\r\\n${timestamp}`;
    let signature = md5c(signatureRaw);
    console.log("Signature Raw", signatureRaw);
    console.log("Signature", signature);
    return {
        "token": apiKey,
        "lang": "en",
        "timestamp": String(timestamp),
        "signature": signature,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/json"
    };

}

// Get API key from environment variable for security
const FOXESS_API_KEY = process.env.FOXESS_API_KEY || "YOUR_NEW_API_KEY_HERE";
const DEVICE_SN = process.env.DEVICE_SN || "YOUR_DEVICE_SN_HERE";
const FOXESS_DOMAIN_NAME = "https://www.foxesscloud.com";
const API_PATH = '/op/v1/device/detail';

async function getDeviceDetails() {
    try {
        const headers = generateSignature(FOXESS_API_KEY, API_PATH);
        console.log("Requesting device details...");
        
        const response = await axios.get(`${FOXESS_DOMAIN_NAME}${API_PATH}`, {
            params: { sn: DEVICE_SN },
            headers: headers
        });
        
        console.log("Device Details:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error("Error fetching device details:", error.response?.data || error.message);
    }
}

// Start the request
getDeviceDetails();

// Optional: Get real-time power data
async function getRealTimeData() {
    try {
        const API_PATH = '/op/v1/device/real/query';
        const headers = generateSignature(FOXESS_API_KEY, API_PATH);
        console.log("\nRequesting real-time data...");
        
        const response = await axios.post(`${FOXESS_DOMAIN_NAME}${API_PATH}`, {
            sns: [DEVICE_SN],
            variables: ["pvPower", "batPower", "meterPower2", "soc", "gridConsumption"]
        }, {
            headers: headers
        });
        
        if (response.data.result && response.data.result[0]) {
            console.log("Real-time Data:", JSON.stringify(response.data.result[0], null, 2));
        }
        return response.data;
    } catch (error) {
        console.error("Error fetching real-time data:", error.response?.data || error.message);
    }
}

// Uncomment to fetch real-time data
getRealTimeData();