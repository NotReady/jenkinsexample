const date = require("date-and-time");
const fs = require("fs-extra");
const path = require("path");
const resemble = require("resemblejs");
const pathOfChromeDriver = require("chromedriver").path;
// expect使うなら不要↓
const assert = require("assert");
const chrome = require("selenium-webdriver/chrome");
const { promisify } = require("util");
const webdriver = require("selenium-webdriver");
const { Builder, By, until } = webdriver;
const service = new chrome.ServiceBuilder(pathOfChromeDriver).build();
chrome.setDefaultService(service);

let driver;

jest.setTimeout(60000);
// console.log(pathOfChromeDriver);

// コンテンツサイズにウインドウを合わせてキャプチャをとる
async function takeScreentJust(driver, fileName, ext)
{
  console.log(timestamp() + ": takeScreenJust Started");

  let contentWidth = await driver.executeScript("return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);");
  let contentHeight = await driver.executeScript("return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);");
  
  await driver.manage().window().setRect({
    width: contentWidth,
    height: contentHeight,
    // width: 800, 
    // height: 600,
  });

  console.log(timestamp() + ": takeScreenJust pagesized window");

  let base64 = await driver.takeScreenshot();

  console.log(timestamp() + ": takeScreenJust taked screenshot");

  let buffer = Buffer.from(base64, 'base64');
  //await promisify(fs.writeFile)(fileName + "." + ext, buffer);
  const pathFileNameNewer = nameNewDir + fileName + "." + ext;
  const pathFileNameDiff = nameNewDiffDir + fileName + "." + ext;
  await promisify(fs.writeFile)(pathFileNameNewer, buffer); // 保存

  console.log(timestamp() + ": takeScreenJust flushed screenshot");

  await driver.manage().window().setRect({
    width: 1920,
    height: 1080,
  });

  console.log(timestamp() + ": takeScreenJust defaultsized window");

  const pathFileNamePrevious = namePreviousDir + fileName + "." + ext;
  
  if( fs.existSync(pathFileNamePrevious) == true ){
    // 最新と一つ前のスクショを取得
    const imageBefore = fs.readFileSync(pathFileNamePrevious);
    const imageAfter  = fs.readFileSync(pathFileNameNewer);

    console.log(timestamp() + ": takeScreenJust buffered screenshot");

    // 比較
    var misMatchPercentage = 0;
    await resemble(imageAfter).compareTo(imageBefore)
        .ignoreColors()
        .onComplete(function (data){
          fs.writeFileSync(pathFileNameDiff, data.getBuffer());
          console.log(data);
          misMatchPercentage = data.rawMisMatchPercentage;
        });

    console.log("misMatchPercentage: " + misMatchPercentage);
    expect(misMatchPercentage).toBeLessThan(1); 
  }
  
  console.log(timestamp() + ": takeScreenJust Ended");
}

function timestamp(){
  const  dt = new Date();
  return dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
  // return (new Date()).toFormat("YYYYMMDDHH24MISS");
}

describe("デモ", () => {
  
  beforeAll(() => {
    
        // chromeのヘッドレスオプション
        var options = new chrome.Options();
        options.addArguments('headless');
        options.addArguments('no-sandbox');     
        options.addArguments('disable-gpu');
        options.addArguments('disable-infobars');
        options.addArguments('window-size=1920,1080');
        options.setChromeBinaryPath("/bin/google-chrome");
          
        // オプションを設定してchromewoを起動
        driver = new Builder()
        .forBrowser('chrome')
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options)
        .build();
        
        // スクショ用のdir作成
        global.now = new Date();
        const parentDir = "screen_shot/";
        const nameFile = "resemblejstest";//path.basename(__filename, path.extname(__filename));
        const nameDirsHistory = fs.readdirSync(parentDir);
        global.namePreviousDir = parentDir + nameDirsHistory[nameDirsHistory.length-1] + "/";
        global.nameFilePrevious = namePreviousDir + nameFile + ".png";
        global.nameNewDir = parentDir + date.format(now, 'YYYYMMDDHHmmss').toString() + "/";
        global.nameNewDiffDir = nameNewDir + "diff/";
    
        fs.mkdirsSync(nameNewDir);
        fs.mkdirsSync(nameNewDiffDir);
    
        global.nameFileNew = nameNewDir + nameFile + ".png";
  });

  afterAll(() => {
    return driver.quit();
  });

  it("トップページ ページタイトル", async () => {


    console.log(timestamp() + ": trace1");

    // テスト対象のページへアクセス
    await driver.get("https://www.securite.jp");

    // トップページのロード待ち
    //await driver.wait(until.titleContains('セキュリテ - インパクト投資プラットフォーム'), 10000);

    console.log(timestamp() + ": trace2");
    
    await driver.getTitle().then(function (title) {
      
      console.log(timestamp() + ": trace3");
      // @test title is match?
      // assert.equal(title, "セキュリテ - インパクト投資プラットフォーム");
      expect(title).toBe("セキュリテ - インパクト投資プラットフォーム");
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
  
  //
  // it("ログインページ ログイン成功", async () => {
  //   // ログインフォームを入力してログイン
  //   await driver.findElement(By.xpath("//input[@name='msuser']")).sendKeys("msohashi");
  //   await driver.findElement(By.xpath("//input[@name='mspwd']")).sendKeys("YaIkani13");
  //   await driver.findElement(By.xpath("//input[@value='ログイン']")).click();
  //  
  //   /* @test title */
  //   await driver.getTitle().then(function (title) {
  //     assert.equal(title, "マイページ｜セキュリテ");
  //   });
  //   await takeScreentJust(driver, '004_loginsuccess', 'png');
  // });
  //
  // it("マイページ マイアカウント遷移", async () => {
  //   // マイアカウントリンクをクリックして、マイアカウントページを表示する
  //   await driver.findElement(By.xpath("//a[contains(text(), 'マイアカウント')]")).click();
  //
  //   /* @test title */
  //   await driver.getTitle().then(function (title) {
  //     assert.equal(title, "マイアカウント｜セキュリテ");
  //   });
  //   await takeScreentJust(driver, '005_myaccount', 'png');
  // });
  
});
