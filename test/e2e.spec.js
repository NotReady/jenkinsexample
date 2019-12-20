// libraries
const webdriver = require("selenium-webdriver");
const { By, until } = webdriver;
// utirities
const factory  = require("../driverUtil.js");
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
        // driverを取得します
        // TODO: 複数テストケースを回す場合はsingletonでいけるか確認
        driver = factory.getDriver("chrome");
        // スクショ用のディレクトリを作成
        screenshotUtil.setUp();
  });

  afterAll(() => {
    generalUtil.InfoLog(screenshotUtil.scCopy());
    return driver.quit();
  });

  /**
   * @brief トップページを表示し、レスポンスをタイトルの一致で検証します
   */
  it("トップページ ページタイトル", async () => {
    
    generalUtil.InfoLog("トップページ ページタイトル Started");
    
    // テスト対象のページへアクセス
    await driver.get("https://www.securite.jp");

    // トップページのロード待ち
    //await driver.wait(until.titleContains('セキュリテ - インパクト投資プラットフォーム'), 10000);
    
    await driver.getTitle().then(function (title) {
      // @test title is match?
      expect(title).toBe("セキュリテ - インパクト投資プラットフォーム");
    });

    await screenshotUtil.takeCapture(driver, 'top', false);
  });

  /**
   * @brief トップページのバナー1をクリックして、アンカー先に遷移できることを検証します
   */
  it("トップページバナー1クリック", async () => {

    generalUtil.InfoLog("トップページバナー1クリック Started");
    
    const anker = await driver.findElement(By.xpath("//div[@class='gridpane']/div[2]/a")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='gridpane']/div[2]/a")).click();
    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await screenshotUtil.takeCapture(driver, 'banner1', false);
  });

  /**
   * @brief トップページのバナー2をクリックして、アンカー先に遷移できることを検証します
   */
  it("トップページバナー2クリック", async () => {

    generalUtil.InfoLog("トップページバナー2クリック Started");
    
    // トップページに戻る
    await driver.get("https://www.securite.jp");
    
    const anker = await driver.findElement(By.xpath("//div[@class='gridpane']/div[3]/a")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='gridpane']/div[3]/a")).click();
    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await screenshotUtil.takeCapture(driver, 'banner2', false);
  });

  /**
   * @brief トップページのセキュリテニュースの記事1つめをクリックして、アンカー先に遷移できることを検証します
   */
  it("セキュリテニュース1クリック", async () => {

    generalUtil.InfoLog("セキュリテニュース1クリック Started");

    // トップページに戻る
    await driver.get("https://www.securite.jp");

    const anker = await driver.findElement(By.xpath("//div[@class='topnews clearfix']/dl[1]/dd/ul/li[1]/a")).getAttribute("href");
    await driver.findElement(By.xpath("//div[@class='topnews clearfix']/dl[1]/dd/ul/li[1]/a")).click();

    const testingUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(testingUrl).toBe(anker);
    await screenshotUtil.takeCapture(driver, 'securite_news1', false);
  });

  /**
   * @brief トップページのファンドニュースの記事1つめをクリックして、アンカー先に遷移できることを検証します
   */
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

  /**
   * @brief トップページのファンドの1つめをクリックして、アンカー先に遷移できることを検証します
   */
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

  /**
   * @brief トップページからログインページに遷移できることを検証します
   */
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

  /**
   * @brief ログインページで未入力でログインし、バリデーションエラーを検証します
   */
  it("ログインページ ブランクフォームエラー", async () => {

    generalUtil.InfoLog("ログインページ ブランクフォームエラー Started");
    
    // フォームをブランクで送信
    await driver.findElement(By.xpath("//input[@value='ログイン']")).click();
    await screenshotUtil.takeCapture(driver, 'loginfail');

    const errorMsg = await driver.findElement(By.className("error_msg")).getText();
    /* @test invalidate message */
    expect(errorMsg).toBe("ログインIDまたはパスワードを見直してください。");
  });

  /**
   * @brief ログインページで正常に認証を通過できることを検証します
   */
  it("ログインページ ログイン成功", async () => {

    generalUtil.InfoLog("ログインページ ログイン成功 Started");
    
    // ログインフォームを入力してログイン
    await driver.findElement(By.xpath("//input[@name='msuser']")).sendKeys(process.env.TEST_ID);
    await driver.findElement(By.xpath("//input[@name='mspwd']")).sendKeys(process.env.TEST_PW);
    await driver.findElement(By.xpath("//input[@value='ログイン']")).click();

    /* @test title */
    await driver.getTitle().then(function (title) {
      expect(title).toBe("マイページ｜セキュリテ");
    });
    await screenshotUtil.takeCapture(driver, 'loginsuccess');
  });

  /**
   * @brief マイページでマイアカウントページに遷移できることをタイトル一致で検証します
   */
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

  /**
   * @brief マイページで会員情報変更ページに遷移できることをタイトル一致で検証します
   */
  it("マイページ 会員情報変更遷移", async () => {
    generalUtil.InfoLog("マイページ 会員情報変更遷移 Started");

    // 会員情報変更アンカーをクリックして、会員情報変更ページに遷移します
    await driver.findElement(By.xpath("//*[@id='container']/dl/dd/ul/li[3]/a")).click();

    /* @test title */
    await driver.getTitle().then(function (title) {
      expect(title).toBe("会員情報変更｜セキュリテ");
    });
    
    await screenshotUtil.takeCapture(driver, 'account_edit', false);
  });

  /**
   * @brief マイページで不正入力し、適切にバリデーションエラーが働くことを検証します
   */
  it("マイページ 会員情報変更エラー", async () => {
    
    generalUtil.InfoLog("マイページ 会員情報変更エラー Started");

    // 重複したPCアドレスを入力します
    await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[9]/td/input")).clear().then(async function(){
          await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[9]/td/input")).sendKeys(process.env.TEST_EMAIL);
        });
    
    // 重複した携帯アドレスを入力します
    await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[10]/td/input")).clear().then(async function () {
      await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[10]/td/input")).sendKeys(process.env.TEST_CMAIL).then()
    });

    await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[10]/td/select/option[@value='ezweb.ne.jp']")).click();

    // submit
    await driver.findElement(By.xpath("//*[@id='main']/form/div/input")).click();

    // バリデートエラーでスクショをとります
    await screenshotUtil.takeCapture(driver, 'account_edit_invalid', false);

    // バリデーションエラーを検証します
    const invalidEmailMessage = await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[9]/td/div")).getText();
    expect(invalidEmailMessage).toBe("入力されたメールアドレスはすでに登録されています");

    // バリデーションエラーを検証します
    const invalidMobileEmailMessage = await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[9]/td/div")).getText();
    expect(invalidMobileEmailMessage).toBe("入力されたメールアドレスはすでに登録されています");
    
  });
  
  /**
   * @brief マイページで正常入力し、会員情報更新が成功することを検証します。
   */
  it("会員情報変更成功", async () => {
    
    generalUtil.InfoLog("マイページ 会員情報変更成功 Started");

    // オリジナルのPCアドレスを入力します
    await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[9]/td/input")).clear().then(async function(){
      await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[9]/td/input"))
          .sendKeys("e2etestuser" + generalUtil.getDateTimestamp("","","") + "@musicsecurities.com");      
    });
    
    // 携帯アドレスをブランク入力します
    await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[10]/td/input")).clear().then(async function () {
      await driver.findElement(By.xpath("//*[@id='main']/form/table[1]/tbody/tr[10]/td/select/option[1]")).click();      
    });
    
    // 送信します
    await driver.findElement(By.xpath("//*[@id='main']/form/div/input")).click();

    // 確認画面のスクショ
    await screenshotUtil.takeCapture(driver, 'account_edit_confirm', false);

    // ページ遷移を検証します
    const asConfirmPageUrl = await driver.getCurrentUrl();
    expect(asConfirmPageUrl).toBe("https://www.securite.jp/mypage/edit/confirm");
    
    // 保存するをクリックします
    await driver.findElement(By.xpath("//*[@id='main']/form/div/input")).click();

    // 会員情報変更完了画面のスクショ
    await screenshotUtil.takeCapture(driver, 'account_edit_complete');

    // ページ遷移を検証します
    const asCompletePageUrl = await driver.getCurrentUrl();
    expect(asCompletePageUrl).toBe("https://www.securite.jp/mypage/edit/complete");
    
  });
  
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
    await driver.findElement(By.xpath("//input[@id='username']")).sendKeys(process.env.Y_ID);
    // 次へ
    await driver.findElement(By.xpath("//button[@id='btnNext']")).click();

    await screenshotUtil.takeCapture(driver, 'yahoo - next', false);

    // ボタン表示待ち
    await driver.wait(until.elementLocated(By.xpath("//input[@id='passwd']")), 5*1000).then(el=>{
      el.sendKeys(process.env.Y_PW);
    });

    // ログイン
    await driver.findElement(By.xpath("//button[@id='btnSubmit']")).click();

    // セキュリテにリダイレクト
    await driver.getTitle().then(function (title) {
      expect(title).toBe("セキュリテ - インパクト投資プラットフォーム");
    });

    await screenshotUtil.takeCapture(driver, 'yahoo - authorized', false);
    
  });
  
  /**
   * @brief ひかり会員ログイン
   */
  it("ひかりログイン", async () => {

    generalUtil.InfoLog("ひかりログイン Started");

    // ログインページ - ログイン状態の場合は強制ログアウトします
    await driver.get("https://www.securite.jp/member/login");

    // cookieをクリアして認証エンドポイントへリダイレクト
    await driver.manage().deleteAllCookies();
    // ひかりログインボタンをクリックします
    await driver.findElement(By.xpath("//*[@id=\"login\"]/div[2]/div[3]/a")).click();

    // タイトル検証
    await driver.getTitle().then(function(title){
      expect(title).toBe("ひかりＴＶドリーム　ログイン");
    });

    await screenshotUtil.takeCapture(driver, 'hikari - authorization', false);

    // IDを入力します
    await driver.findElement(By.xpath("//*[@id=\"webid\"]")).sendKeys(process.env.H_ID);
    // PWを入力します
    await driver.findElement(By.xpath("//*[@id=\"password\"]")).sendKeys(process.env.H_PW);
    // ログイン
    await driver.findElement(By.xpath("//*[@id=\"login\"]")).click();

    // セキュリテにリダイレクト
    await driver.getTitle().then(function (title) {
      expect(title).toBe("セキュリテ - インパクト投資プラットフォーム");
    });
    
    await screenshotUtil.takeCapture(driver, 'hikari - authorized');
  });
  
  it("ゆっくりいそげ1クリック", async () => {

    generalUtil.InfoLog("ゆっくりいそげ1クリック");
    
    // トップページに戻る
    await driver.findElement(By.xpath("//h1/a[@href='/']")).click();
    
    const anker = await driver.findElement(By.xpath("//*[@id=\"main\"]/div[6]/div/dl[1]/dd/a[1]")).getAttribute("href");
    await driver.findElement(By.xpath("//*[@id=\"main\"]/div[6]/div/dl[1]/dd/a[1]")).click();

    const asTargetUrl = await driver.getCurrentUrl();

    // アンカーの導通確認
    expect(asTargetUrl).toBe(anker);
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
