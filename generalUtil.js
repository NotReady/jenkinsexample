const logLebel = {
    "Error" : 0,
    "Info" : 1,
    "Debug": 2
}
var _logLevel = logLebel.Info;

/**
 * 出力するログをレベルでフィルタします
 * @type {number}
 */
module.exports.logLevel = _logLevel;

/**
 * エラーレベルのログを出力します
 * @constructor
 */
module.exports.ErrorLog = function(logStr){
    printLog("[ERROR]" + logStr);
}

/**
 * 情報レベルのログを出力します
 * @constructor
 */
module.exports.InfoLog = function(logStr){
    if( _logLevel < 1 ) return;
    printLog("[INFO]" + logStr);
}

/**
 * デバッグレベルのログを出力します
 * @constructor
 */
module.exports.DebugLog = function(logStr){
    if( _logLevel < 2 ) return;
    printLog("[DEBUG]" + logStr);
}

/**
 * 実行環境内共通のカウンタの実装です（クロージャ）
 * @note スクリーションショットファイルのプレフィックスに使用します。
 * @returns string 3桁0パディングのカウンタ番号
 */
module.exports.getCounter = function(){
    var sc_counter = 0;
    return function(){
        return ( "000" + ++sc_counter ).slice(-3);
    }
}

/**
 * タイムスタンプ文字列を取得します
 * @returns {string} YYYYMMDDフォーマットのタイムスタンプ文字列
 */
function getTimestamp(){
    const  dt = new Date();
    return dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
}

/**
 * タイムスタンプ付きで標準出力にログを出力します
 * @param logStr ログ文字列
 */
function printLog(logStr){
    console.log(getTimestamp() + ": " + logStr);
}