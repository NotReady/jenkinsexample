// libraries
const fs = require("fs-extra");
const date = require("date-and-time");
const resemble = require("resemblejs");
const { promisify } = require("util");
const util = require("util");
const gm = require("gm");

const webdriver = require("selenium-webdriver");
const { Key, By} = webdriver;

// utirities
const generalUtil = require("./generalUtil");

/**
 * 共通カウンタ
 * @type {string}
 */
let counter = generalUtil.getCounter();

/**
 * 最新のタイムスタンプdirでscreen_shot/latestを置き換えます
 * @returns {string}
 */
module.exports.scCopy = function() {
    // スクショdir
    const parentDir = "screen_shot/";
    // 保存先dir
    const saveDir = parentDir + "latest";

    // 旧最新保存を削除
    try {
        fs.statSync(saveDir);
        fs.removeSync(saveDir);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            generalUtil.ErrorLog(err.message);
            throw err;
        }
    }

    // 最新dir
    const nameDirsHistory = fs.readdirSync(parentDir);
    const nameLatestDir = parentDir + nameDirsHistory[nameDirsHistory.length - 1];

    // 最新dirを保存する
    fs.copySync(nameLatestDir, saveDir);

    return "copy screentshot completed src:" + nameLatestDir + " dst:" + saveDir;
}

/**
 * コンテンツのフルサイズでスクリーションを取得します。
 * @param driver object webdriverインスタンス
 * @param fileName string 出力ファイル名
 * @param verify bool 差分をエラーとして検出するかのオプション。true: エラー検出 / false: エラー無視
 * @returns {Promise<void>}
 */
module.exports.takeCapture = async function(driver, fileName, verify=true)
{
    const numberedFileName = counter() + `_${fileName}.png`;
    generalUtil.DebugLog("takeScreenJust Started");

    let contentWidth = await driver.executeScript("return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);");
    let contentHeight = await driver.executeScript("return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);");

    await driver.manage().window().setRect({
        width: contentWidth,
        height: contentHeight,
    });

    generalUtil.DebugLog("takeScreenJust pagesized window");

    let base64 = await driver.takeScreenshot();

    generalUtil.DebugLog("takeScreenJust taked screenshot");

    let buffer = Buffer.from(base64, 'base64');

    const pathFileNameNewer = nameNewDir + numberedFileName;
    const pathFileNameDiff = nameNewDiffDir + numberedFileName;
    await promisify(fs.writeFile)(pathFileNameNewer, buffer); // 保存

    generalUtil.DebugLog("takeScreenJust flushed screenshot");

    await driver.manage().window().setRect({
        width: 1920,
        height: 1080,
    });

    generalUtil.DebugLog("takeScreenJust defaultsized window");

    const pathFileNamePrevious = namePreviousDir + numberedFileName;

    try {
        fs.statSync(pathFileNamePrevious);
    }catch (err) {
        if( err.code === 'ENOENT'){
            generalUtil.InfoLog("" + pathFileNamePrevious + " is not found skip resemble");
            return;
        }
    }

    // 最新と一つ前のスクショを取得
    const imageBefore = fs.readFileSync(pathFileNamePrevious);
    const imageAfter  = fs.readFileSync(pathFileNameNewer);

    generalUtil.DebugLog("takeScreenJust buffered screenshot");

    // 比較
    var misMatchPercentage = 0;
    await resemble(imageAfter).compareTo(imageBefore)
        .ignoreColors()
        .onComplete(function (data){
            fs.writeFileSync(pathFileNameDiff, data.getBuffer());
            generalUtil.DebugLog(data);
            misMatchPercentage = data.rawMisMatchPercentage;
        });

    generalUtil.InfoLog("misMatchPercentage: " + misMatchPercentage);
    if( verify === true ){
        expect(misMatchPercentage).toBeLessThan(1);
    }

    generalUtil.DebugLog("takeScreenJust Ended");
}

/**
 * スクリーションショット取得に必要なディレクトリをセットアップします。
 */
