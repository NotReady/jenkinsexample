const date = require("date-and-time");
const fs = require("fs-extra");
const resemble = require("resemblejs");
const pathOfChromeDriver = require("chromedriver").path;
const chrome = require("selenium-webdriver/chrome");
const { promisify } = require("util");
const webdriver = require("selenium-webdriver");
const { Builder, By, until } = webdriver;
const service = new chrome.ServiceBuilder(pathOfChromeDriver).build();
const cpModule  = require("../cp.js");

chrome.setDefaultService(service);

let driver;

jest.setTimeout(60000);
// console.log(pathOfChromeDriver);

// コンテンツサイズにウインドウを合わせてキャプチャをとる
async function takeScreentJust(driver, fileName, ext)
{
  putLog("takeScreenJust Started");

  let contentWidth = await driver.executeScript("return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);");
  let contentHeight = await driver.executeScript("return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);");
  
  await driver.manage().window().setRect({
    width: contentWidth,
    height: contentHeight,
  });

  putLog("takeScreenJust pagesized window");

  let base64 = await driver.takeScreenshot();

  putLog("takeScreenJust taked screenshot");

  let buffer = Buffer.from(base64, 'base64');
  //await promisify(fs.writeFile)(fileName + "." + ext, buffer);
  const pathFileNameNewer = nameNewDir + fileName + "." + ext;
  const pathFileNameDiff = nameNewDiffDir + fileName + "." + ext;
  await promisify(fs.writeFile)(pathFileNameNewer, buffer); // 保存

  putLog("takeScreenJust flushed screenshot");

  await driver.manage().window().setRect({
    width: 1920,
    height: 1080,
  });

  putLog("takeScreenJust defaultsized window");

  const pathFileNamePrevious = namePreviousDir + fileName + "." + ext;
  
  try {
    fs.statSync(pathFileNamePrevious);
  }catch (err) {
    if( err.code === 'ENOENT'){
      putLog("" + pathFileNamePrevious + "is not found skip resemble");
      return;
    }
  }

  // 最新と一つ前のスクショを取得
  const imageBefore = fs.readFileSync(pathFileNamePrevious);
  const imageAfter  = fs.readFileSync(pathFileNameNewer);

  putLog("takeScreenJust buffered screenshot");

  // 比較
  var misMatchPercentage = 0;
  await resemble(imageAfter).compareTo(imageBefore)
      .ignoreColors()
      .onComplete(function (data){
        fs.writeFileSync(pathFileNameDiff, data.getBuffer());
        putLog(data);
        misMatchPercentage = data.rawMisMatchPercentage;
      });

  putLog("misMatchPercentage: " + misMatchPercentage);
  expect(misMatchPercentage).toBeLessThan(1);
  
  putLog("takeScreenJust Ended");
}

