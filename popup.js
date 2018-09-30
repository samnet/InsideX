// row content update
function updateRowContent(rownum) {
  // return Promise.all([
  //   getStore('tickers'),
  //   getStore('tokens')
  // ])
  // .then((res) => {
  //   const tickers = res[0]
  //   const tokens = res[1]
  //   const contractAddresses = tickers.map(ticker => {
  //     return tokens
  //       .find(t => t.ticker.toLowerCase() === ticker.toLowerCase())
  //       .contractAddress
  //   })
  // })

  const table = document.getElementById('mainTableBody')

  var ticker = table.rows[rownum].cells[0].innerHTML;
  console.log("[updateRowContent]: ", ticker)

  var volumeDelta3 = 5
  table.rows[rownum].cells[1].innerHTML = volumeDelta3;

  var volumeDelta24 = 8
  table.rows[rownum].cells[2].innerHTML = volumeDelta24;

  var newPrice = 2
  var oldPrice = table.rows[rownum].cells[3].innerHTML = volumeDelta24;
  table.rows[rownum].cells[3].innerHTML = newPrice;
  if (newPrice > oldPrice) {
    table.rows[rownum].cells[3].style.color = "green";
  } else {
    table.rows[rownum].cells[3].style.color = "red";
  }

  var removeBtn = '<a class="delete" title="Delete" data-toggle="tooltip" data-original-title="Delete"><i class="material-icons">delete</i></a>'
  table.rows[rownum].cells[4].innerHTML = removeBtn;
  table.rows[rownum].cells[4].id = ticker
  table.rows[rownum].cells[4].addEventListener("click", deleteTicker);

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
            clearTable()
            loadTable()
          });
      }
    })
}

// table content update
function updateTableContent(tableBodyId) {
  var i = 0;
  $(`#${tableBodyId} tr`).each(function() {
    // for each row call updateRowContent
    console.log("Iterating through table")
    updateRowContent(i)
    i += 1
  });
}

// Row creation
function appendRow(newrow) {
  var table = document.getElementById('mainTableBody');
  var row = table.insertRow(0);
  newrow.forEach(function(element){
    let newcell = row.insertCell(-1);
    newcell.innerHTML = element;
  })
}

function clearTable() {
  $('#mainTableBody').empty();
}

function loadTable() {
  return getStore('tickers')
    .then((tickers) => {
      // console.log("The saved tickers:" + tickers)
      tickers.forEach(function(ticker){
        // construct row
        const newrow = [ticker.toUpperCase(), 1, 2, 3, 4]
        // append row
        appendRow(newrow)
        // update this row
        updateRowContent(0)
      })
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
      var contractAddress = $("#token_name_input").getSelectedItemData().contractAddress;

      getStore('tickers')
        .then(tickers => {
          if (!tickers.includes(newTicker)) {

            // Add row to table
            tickers.push(newTicker)
            return setStore('tickers', tickers)
              .then((data) => {
                console.log("The new array was saved:" + data);
                appendRow([newTicker, 1, 2, 3, 4])
                // update/populate this row
                updateRowContent(0)
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
  loadTable()
  updateTableContent("mainTableBody")
});



// store info
// tickers : watching tokens
// tokens : total tokens available
// holdings-24 : 24 hour holdings for the tickers
// holdings-120 : 120 hour holdings for the tickers