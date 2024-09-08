// from Android Eufy App
const EUFY_CLIENT_ID = "eufyhome-app";
const EUFY_CLIENT_SECRET = "GQCpr9dSp3uQpsOMgJ4xQ";

// from capturing traffic
const EUFY_BASE_URL = "https://home-api.eufylife.com/v1/";

// presumably obtained from the Android device's status
const PLATFORM = "sdk_gphone64_arm64";
const LANGUAGE = "en";
const TIMEZONE = "Europe/London";

// from Eufy Home Android app
const TUYA_CLIENT_ID = "yx5v9uc3ef9wg3v9atje";

// for initial logins, any region works; proper URL comes from the login response
const TUYA_INITIAL_BASE_URL = "https://a1.tuyaeu.com";

// Eufy Home "TUYA_SMART_SECRET" Android app metadata value
const APPSECRET = "s8x78u7xwymasd9kqa7a73pjhxqsedaj";

// obtained using instructions at https://github.com/nalajcie/tuya-sign-hacking
const BMP_SECRET = "cepev5pfnhua4dkqkdpmnrdxx378mpjr";

// turns out this is not used by the Eufy app but is from the Eufy Home app in case it's useful
// const APP_CERT_HASH = "A4:0D:A8:0A:59:D1:70:CA:A9:50:CF:15:C1:8C:45:4D:47:A3:9B:26:98:9D:8B:64:0E:CD:74:5B:A7:1B:F5:DC";

// HMAC key: "A" is used instead of the app certificate hash
const EUFY_HMAC_KEY = Buffer.from(`A_${BMP_SECRET}_${APPSECRET}`, 'utf-8');

// from https://github.com/mitchellrj/eufy_robovac/issues/1
const TUYA_PASSWORD_KEY = Buffer.from([36, 78, 109, 138, 86, 172, 135, 145, 36, 67, 45, 139, 108, 188, 162, 196]);
const TUYA_PASSWORD_IV = Buffer.from([119, 36, 86, 242, 167, 102, 76, 243, 57, 44, 53, 151, 233, 62, 87, 71]);

module.exports = {
    EUFY_CLIENT_ID,
    EUFY_CLIENT_SECRET,
    EUFY_BASE_URL,
    PLATFORM,
    LANGUAGE,
    TIMEZONE,
    TUYA_CLIENT_ID,
    TUYA_INITIAL_BASE_URL,
    APPSECRET,
    BMP_SECRET,
    EUFY_HMAC_KEY,
    TUYA_PASSWORD_KEY,
    TUYA_PASSWORD_IV
};
