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
  // Compare with current value. If negative have it in red, else in green.
  if (newPrice > oldPrice) {
    document.getElementById(tableBodyId).rows[rownum].cells[3].style.color = "green";
  } else {
    document.getElementById(tableBodyId).rows[rownum].cells[3].style.color= "red";
  }
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
    let randomId = String(Math.round(Math.random()*100000000));
    row.setAttribute("id", randomId)
    row.setAttribute("data-toggle", "tooltip")
    row.setAttribute("data-html", "true")
    let tooltipcontent = "<button onclick='m(" + randomId + ")'> Remove </button>";
    // let tooltipcontent = "<button> Remove </button>";
    // console.log("tooltipcontent: " + tooltipcontent)
    row.setAttribute("title", tooltipcontent)
}

// Tooltip logic [ TO DO: need to be able to remove row. Should be simple, seems impossible.]
function m(anId){
  var row = document.getElementById(anId);
  // console.log(row)
}

function getTickers () {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("tickers", (data) => {
        resolve(data.tickers)
    });
  });
}


function loadTable() {
  return getTickers()
    .then((tickers) => {
      // console.log("The saved tickers:" + tickers)
      tickers.forEach(function(element){
        // construct row
        let newrow = [element, 1, 2, 3]
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

      getTickers()
        .then(tickers => {
          if (!tickers.includes(newTicker)) {
            // Add row to table
            const newrow = [ticker, 0,0,0] // Here, replace second entry by Top holder address
            tickers.push(newrow)
            chrome.storage.sync.set({tickers: tickers}, function() {
              console.log("The new array was saved:" + tickers);
            });

            appendRow("mainTableBody", newrow)
            // update/populate this row
            updateRowContent("mainTableBody",0)
          }
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
  // chrome.browserAction.setBadgeText({text: ''});
  chrome.alarms.clearAll();
  window.close();
}
document.getElementById('alarmToggle').addEventListener('click', function(){
  setAlarm()
});

// Tooltip visual
$(function () {
  window.setTimeout(function(){
    $('[data-toggle="tooltip"]').tooltip({
     delay: { "show": 300, "hide": 500 }
    })
    updateTableContent("mainTableBody")

  },500);
})
