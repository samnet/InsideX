function updateTable() {
  clearTable()
  const table = document.getElementById('mainTableBody')

  return Promise.all([
    getStore('tickers'),
    getStore('tokens'),
    getStore('holdings-24'),
    getStore('holdings-120')
  ])
  .then((res) => {
    const tickers = res[0]
    const tokens = res[1]
    const holdings24 = res[2]
    const holdings120 = res[3]

    tickers.forEach((ticker, rownum) => {
      console.log("[updateTable]: ", ticker)

      const row = table.insertRow(rownum);  
      [ticker.toUpperCase(), 'N/A', 'N/A', 'N/A', 'N/A'].forEach(function (element) {
        let newcell = row.insertCell(-1);
        newcell.innerHTML = element;
      })
      const contractAddress = tokens
        .find(t => t.ticker.toLowerCase() === ticker.toLowerCase())
        .contractAddress

      var volumeDelta3 = getHoldingChange(holdings120[contractAddress])
      table.rows[rownum].cells[1].innerHTML = volumeDelta3;

      var volumeDelta24 = getHoldingChange(holdings24[contractAddress])
      table.rows[rownum].cells[2].innerHTML = volumeDelta24;

      var newPrice = 2
      var oldPrice = table.rows[rownum].cells[3].innerHTML = volumeDelta24;
      table.rows[rownum].cells[3].innerHTML = newPrice;
      if (newPrice > oldPrice) {
        table.rows[rownum].cells[3].style.color = "green";
      } else {
        table.rows[rownum].cells[3].style.color = "red";
      }

      const removeBtn = '<a class="delete" title="Delete" data-toggle="tooltip" data-original-title="Delete"><i class="material-icons">delete</i></a>'
      table.rows[rownum].cells[4].innerHTML = removeBtn;
      table.rows[rownum].cells[4].id = ticker
      table.rows[rownum].cells[4].addEventListener("click", deleteTicker);

    })
  })
}

function getHoldingChange(holdings) {
  const delta = (holdings.maxTimestampShares - holdings.minTimestampShare) / holdings.maxTimestampShares
  return (delta * 100).toFixed(1)
}

function clearTable() {
  $('#mainTableBody').empty();
}

function deleteTicker() {
  const ticker = this.id
  console.log('delete', ticker)
  getStore('tickers')
    .then(tickers => {
      var index = tickers.indexOf(ticker);
      if (index > -1) {
        tickers.splice(index, 1);
        setStore('tickers', tickers)
          .then(() => {
            updateTable()
          });
      }
    })
}

function loadTokensJson() {
  return axios.get('data/tokens.json')
    .then(resp => {
      return setStore('tokens', resp.data);
    })
}

function loadHoldingsData() {
  return Promise.all([
      getStore('tickers'),
      getStore('tokens')
    ])
    .then((res) => {
      const tickers = res[0]
      const tokens = res[1]
      const contractAddresses = tickers.map(ticker => {
        return tokens
          .find(t => t.ticker.toLowerCase() === ticker.toLowerCase())
          .contractAddress
      })
      return Promise.all([
        getDiffInHoldings(24, contractAddresses),
        getDiffInHoldings(120, contractAddresses)
      ])
    })
    .then((res) => {
      console.log(res)
      return Promise.all([
        setStore('holdings-24', res[0]),
        setStore('holdings-120', res[1])
      ])
    })

}

// The typeahead
$("#token_name_input").easyAutocomplete({
  theme: "plate-dark",
  url: "data/tokens.json",
  getValue: "name",
  minCharNumber: 1,
  template: {
    type: "custom",
    method: function (value, item) {
      const abbrevAndName = `${item.name} | ${item.ticker.toUpperCase()}`
      return `<img src="vendor/icons/${item.name}.png">   ${abbrevAndName}`
    }
  },
  list: {
    match: {
      enabled: true
    },
    maxNumberOfElements: 6,
    onChooseEvent: function() {
      var newTicker = $("#token_name_input").getSelectedItemData().ticker;

      getStore('tickers')
        .then(tickers => {
          if (!tickers.includes(newTicker)) {

            // Add new ticker
            tickers.push(newTicker)
            return setStore('tickers', tickers)
              .then(() => {
                return loadHoldingsData()
              })
              .then(() => {
                return updateTable()
              });
          }
        })
        .then(() => {
          $("#token_name_input").val("")
        })
    }
  }
});

// Autoupdate
// every hours call table update

// Alarm (for now a place holder. Alarm triggered every 6 seconds)
function setAlarm() {
  let minutes = 0.1
  chrome.alarms.create({delayInMinutes: minutes});
  setStore('minutes', minutes)
}

function clearAlarm() {
  chrome.alarms.clearAll();
}
// document.getElementById('alarmToggle').addEventListener('click', function(){
//   setAlarm()
// });


$(document).ready(function () {
  loadTokensJson()
  loadHoldingsData()
  updateTable()
});



// store info
// tickers : watching tokens
// tokens : total tokens available
// holdings-24 : 24 hour holdings for the tickers
// holdings-120 : 120 hour holdings for the tickers
// table-data : display table info