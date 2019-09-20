const fs = require("fs-extra");

module.exports.scCopy = function() {
// スクショdir
    const parentDir = "./screen_shot/";
// 保存先dir
    const saveDir = parentDir + "latest";

// 旧最新保存を削除
    try {
        fs.statSync(saveDir);
        fs.removeSync(saveDir);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.log(err.message);
            throw err;
        }
    }

// 最新dir
    const nameDirsHistory = fs.readdirSync(parentDir);
    nameLatestDir = parentDir + nameDirsHistory[nameDirsHistory.length - 1];

// 最新dirを保存する
    fs.copySync(nameLatestDir, saveDir);

    console.log("copy screentshot completed src:" + nameLatestDir + " dst:" + saveDir);
}