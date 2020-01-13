var fs = require('fs');
var AndroidManifest = require('androidmanifest');
var iOSPList = require('plist');

module.exports = function($logger, $projectData, hookArgs) {
    var appPackage = require($projectData.projectFilePath);
    var appVersion =
        (appPackage.nativescript && appPackage.nativescript.version) ||
        appPackage.version;
    let appVersionNumber =
        (appPackage.nativescript && appPackage.nativescript.versionNumber) ||
        appPackage.versionNumber;
    if (!appVersion) {
        $logger.warn(
            'Nativescript version is not defined. Skipping set native package version.'
        );
        return;
    }

    var platformsData = getPlatformsData($injector);
    var platform = (
        hookArgs.platform ||
        (hookArgs.prepareData && hookArgs.prepareData.platform)
    ).toLowerCase();
    $logger.info(`Platform: ${platform}`);

    var platformData = platformsData.getPlatformData(platform);
    $logger.info(
        `platformData.configurationFilePath: ${
            platformData.configurationFilePath
        }`
    );
    if (platform == 'android') {
        var manifest = new AndroidManifest().readFile(
            platformData.configurationFilePath
        );

        // transforms e.g. "1.2.3" into 102003.
        // transforms e.g. "10.25.367" into 1025367.
        let versionCode = appVersion
            .split('.')
            .reduce(
                (acc, v, i, a) =>
                acc * Math.pow(10, i + 1) + (v * 1),
                0
            );

        if (appVersionNumber) {
            versionCode = appVersionNumber.replace('.', '') + versionCode;
        }

        manifest.$('manifest').attr('android:versionCode', versionCode);
        manifest.$('manifest').attr('android:versionName', appVersion);
        manifest.writeFile(platformData.configurationFilePath);
    } else if (platform == 'ios') {
        var plist = iOSPList.parse(
            fs.readFileSync(platformData.configurationFilePath, 'utf8')
        );
        plist.CFBundleShortVersionString = appVersion;
        plist.CFBundleVersion = appVersionNumber;
        fs.writeFileSync(
            platformData.configurationFilePath,
            iOSPList.build(plist)
        );
    }
};

function getPlatformsData($injector) {
    try {
        return $injector.resolve('platformsData');
    } catch (err) {
        return $injector.resolve('platformsDataService');
    }
}
