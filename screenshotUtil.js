// libraries
const fs = require("fs-extra");
const date = require("date-and-time");
const resemble = require("resemblejs");
const { promisify } = require("util");

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
            generalUtil.InfoLog(data);
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
    // スクショ用のdir作成
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

    fs.mkdirsSync(nameNewDir);
    fs.mkdirsSync(nameNewDiffDir);
}