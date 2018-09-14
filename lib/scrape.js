function getList (address) {
  var content = [];
  return axios.get('https://ethplorer.io/service/service.php?refresh=holders&data=' + address + '&page=tab%3Dtab-holders%26pageSize%3D50&showTx=all')
    .then(resp => {
      var info = resp.data;

      var oToken = info.token;
      if (typeof info.holders === 'undefined')
        console.log('No results');
      else {
        for (var i = 0; i < info.holders.length; i++) {
          var holder = info.holders[i];
          var balance = holder['balance'];
          if (oToken.decimals) {
            balance = balance / Math.pow(10, oToken.decimals);
          }
          balance = formatNum(balance, true, oToken.decimals, true);
          if (oToken.price && oToken.price.rate) {
            var pf = parseFloat(balance.replace(/\,/g, '').split(' ')[0]);
            if (pf) {
              pf = round(pf * oToken.price.rate, 2);
              var usdval = formatNum(Math.abs(pf), true, 2, true);
            }
          }
          content.push({
            'address': holder['address'],
            'balance': balance,
            'value': usdval,
            'share': holder['share']
          })
        }
        return content
      }
    })
}

function formatNum(num, withDecimals /* = false */, decimals /* = 2 */, cutZeroes /* = false */, noE /* = false */) {
  if (!num) {
    num = 0;
  }
  function padZero(s, len) {
    while (s.length < len) s += '0';
    return s;
  }
  if (('object' === typeof (num)) && ('undefined' !== typeof (num.c))) {
    num = parseFloat(toBig(num).toString());
  }
  if ('undefined' === typeof (cutZeroes)) {
    cutZeroes = true;
  }
  cutZeroes = !!cutZeroes;
  withDecimals = !!withDecimals;
  decimals = ('undefined' !== typeof (decimals)) ? decimals : 2;

  if ((num.toString().indexOf("e+") > 0)) {
    if (noE) {
      var parts = num.toString().split('e+');
      var ch = parts[0].replace('.', '');
      var st = parseInt(parts[1]) - (ch.length - 1);
      for (var i = 0; i < st; i++) {
        ch += '0';
      }
      num = ch.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return num.toString();
  }
  if ((num.toString().indexOf("e-") > 0) && withDecimals) {
    var res = toBig(num).toFixed(decimals);
    if (cutZeroes && (res.indexOf(".") > 0)) {
      res = res.replace(/0*$/, '').replace(/\.$/, '.00');
    }
    return res;
  }
  if (withDecimals) {
    num = round(num, decimals);
  }
  var parts = num.toString().split('.');
  var res = parts[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  var zeroCount = cutZeroes ? 2 : decimals;
  if (withDecimals && decimals) {
    if (parts.length > 1) {
      res += '.';
      var tail = parts[1].substring(0, decimals);
      if (tail.length < zeroCount) {
        tail = padZero(tail, zeroCount);
      }
      res += tail;
    } else {
      res += padZero('.', parseInt(zeroCount) + 1);
    }
  }
  if (cutZeroes && !decimals) {
    res = res.split('.')[0];
  }
  return res;
}

function toBig(obj) {
  var res = new BigNumber(0);
  if (obj && 'string' === typeof (obj)) {
    obj = obj.replace(/,/g, '');
  }
  if (obj && 'undefined' !== typeof (obj.c)) {
    res.c = obj.c;
    res.e = obj.e;
    res.s = obj.s;
  } else {
    res = new BigNumber(obj);
  }
  return res;
}

function round(val, decimals) {
  decimals = decimals ? parseInt(decimals) : 0;
  var parts = val.toString().split('.');
  if (parts.length > 1) {
    if (parts[1].length > decimals) {
      var k = decimals ? Math.pow(10, decimals) : 1;
      return Math.round(val * k) / k;
    }
  }
  return val;
}