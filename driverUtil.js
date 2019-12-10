const chrome = require("selenium-webdriver/chrome");
const pathOfChromeDriver = require("chromedriver").path;
const webdriver = require("selenium-webdriver");
const { Builder } = webdriver;

/**
 * セットアップ済のwebドライバを取得します。
 * @params typeDriver string webドライバ名
 */
module.exports.getDriver = function(typeDriver){

    // デフォルトを適応
    const service = new chrome.ServiceBuilder(pathOfChromeDriver).build();
    chrome.setDefaultService(service);
    
    // ヘッドレスオプションを設定してchromeを起動
    return  new Builder()
        .forBrowser('chrome')
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(
            new chrome.Options()
                .addArguments('headless')
                .addArguments('no-sandbox')
                .addArguments('disable-gpu')
                .addArguments('disable-infobars')
                .addArguments('window-size=1920,1080')
                .setChromeBinaryPath("/bin/google-chrome")
        )
        .build();
}