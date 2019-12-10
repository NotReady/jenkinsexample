/**
 * タイムスタンプ付きで標準出力にログを出力します
 * @param logStr ログ文字列
 */
module.exports.printLog = function (logStr){
    console.log(getTimestamp() + ": " + logStr);
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