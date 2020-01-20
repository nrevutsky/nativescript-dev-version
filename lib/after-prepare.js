var fs = require('fs');
var AndroidManifest = require('androidmanifest');
var iOSPList = require('plist');

Date.prototype.yyyymmdd = function() {
    const mm = this.getMonth() + 1; // getMonth() is zero-based
    const dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
};
  
  
module.exports = function($logger, $projectData, hookArgs) {
    var isAppVersionNumber = true;
    var appPackage = require($projectData.projectFilePath);
    var appVersion =
        (appPackage.nativescript && appPackage.nativescript.version) ||
        appPackage.version;
    let appVersionNumber =
        (appPackage.nativescript && appPackage.nativescript.versionNumber) ||
        appPackage.versionNumber;
    if (!appVersionNumber) {
        isAppVersionNumber = false;
        appVersionNumber = (new Date()).yyyymmdd(); 
    }
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

        // Use "YYYYMMDD" e.g. 2020 Jan 15 into 20200115
        let versionCode = appVersionNumber;

        if (isAppVersionNumber) {
        // transforms e.g. "1.2.3" into 102003.
        // transforms e.g. "10.25.367" into 1025367.
            versionCode = appVersion
                .split('.')
                .reduce(
                    (acc, v, i, a) =>
                    acc * Math.pow(10, i + 1) + (v * 1),
                    0
                );

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
