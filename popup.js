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
  // ticker cell
  var ticker = document.getElementById(tableBodyId).rows[rownum].cells[0].innerHTML;
  console.log("[updateRowContent]: ", ticker)
  // fetch & format volume change of last 3 hours
  var volumeDelta3 = 5 // would have an API call here
  document.getElementById(tableBodyId).rows[rownum].cells[1].innerHTML = volumeDelta3;
  // fetch & format volume change of last 24 hours
  var volumeDelta24 = 8 // would have an API call here
  document.getElementById(tableBodyId).rows[rownum].cells[2].innerHTML = volumeDelta24;
  // fetch & format current Price
  var newPrice = 2 // would have an API call here
  var oldPrice = document.getElementById(tableBodyId).rows[rownum].cells[3].innerHTML = volumeDelta24;
  document.getElementById(tableBodyId).rows[rownum].cells[3].innerHTML = newPrice;
  if (newPrice > oldPrice) {
    document.getElementById(tableBodyId).rows[rownum].cells[3].style.color = "green";
  } else {
    document.getElementById(tableBodyId).rows[rownum].cells[3].style.color = "red";
  }

  var removeBtn = '<a class="delete" title="Delete" data-toggle="tooltip" data-original-title="Delete"><i class="material-icons">delete</i></a>'
  document.getElementById(tableBodyId).rows[rownum].cells[4].innerHTML = removeBtn;
  document.getElementById(tableBodyId).rows[rownum].cells[4].id = ticker
  document.getElementById(tableBodyId).rows[rownum].cells[4].addEventListener("click", deleteTicker);

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
  list: {
    match: {
      enabled: true
    },
    maxNumberOfElements: 6,
    onChooseEvent: function() {
      var newTicker = $("#token_name_input").getSelectedItemData().ticker;
      var address = $("#token_name_input").getSelectedItemData().address;

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
  , minCharNumber: 1
  , template: {
    type: "custom",
    method: function(value, item) {
      // value corresponds to the "getValue" key, above.
      let abbrevAndName = item.name + " | " + item.ticker
      return "<img src='" + item.pic + "'>" + abbrevAndName
    }
  }
});

// initial updating of table
$( document ).ready(function() {
  loadTable()
});

// Autoupdate
// every hours call table update

// Alarm (for now a place holder. Alarm triggered every 6 seconds)
function setAlarm() {
  let minutes = 0.1
  // chrome.browserAction.setBadgeText({text: 'ON'});
  chrome.alarms.create({delayInMinutes: minutes});
  chrome.storage.sync.set({minutes: minutes});
  window.close();
}

function clearAlarm() {
  chrome.alarms.clearAll();
  window.close();
}
// document.getElementById('alarmToggle').addEventListener('click', function(){
//   setAlarm()
// });

// Tooltip visual
$(function () {
  window.setTimeout(function(){
    $('[data-toggle="tooltip"]').tooltip({
     delay: { "show": 300, "hide": 500 }
    })
    updateTableContent("mainTableBody")

  },500);
})