function putLog(logStr){
  //console.log(timestamp() + ": " + logStr);
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
        try{
          fs.statSync(parentDir);
        }catch (err) {
          if( err.code === 'ENOENT'){
            fs.mkdirsSync(parentDir);
          }else{
            throw err;
          }
        }
        
        const nameDirsHistory = fs.readdirSync(parentDir);
        global.namePreviousDir = parentDir + nameDirsHistory[nameDirsHistory.length-1] + "/";
        global.nameNewDir = parentDir + date.format(now, 'YYYYMMDDHHmmss').toString() + "/";
        global.nameNewDiffDir = nameNewDir + "diff/";
    
        fs.mkdirsSync(nameNewDir);
        fs.mkdirsSync(nameNewDiffDir);
  });

  afterAll(() => {
    console.log(cpModule.scCopy());
    return driver.quit();
  });

  it("トップページ ページタイトル", async () => {


    putLog("trace1");

    // テスト対象のページへアクセス
    await driver.get("https://www.securite.jp");

    // トップページのロード待ち
    //await driver.wait(until.titleContains('セキュリテ - インパクト投資プラットフォーム'), 10000);

    putLog("trace2");
    
    await driver.getTitle().then(function (title) {
      putLog("trace3");
      // @test title is match?
      expect(title).toBe("セキュリテ - インパクト投資プラットフォーム");
    });

    await takeScreentJust(driver, '001_top', 'png');

    putLog("trace4");
  });

  it("トップページバナー1クリック", async () => {
    const anker = await driver.findElement(By.xpath("//div[@class='gridpane']/div[2]/a")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='gridpane']/div[2]/a")).click();
    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await takeScreentJust(driver, '002_banner1', 'png');
  });

  it("トップページバナー2クリック", async () => {
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();
    
    const anker = await driver.findElement(By.xpath("//div[@class='gridpane']/div[3]/a")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='gridpane']/div[3]/a")).click();
    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await takeScreentJust(driver, '003_banner2', 'png');
  });

  it("セキュリテニュース1クリック", async () => {
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();

    const anker = await driver.findElement(By.xpath("//div[@class='topnews clearfix']/dl[1]/dd/ul/li[1]/a")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='topnews clearfix']/dl[1]/dd/ul/li[1]/a")).click();
    
    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await takeScreentJust(driver, '004_securite_news1', 'png');
  });

  it("ファンドニュース1クリック", async () => {
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();

    const anker = await driver.findElement(By.xpath("//div[@class='topnews clearfix']/dl[2]/dd/a[1]")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='topnews clearfix']/dl[2]/dd/a[1]")).click();

    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await takeScreentJust(driver, '005_fund_news1', 'png');
  });

  it("ファンド1クリック", async () => {
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();

    const anker = await driver.findElement(By.xpath("//div[@class='project']/div[1]/div[1]/a[1]")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='project']/div[1]/div[1]/a[1]")).click();

    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await takeScreentJust(driver, '006_fund1', 'png');
  });
  
  it("トップページ ログインページに遷移", async () => {

    await driver.findElement(By.linkText('ログイン')).click();
    await driver.wait(until.titleContains('ログイン'), 10000);

    /* @test title */ 
    await driver.getTitle().then(function (title) {
      expect(title).toBe("ログイン｜セキュリテ");
    });
    await takeScreentJust(driver, '007_login', 'png');
  });

  it("ログインページ ブランクフォームエラー", async () => {
    // フォームをブランクで送信
    await driver.findElement(By.xpath("//input[@value='ログイン']")).click();
    await takeScreentJust(driver, '008_loginfail', 'png');

    const errorMsg = await driver.findElement(By.className("error_msg")).getText();
    /* @test invalidate message */
    expect(errorMsg).toBe("ログインIDまたはパスワードを見直してください。");
  });


  it("ログインページ ログイン成功", async () => {
    // ログインフォームを入力してログイン
    await driver.findElement(By.xpath("//input[@name='msuser']")).sendKeys("msohashi");
    await driver.findElement(By.xpath("//input[@name='mspwd']")).sendKeys("YaIkani13");
    await driver.findElement(By.xpath("//input[@value='ログイン']")).click();

    /* @test title */
    await driver.getTitle().then(function (title) {
      expect(title).toBe("マイページ｜セキュリテ");
    });
    await takeScreentJust(driver, '009_loginsuccess', 'png');
  });

  it("マイページ マイアカウント遷移", async () => {
    // マイアカウントリンクをクリックして、マイアカウントページを表示する
    await driver.findElement(By.xpath("//a[contains(text(), 'マイアカウント')]")).click();

    /* @test title */
    await driver.getTitle().then(function (title) {
      expect(title).toBe("マイアカウント｜セキュリテ");
    });
    await takeScreentJust(driver, '010_myaccount', 'png');
  });

  it("ログアウト", async () => {
    // ログアウトをクリックしてログインページに遷移する
    await driver.findElement(By.xpath("//a[contains(text(), 'ログアウト')]")).click();

    /* @test title */
    await driver.getTitle().then(function (title) {
      expect(title).toBe("ログイン｜セキュリテ");
    });
    await takeScreentJust(driver, '011_logout', 'png');
  });
  
});
