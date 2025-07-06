var BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
var CHAT_ID = 'YOUR_CHAT_ID';

function setUpTrigger() {
  // Run once to create a trigger that executes every minute.
  ScriptApp.newTrigger('checkNewLiquidity')
           .timeBased()
           .everyMinutes(1)
           .create();
}

function checkNewLiquidity() {
  var props = PropertiesService.getScriptProperties();
  var lastBlock = parseInt(props.getProperty('lastBlock') || '0', 10);
  var pairMap = JSON.parse(props.getProperty('pairs') || '{}');

  var latest = fetchJSON('https://5ubsn-7qaaa-aaaag-qjxna-cai.raw.icp0.io/latest-block');
  if (!latest.block || latest.block.blockNumber === undefined) return;
  var latestBlock = latest.block.blockNumber;
  if (lastBlock >= latestBlock) return;

  var url = 'https://5ubsn-7qaaa-aaaag-qjxna-cai.raw.icp0.io/events?fromBlock=' +
            (lastBlock + 1) + '&toBlock=' + latestBlock;
  var data = fetchJSON(url);
  if (!Array.isArray(data)) return;

  data.forEach(function(evt) {
    if (evt.eventType !== 'join') return;
    var pid = evt.pairId;
    if (pairMap[pid]) return; // already notified
    var pair = fetchJSON('https://5ubsn-7qaaa-aaaag-qjxna-cai.raw.icp0.io/pair?id=' + pid).pair || {};
    var t0 = fetchJSON('https://5ubsn-7qaaa-aaaag-qjxna-cai.raw.icp0.io/asset?id=' + pair.asset0Id);
    var t1 = fetchJSON('https://5ubsn-7qaaa-aaaag-qjxna-cai.raw.icp0.io/asset?id=' + pair.asset1Id);
    var msg = 'New liquidity added on ICPSwap\n' +
              'Pair: ' + (t0.symbol || pair.asset0Id) + ' / ' + (t1.symbol || pair.asset1Id) + '\n' +
              'Block: ' + evt.block.blockNumber + '\n' +
              'Amount0: ' + evt.amount0 + '\n' +
              'Amount1: ' + evt.amount1;
    sendTelegram(msg);
    pairMap[pid] = true;
  });

  props.setProperty('pairs', JSON.stringify(pairMap));
  props.setProperty('lastBlock', String(latestBlock));
}

function fetchJSON(url) {
  try {
    var res = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    if (res.getResponseCode() !== 200) return {};
    return JSON.parse(res.getContentText());
  } catch (e) {
    return {};
  }
}

function sendTelegram(msg) {
  var url = 'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage';
  var payload = { chat_id: CHAT_ID, text: msg };
  UrlFetchApp.fetch(url, { method: 'post', payload: payload, muteHttpExceptions: true });
}
