// libraries
const webdriver = require("selenium-webdriver");
const { By, until } = webdriver;
// utirities
const driverUtil  = require("../driverUtil.js");
const screenshotUtil  = require("../screenshotUtil");
const generalUtil  = require("../generalUtil");
let driver;

/**
 * テストケース1つあたりのタイムアウト(msec)
 */
jest.setTimeout(60000);

// テストグループ
describe("デモ", () => {
  
  beforeAll(() => {
        
        // TODO: singletonでよいか確認
        driver = driverUtil.getDriver("chrome");
        // スクショ用のディレクトリを作成
        screenshotUtil.setUp();
  });

  afterAll(() => {
    generalUtil.InfoLog(screenshotUtil.scCopy());
    return driver.quit();
  });

  it("トップページ ページタイトル", async () => {
    
    generalUtil.InfoLog("トップページ ページタイトル Started");
    
    generalUtil.DebugLog("trace1");

    // テスト対象のページへアクセス
    await driver.get("https://www.securite.jp");

    // トップページのロード待ち
    //await driver.wait(until.titleContains('セキュリテ - インパクト投資プラットフォーム'), 10000);

    generalUtil.DebugLog("trace2");
    
    await driver.getTitle().then(function (title) {
      generalUtil.DebugLog("trace3");
      // @test title is match?
      expect(title).toBe("セキュリテ - インパクト投資プラットフォーム");
    });

    await screenshotUtil.takeCapture(driver, 'top', false);

    generalUtil.DebugLog("trace4");
  });

  it("トップページバナー1クリック", async () => {

    generalUtil.InfoLog("トップページバナー1クリック Started");
    
    const anker = await driver.findElement(By.xpath("//div[@class='gridpane']/div[2]/a")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='gridpane']/div[2]/a")).click();
    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await screenshotUtil.takeCapture(driver, 'banner1', false);
  });

  it("トップページバナー2クリック", async () => {

    generalUtil.InfoLog("トップページバナー2クリック Started");
    
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();

    const anker = await driver.findElement(By.xpath("//div[@class='gridpane']/div[3]/a")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='gridpane']/div[3]/a")).click();
    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await screenshotUtil.takeCapture(driver, 'banner2', false);
  });

  it("セキュリテニュース1クリック", async () => {

    generalUtil.InfoLog("セキュリテニュース1クリック Started");
    
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();

    const anker = await driver.findElement(By.xpath("//div[@class='topnews clearfix']/dl[1]/dd/ul/li[1]/a")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='topnews clearfix']/dl[1]/dd/ul/li[1]/a")).click();

    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await screenshotUtil.takeCapture(driver, 'securite_news1', false);
  });

  it("ファンドニュース1クリック", async () => {

    generalUtil.InfoLog("ファンドニュース1クリック Started");
    
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();

    const anker = await driver.findElement(By.xpath("//div[@class='topnews clearfix']/dl[2]/dd/a[1]")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='topnews clearfix']/dl[2]/dd/a[1]")).click();

    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await screenshotUtil.takeCapture(driver, 'fund_news1', false);
  });

  it("ファンド1クリック", async () => {

    generalUtil.InfoLog("ファンド1クリック Started");
    
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();

    const anker = await driver.findElement(By.xpath("//div[@class='project']/div[1]/div[1]/a[1]")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='project']/div[1]/div[1]/a[1]")).click();

    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await screenshotUtil.takeCapture(driver, 'fund1', false);
  });

  it("トップページ ログインページに遷移", async () => {

    generalUtil.InfoLog("トップページ ログインページに遷移 Started");
    
    await driver.findElement(By.linkText('ログイン')).click();
    await driver.wait(until.titleContains('ログイン'), 10000);

    /* @test title */ 
    await driver.getTitle().then(function (title) {
      expect(title).toBe("ログイン｜セキュリテ");
    });
    await screenshotUtil.takeCapture(driver, 'login');
  });

  it("ログインページ ブランクフォームエラー", async () => {

    generalUtil.InfoLog("ログインページ ブランクフォームエラー Started");
    
    // フォームをブランクで送信
    await driver.findElement(By.xpath("//input[@value='ログイン']")).click();
    await screenshotUtil.takeCapture(driver, 'loginfail');

    const errorMsg = await driver.findElement(By.className("error_msg")).getText();
    /* @test invalidate message */
    expect(errorMsg).toBe("ログインIDまたはパスワードを見直してください。");
  });


  it("ログインページ ログイン成功", async () => {

    generalUtil.InfoLog("ログインページ ログイン成功 Started");
    
    // ログインフォームを入力してログイン
    await driver.findElement(By.xpath("//input[@name='msuser']")).sendKeys("msohashi");
    await driver.findElement(By.xpath("//input[@name='mspwd']")).sendKeys("YaIkani13");
    await driver.findElement(By.xpath("//input[@value='ログイン']")).click();

    /* @test title */
    await driver.getTitle().then(function (title) {
      expect(title).toBe("マイページ｜セキュリテ");
    });
    await screenshotUtil.takeCapture(driver, 'loginsuccess');
  });

  it("マイページ マイアカウント遷移", async () => {

    generalUtil.InfoLog("マイページ マイアカウント遷移 Started");
    
    // マイアカウントリンクをクリックして、マイアカウントページを表示する
    await driver.findElement(By.xpath("//a[contains(text(), 'マイアカウント')]")).click();

    /* @test title */
    await driver.getTitle().then(function (title) {
      expect(title).toBe("マイアカウント｜セキュリテ");
    });
    await screenshotUtil.takeCapture(driver, 'myaccount');
  });

  // 会員情報変更
  
  
  it("ログアウト", async () => {

    generalUtil.InfoLog("ログアウト Started");
    
    // ログアウトをクリックしてログインページに遷移する
    await driver.findElement(By.xpath("//a[contains(text(), 'ログアウト')]")).click();

    /* @test title */
    await driver.getTitle().then(function (title) {
      expect(title).toBe("ログイン｜セキュリテ");
    });
    await screenshotUtil.takeCapture(driver, 'logout');
  });

  it("Yahooログイン", async () => {

    generalUtil.InfoLog("Yahooログイン Started");
    
    // cookieをクリアして認証エンドポイントへリダイレクト
    await driver.manage().deleteAllCookies();
    await driver.findElement(By.xpath("//a[@class='btn yahoo large']")).click();

    // タイトル検証
    await driver.getTitle().then(function(title){
      expect(title).toBe("ログイン - Yahoo! JAPAN");
    });

    await screenshotUtil.takeCapture(driver, 'yahoo - authorization', false);

    // IDを入力
    await driver.findElement(By.xpath("//input[@id='username']")).sendKeys("by_lilack");
    // 次へ
    await driver.findElement(By.xpath("//button[@id='btnNext']")).click();

    await screenshotUtil.takeCapture(driver, 'yahoo - next', false);

    // ボタン表示待ち
    await driver.wait(until.elementLocated(By.xpath("//input[@id='passwd']")), 5*1000).then(el=>{
      el.sendKeys("YaIkani13");
    });

    // ログイン
    await driver.findElement(By.xpath("//button[@id='btnSubmit']")).click();

    // セキュリテにリダイレクト
    await driver.getTitle().then(function (title) {
      expect(title).toBe("セキュリテ - インパクト投資プラットフォーム");
    });

    await screenshotUtil.takeCapture(driver, 'yahoo - authorized', false);

  });

  it("ゆっくりいそげ1クリック", async () => {

    generalUtil.InfoLog("Yahooログイン Started");
    
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();
    
    const anker = await driver.findElement(By.xpath("//*[@id=\"main\"]/div[6]/div/dl[1]/dd/a[1]")).getAttribute("href");
    await driver.findElement(By.xpath("//*[@id=\"main\"]/div[6]/div/dl[1]/dd/a[1]")).click();

    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await screenshotUtil.takeCapture(driver, 'director_blog1', false);
  });

  it("イベント1クリック", async () => {

    generalUtil.InfoLog("イベント1クリック Started");
    
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();
    
    const element = await driver.findElement(By.xpath("//*[@id=\"main\"]/div[6]/div/dl[2]/dd/a[@target=\"_blank\"]"));
    
    const anker = await element.getAttribute("href");
    await element.click();
    
    // 新規ウインドウのオープン待ち
    await driver.wait(new webdriver.Condition('window open condition', async () =>{
        const handles = await driver.getAllWindowHandles();
        return handles.length > 1;
    }), 10*1000);

    const ws = await driver.getAllWindowHandles();
    const wid = await driver.getWindowHandle();
    generalUtil.DebugLog(ws);
    generalUtil.DebugLog("window num=" + ws.length);
    
    // ウインドウフォーカス移動
    await driver.switchTo().window(ws.slice(-1)[0]);
    const testingUrl = await driver.getCurrentUrl();
    
    // アンカーの導通確認
    expect(testingUrl).toBe(anker);

    await screenshotUtil.takeCapture(driver, "event_news1", false);

    // ウインドウフォーカスを戻す
    await driver.close();
    await driver.switchTo().window(wid);
    
  });
  
});
