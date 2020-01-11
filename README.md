# Nativescript hook plugin to maintain native app version

This plugin takes the `version` and `versionNumber` properties from `package.json` and puts on the specific platform resources: `AndroidManifest.xml` file for the Android sources, and `Info.plist` for iOS sources.

This plugin is mainly a fork of [tralves/nativescript-dev-version](https://github.com/tralves/nativescript-dev-version).

Compatible with NS 6.

## How to use

```
$ tns plugin add nativescript-dev-version
```

The above command installs this module and installs the necessary NativeScript hooks.

Then, specify and maintain the desired release version on the `./package.json` file under the `nativescript.version` property, for example:

```json
{
  "nativescript": {
    "id": "org.nativescript.MySampleApp",
    "version": "1.2.3",
    "versionNumber": "1.2"
    ...
  },
  ...
}
```

or:

```json
{
  "version": "1.2.3",
  "versionNumber": "1.2"
  ...
}
```

When running `tns prepare ...` the hooks will take care of the native resources.

On iOS, your `Info.plist` will get:

```
<key>CFBundleShortVersionString</key>
<string>1.2</string>
<key>CFBundleVersion</key>
<string>1.2.3</string>
```

On Android, `AndroidManifest.xml` will have:

```
<manifest
  (...) android:versionCode="12102003" android:versionName="1.2.3"
```