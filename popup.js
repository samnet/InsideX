// 2. The calls I would liek to be able to make are:
// change in the aggregate volume of top 10 addresses over last 3 hours = call1(contract adress)
// getDiffInHoldings(3, ['test', 'test2'])
// change in the aggregate volume of top 10 addresses over last 36 hours = call2(contract adress)
setTimeout(function () {
  getDiffInHoldings(36, ['0x0d88ed6e74bbfd96b831231638b66c05571e824f'])
  getHolders('0x0d88ed6e74bbfd96b831231638b66c05571e824f')
}, 3000)
// current token price = call3(contract adress)

// row content update
function updateRowContent(tableBodyId, rownum) {
  const table = document.getElementById(tableBodyId)

  var ticker = table.rows[rownum].cells[0].innerHTML;
  console.log("[updateRowContent]: ", ticker)

  var volumeDelta3 = 5
  table.rows[rownum].cells[1].innerHTML = volumeDelta3;

  var volumeDelta24 = 8
  table.rows[rownum].cells[2].innerHTML = volumeDelta24;

  var newPrice = 2
  var oldPrice = document.getElementById(tableBodyId).rows[rownum].cells[3].innerHTML = volumeDelta24;
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
    updateRowContent(tableBodyId, i)
    i += 1
  });
}

// Row creation
function appendRow(tableBodyId, newrow) {
  var table = document.getElementById(tableBodyId);
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
      tickers.forEach(function(element){
        // construct row
        let newrow = [element, 1, 2, 3, 4]
        // append row
        appendRow("mainTableBody", newrow)
        // update this row
        updateRowContent("mainTableBody",0)
      })
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
                appendRow("mainTableBody", [newTicker, 1, 2, 3, 4])
                // update/populate this row
                updateRowContent("mainTableBody", 0)
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
  loadTable()
  updateTableContent("mainTableBody")
});
