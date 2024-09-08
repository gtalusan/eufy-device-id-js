# Eufy device ID & key grabber

This Javascript program allows you to obtain the device ID & local key for your Eufy devices without having to rely on running an old version of their Android app.

## Usage/TLDR:

```shell
node index.js "<EUFY ACCOUNT EMAIL>" "<EUFY ACCOUNT PASSWORD>"
```

You will get the following output:

```
Home: <home ID>
Device: RoboVac, device ID <device ID>, local key <local key>
```

It will list all the devices in all the "homes" (though I am actually not sure if you can have more than one home in Eufy) on your account.

## Credits & Thanks

* https://github.com/markbajaj/eufy-device-id-python
* https://github.com/mitchellrj/eufy_robovac
* https://github.com/nalajcie/tuya-sign-hacking
* https://github.com/TuyaAPI/cloud

And the other amazing people who've shown interest in this project and even contributed to it. ❤️


*****This is a ChatGPT port of (eufy-device-id-grabber)[https://github.com/markbajaj/eufy-device-id-python] with some minor bug fixes.


*****THIS WAS ORIGINALLY ON https://gitlab.com/Rjevski/eufy-device-id-and-local-key-grabber AND IS NO LONGER AVAILABLE THERE. This is a clone of that repo.