module.exports.setUp = function(){
    
    // スクリーンショットの保存用にディレクトリを作成します
    
    // ルートディレクトリがなければ作成します
    global.now = new Date();
    const parentDir = "screen_shot/";
    try{
        fs.statSync(parentDir);
    }catch (err) {
        // 存在しない場合は例外
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
    global.nameNewTempDir = nameNewDir + "temporary/";

    // 実行時刻のディレクトリを作成します
    fs.mkdirsSync(nameNewDir);
    // 差分画像用のディレクトリを作成します
    fs.mkdirsSync(nameNewDiffDir);
    // スクロール画像作業用のディレクトリを作成します
    fs.mkdirsSync(nameNewTempDir);

}

/*******
 * 
 * @type {{scrollToBottom: Utils.scrollToBottom, screenShotDirectory: string, writeScreenShot: Utils.writeScreenShot, getSizes: (function(): !IThenable<T>)}}
 */

/**
 * ウインドウスクロール実装でフルサイズでスクリーションを取得します。
 * @param driver
 * @param fileName
 * @param verify
 * @returns {Promise<void>}
 */
module.exports.takeScrollingCapture = async function(driver, fileName, verify=true) {

    Utils.browser = driver;
    Utils.savePathFile = nameNewDir + counter() + `_${fileName}.png`;
    
    const screenSize = await Utils.getSizes();
    await Utils.scrollToBottom(screenSize.clientHeight, 1);
}

const Utils = {
    browser: null,
    savePathFile: '',
    
    writeScreenShot: async function (data, filename) {
        let buffer = Buffer.from(data, 'base64');
        await promisify(fs.writeFile)(filename, buffer);
        
        const clientRect = await this.browser.manage().window().getRect();
        
        const graphic = gm(filename).resize(clientRect.width, clientRect.height);
        await new Promise(resolve => { 
            graphic.write(filename, function(err){
                if (err){
                    generalUtil.ErrorLog(err);
                }
                else{
                    generalUtil.InfoLog(`writeScreenShot(${filename}) completed!!`);
                    resolve();
                }
            });
        });
    },

    getSizes: async function () {
        const clientRect = await this.browser.manage().window().getRect();
        const screen = await this.browser.executeScript("return {scrollHeight: document.body.scrollHeight, clientHeight: document.body.clientHeight, scrollTop: document.body.scrollTop};");
        screen.clientHeight = clientRect.height;
        screen.clientWidth = clientRect.width;
        return screen;
    },

    scrollToBottom: async function (height, index) {

        // スクロール分割画像を保存します
        const base64 = await this.browser.takeScreenshot();
        await this.writeScreenShot(base64, nameNewTempDir + "index" + index + ".png");
        
        const sizeInfo = await this.getSizes();
        
        //generalUtil.InfoLog("==========inspect::sizeInfo" + util.inspect(sizeInfo));
        
        // clientscreenでフルサイズ取れるだけまわす
        if (sizeInfo.scrollTop + height < sizeInfo.scrollHeight) {
            await this.browser.executeScript(`window.scrollTo(0, ${height});`);
            await this.browser.findElement(By.xpath("/html/body")).sendKeys(Key.PAGE_DOWN);
            // await sleep(500);
            // this.browser.implicit(1);
            
            await this.scrollToBottom(height + sizeInfo.clientHeight, index + 1);
        }else{
            
            // 最終余剰をカットしたスクショ
            const cropPosY = sizeInfo.scrollTop + height - sizeInfo.scrollHeight;
            const cropHeight = sizeInfo.clientHeight - cropPosY;
            
            generalUtil.InfoLog("start merged!!");
            
            const cropiing = gm(nameNewTempDir + "index" + index + ".png")
            .crop(sizeInfo.clientWidth, cropHeight, 0, cropPosY);

            await new Promise(r => {
                cropiing.write(nameNewTempDir + "index" + index + ".png", function (err) {
                    if (err){ generalUtil.ErrorLog(err); }
                    else{ generalUtil.InfoLog("complete croped!!"); }
                    r();
                });
            });
            
            // const imgSize = await util.promisify(g.size).bind(g)();
            // generalUtil.InfoLog("=======inspect:size=======" + util.inspect(imgSize,false,null) + "=======inspect=======");
            
            var op = gm();
            for (var i = 1; i <= index; i++) {
                op = op.in(nameNewTempDir + "index" + i + ".png");
            }
            op = op.montage().mode("concatenate").tile("1x");

            await new Promise(r => {
                op.write(this.savePathFile, function (err) {
                    if (err){ generalUtil.ErrorLog(err); }
                    else{ generalUtil.InfoLog(`saved file (` + this.savePathFile + `)` );}
                    r();
                });
            });
        }
    }
};

async function sleep(t){
    return await new Promise(r => {
       setTimeout(() => {
           r();
       }, t);
    });
}