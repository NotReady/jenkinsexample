const path = require('chromedriver').path;
const fs = require('fs');
const assert = require("assert");
const chrome = require('selenium-webdriver/chrome');
const { promisify } = require('util');
const webdriver = require("selenium-webdriver");
const { Builder, By, until } = webdriver;
const service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

let driver;

jest.setTimeout(60000);
// console.log(path);

// コンテンツサイズにウインドウを合わせてキャプチャをとる
async function takeScreentJust(driver, fileName, ext)
{
  console.log(timestamp() + ": takeScreenJust Started");

  let contentWidth = await driver.executeScript("return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);");
  let contentHeight = await driver.executeScript("return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);");

  console.log(timestamp() + ": takeScreenJust trace1");

  await driver.manage().window().setRect({
    width: contentWidth,
    height: contentHeight,
    // width: 800, 
    // height: 600,
  });
  
  console.log(timestamp() + ": takeScreenJust trace2");

  let base64 = await driver.takeScreenshot();

  console.log(timestamp() + ": takeScreenJust trace2-1");

  let buffer = Buffer.from(base64, 'base64');
  await promisify(fs.writeFile)(fileName + "." + ext, buffer);

  console.log(timestamp() + ": takeScreenJust trace3");

  await driver.manage().window().setRect({
    width: 1920,
    height: 1080,
  });
  
  console.log(timestamp() + ": takeScreenJust Ended");
}

function timestamp(){
  var dt = new Date();
  return dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
}

describe("デモ", () => {
  
  beforeAll(() => {
        var options = new chrome.Options();
        options.addArguments('headless');
        options.addArguments('no-sandbox');     
        options.addArguments('disable-gpu');
        options.addArguments('disable-infobars');
        options.addArguments('window-size=1920,1080');
        options.setChromeBinaryPath("/bin/google-chrome");
          
        driver = new Builder()
        .forBrowser('chrome')
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();
  });

  afterAll(() => {
    return driver.quit();
  });

  it("トップページ ページタイトル", async () => {


    console.log(timestamp() + ": trace1");

    // テスト対象のページへアクセス
    await driver.get(
        "https://www.securite.jp"
    );

    // トップページのロード待ち
    await driver.wait(until.titleContains('セキュリテ - インパクト投資プラットフォーム'), 10000);

    console.log(timestamp() + ": trace2");
    
    await driver.getTitle().then(function (title) {
      
      console.log(timestamp() + ": trace3");
      // @test title is match?
      assert.equal(title, "セキュリテ - インパクト投資プラットフォーム");
    });

    await takeScreentJust(driver, '001_top', 'png');

    console.log(timestamp() + ": trace4");
  });
  
  it("トップページ ログインページに遷移", async () => {

    await driver.findElement(By.linkText('ログイン')).click();
    await driver.wait(until.titleContains('ログイン'), 10000);
    
    /* @test title */ 
    await driver.getTitle().then(function (title) {
      assert.equal(title, "ログイン｜セキュリテ");
    });
    await takeScreentJust(driver, '002_login', 'png');
  });
  
  it("ログインページ ブランクフォームエラー", async () => {
    // フォームをブランクで送信
    await driver.findElement(By.xpath("//input[@value='ログイン']")).click();
    await takeScreentJust(driver, '003_loginfail', 'png');
    
    const errorMsg = await driver.findElement(By.className("error_msg")).getText();
    /* @test invalidate message */
    assert.equal(errorMsg, "ログインIDまたはパスワードを見直してください。");
  });

  it("ログインページ ログイン成功", async () => {
    // ログインフォームを入力してログイン
    await driver.findElement(By.xpath("//input[@name='msuser']")).sendKeys("msohashi");
    await driver.findElement(By.xpath("//input[@name='mspwd']")).sendKeys("YaIkani13");
    await driver.findElement(By.xpath("//input[@value='ログイン']")).click();
    
    /* @test title */
    await driver.getTitle().then(function (title) {
      assert.equal(title, "マイページ｜セキュリテ");
    });
    await takeScreentJust(driver, '004_loginsuccess', 'png');
  });

  it("マイページ マイアカウント遷移", async () => {
    // マイアカウントリンクをクリックして、マイアカウントページを表示する
    await driver.findElement(By.xpath("//a[contains(text(), 'マイアカウント')]")).click();

    /* @test title */
    await driver.getTitle().then(function (title) {
      assert.equal(title, "マイアカウント｜セキュリテ");
    });
    await takeScreentJust(driver, '005_myaccount', 'png');
  });
  
});
