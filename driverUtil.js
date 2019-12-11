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
            new chrome.Options() // optionの設定 とても重要 
                .addArguments('headless')       // ヘッドレス
                .addArguments('no-sandbox')           // サンドボックスオプション無効
                .addArguments('disable-gpu')          // ハードウェアレンダリング無効
                .addArguments('disable-infobars')     // メニューバー非表示
                .addArguments('window-size=1920,1080') // FULLHDサイズ
                .setChromeBinaryPath("/bin/google-chrome")  // Chromeバリ成のパス
        )
        .build();
}