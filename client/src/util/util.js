/**
 * 返回格式化后的时间
 *
 * @return
 */
function getformatTime(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const d = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${year}${month < 10 ? "0" + month : month}${d < 10 ? "0" + d : d}_${hour < 10 ? "0" + hour : hour}${minute < 10 ? "0" + minute : minute}${second < 10 ? "0" + second : second}`;
}

module.exports = {
  getformatTime
}