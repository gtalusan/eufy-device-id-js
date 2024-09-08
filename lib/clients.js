const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');
const { v4: uuidv4 } = require('uuid');
const {
    EUFY_BASE_URL,
    EUFY_CLIENT_ID,
    EUFY_CLIENT_SECRET,
    EUFY_HMAC_KEY,
    LANGUAGE,
    PLATFORM,
    TIMEZONE,
    TUYA_CLIENT_ID,
    TUYA_INITIAL_BASE_URL
} = require('./constants');
const { createPasswordInnerCipher, shuffledMD5, unpaddedRSA } = require('./crypto');

const DEFAULT_EUFY_HEADERS = {
    'User-Agent': 'EufyHome-Android-2.4.0',
    'timezone': TIMEZONE,
    'category': 'Home',
    'token': '',
    'uid': '',
    'openudid': PLATFORM,
    'clientType': '2',
    'language': LANGUAGE,
    'country': 'US',
    'Accept-Encoding': 'gzip'
};

const DEFAULT_TUYA_HEADERS = {
    'User-Agent': 'TY-UA=APP/Android/2.4.0/SDK/null'
};

const SIGNATURE_RELEVANT_PARAMETERS = [
    'a', 'v', 'lat', 'lon', 'lang', 'deviceId', 'appVersion', 'ttid', 'isH5',
    'h5Token', 'os', 'clientId', 'postData', 'time', 'requestId', 'et', 'n4h5', 'sid', 'sp'
];

const DEFAULT_TUYA_QUERY_PARAMS = {
    appVersion: '2.4.0',
    deviceId: '',
    platform: PLATFORM,
    clientId: TUYA_CLIENT_ID,
    lang: LANGUAGE,
    osSystem: '12',
    os: 'Android',
    timeZoneId: TIMEZONE,
    ttid: 'android',
    et: '0.0.1',
    sdkVersion: '3.0.8cAnker'
};

class EufyHomeSession {
    constructor(email, password) {
        this.email = email;
        this.password = password;
        this.base_url = EUFY_BASE_URL;
        this.session = axios.create({
            headers: { ...DEFAULT_EUFY_HEADERS }
        });
    }

    url(path) {
        return new URL(path, this.base_url).href;
    }

    async login() {
        const response = await this.session.post(this.url('user/email/login'), {
            client_Secret: EUFY_CLIENT_SECRET,
            client_id: EUFY_CLIENT_ID,
            email: this.email,
            password: this.password
        });

        const data = response.data;
        this.session.defaults.headers['uid'] = data.user_info.id;
        this.session.defaults.headers['token'] = data.access_token;
        this.base_url = data.user_info.request_host;
    }

    async _request(method, url, options = {}) {
        if (!this.session.defaults.headers['token'] || !this.session.defaults.headers['uid']) {
            await this.login();
        }
        const response = await this.session.request({ method, url, ...options });
        return response.data;
    }

    getDevices() {
        return this._request('GET', this.url('device/v2')).then(data => data.devices || []);
    }

    getUserInfo() {
        return this._request('GET', this.url('user/info')).then(data => data.user_info);
    }
}

class TuyaAPISession {
    constructor(username, countryCode) {
        this.username = username;
        this.countryCode = countryCode;
        this.session = axios.create({
            headers: { ...DEFAULT_TUYA_HEADERS }
        });
        this.defaultQueryParams = { ...DEFAULT_TUYA_QUERY_PARAMS };
        this.defaultQueryParams.deviceId = this.device_id = this.generateNewDeviceId();
        this.base_url = TUYA_INITIAL_BASE_URL;
    }

    url(path) {
        return new URL(path, this.base_url).href;
    }

    generateNewDeviceId() {
        const expectedLength = 44;
        const base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const deviceIdDependentPart = '8534c8ec0ed0'; // Example from an Android Virtual Device

        return deviceIdDependentPart + Array.from({ length: expectedLength - deviceIdDependentPart.length }, () => {
            return base64Characters.charAt(Math.floor(Math.random() * base64Characters.length));
        }).join('');
    }

    encodePostData(data) {
        return data ? JSON.stringify(data) : '';
    }

    getSignature(queryParams, encodedPostData) {
        const params = { ...queryParams };
        if (encodedPostData !== "{}") {
            params.postData = encodedPostData;
        }

        const sortedPairs = Object.entries(params).sort();
        const filteredPairs = sortedPairs.filter(([key]) => SIGNATURE_RELEVANT_PARAMETERS.includes(key));

        const message = filteredPairs.map(([key, value]) => {
            return key + '=' + (key === 'postData' ? shuffledMD5(value) : value);
        }).join('||');

        return crypto.createHmac('sha256', EUFY_HMAC_KEY).update(message).digest('hex');
    }

    async _request(action, version = '1.0', data = {}, queryParams = {}, requiresSession = true) {
        if (!this.session_id && requiresSession) {
            await this.acquireSession();
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const requestId = uuidv4();

        const extraQueryParams = {
            time: currentTime.toString(),
            requestId: requestId.toString(),
            a: action,
            v: version,
            ...queryParams
        };

        const combinedQueryParams = { ...this.defaultQueryParams, ...extraQueryParams };
        const encodedPostData = this.encodePostData(data);
        const url = new URL(this.url('/api.json'));
        url.search = new URLSearchParams({
            ...combinedQueryParams,
            sign: this.getSignature(combinedQueryParams, encodedPostData)
        });

        const response = await this.session.post(url.toString(), Object.keys(data).length > 0 ? qs.stringify({ postData: encodedPostData }) : undefined);
        if (!response.data.result) {
            throw new Error(`No 'result' key in the response: ${JSON.stringify(response.data)}`);
        }

        return response.data.result;
    }

    async acquireSession() {
        const sessionResponse = await this.requestSession(this.username, this.countryCode);
        this.session_id = this.defaultQueryParams.sid = sessionResponse.sid;
        this.base_url = sessionResponse.domain.mobileApiUrl;
    }

    async requestToken(username, countryCode) {
        return this._request('tuya.m.user.uid.token.create', '1.0', { uid: username, countryCode }, {}, false);
    }

    determinePassword(username) {
        const paddedSize = 16 * Math.ceil(username.length / 16);
        const passwordUid = username.padStart(paddedSize, '0');

        const cipher = createPasswordInnerCipher();
        let encryptedUid = cipher.update(passwordUid, 'utf-8');
     //   encryptedUid = Buffer.concat([encryptedUid, cipher.final()]);

        return crypto.createHash('md5').update(encryptedUid.toString('hex').toUpperCase()).digest('hex');
    }

    async requestSession(username, countryCode) {
        const password = this.determinePassword(username);
        const tokenResponse = await this.requestToken(username, countryCode);

        const encryptedPassword = unpaddedRSA(
            parseInt(tokenResponse.exponent),
            parseInt(tokenResponse.publicKey),
            Buffer.from(password, 'utf-8')
        );

        const data = {
            uid: username,
            createGroup: true,
            ifencrypt: 1,
            passwd: encryptedPassword.toString('hex'),
            countryCode,
            options: '{"group": 1}',
            token: tokenResponse.token
        };

        return this._request('tuya.m.user.uid.password.login.reg', '1.0', data, {}, false);
    }

    listHomes() {
        return this._request('tuya.m.location.list', '2.1');
    }

    listDevices(homeId) {
        return this._request('tuya.m.my.group.device.list', '1.0', {}, { gid: homeId });
    }
}

module.exports = { EufyHomeSession, TuyaAPISession };
