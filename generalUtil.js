const logLevel = {
    "Error" : 0,
    "Info" : 1,
    "Debug": 2
}

var _logLevel = logLevel.Info;

/**
 * 出力するログのしきい値です
 * @type {number}
 */
module.exports.logLevel = _logLevel;

/**
 * 出力ログレベルの設定値です
 * @type {{Error: number, Info: number, Debug: number}}
 */
module.exports.typeLogLevel = logLevel;

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
    if( _logLevel < logLevel.Info ) return;
    printLog("[INFO]" + logStr);
}

/**
 * デバッグレベルのログを出力します
 * @constructor
 */
module.exports.DebugLog = function(logStr){
    if( _logLevel < logLevel.Debug ) return;
    printLog("[DEBUG]" + logStr);
}

/**
 * 実行環境内共通のカウンタのクロージャ実装です
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
 * @params {string} separator 時分秒間のセパレータ
 * @returns {string} HH{delimiter}MM{delimiter}SSフォーマットのタイムスタンプ文字列
 */
module.exports.getTimestamp = getTimestamp;
function getTimestamp(separator=":"){
    const  dt = new Date();
    return ( "00" + dt.getHours() ).slice(-2) + separator + ( "00" + dt.getMinutes() ).slice(-2) + separator + ( "00" + dt.getSeconds() ).slice(-2);
}

/**
 * 日付スタンプ文字列を取得します
 * @params {string} separator 年月日間のセパレータ
 * @returns {string} YYYY{delimiter}MM{delimiter}DDフォーマットの日付スタンプ文字列
 */
module.exports.getDatestamp = getDatestamp;
function getDatestamp(separator="/"){
    const  dt = new Date();
    return dt.getFullYear() + separator + ( "00" + ( dt.getMonth() + 1 ) ).slice(-2) + separator + ( "00" + dt.getDate() ).slice(-2);
}

/**
 * 日付タイムスタンプ文字列を取得します
 * @params {string} dateSeparator 年月日間のセパレータ
 * @params {string} timeSeparator 時分秒間のセパレータ
 * @params {string} dateTimeSeparator 日付と時刻間のセパレータ
 * @returns {string} YYYY{delimiter}MM{delimiter}DDフォーマットの日付スタンプ文字列
 */
module.exports.getDateTimestamp = getDateTimestamp;
function getDateTimestamp(dateSeparator="/", timeSeparator=":", dateTimeSeparator=" "){
    return getDatestamp(dateSeparator) + dateTimeSeparator + getTimestamp(timeSeparator);
}

/**
 * タイムスタンプ付きで標準出力にログを出力します
 * @param logStr ログ文字列
 */
function printLog(logStr){
    console.log(getTimestamp() + " " + logStr);
}