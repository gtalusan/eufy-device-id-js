const { EufyHomeSession, TuyaAPISession } = require('./lib/clients');

const email = process.argv[2];
const password = process.argv[3];

(async () => {
  try {
    const eufyClient = new EufyHomeSession(email, password);
    const userInfo = await eufyClient.getUserInfo();

    const tuyaClient = new TuyaAPISession(`eh-${userInfo.id}`, userInfo.phone_code);

    const homes = await tuyaClient.listHomes();
    for (const home of homes) {
      console.log(`Home: ${home.groupId}`);

      const devices = await tuyaClient.listDevices(home.groupId);
      for (const device of devices) {
        console.log(`Device: ${device.name}, device ID ${device.devId}, local key ${device.localKey}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();
