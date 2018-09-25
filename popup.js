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
  $("#" + tableBodyId).children("tr").each(function() {
    // console.log(row)
    console.log("iterating")
  });
  // for each row call updateRowContent
  console.log("updating that table");
  var table = document.getElementById(tableBodyId);
  // console.log(table)
  var i = 0;
  console.log("finished updating this table")
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

// Construct table
chrome.storage.sync.get("tickers", function(data) {
  // console.log("The saved tickers:" + data.tickers)
  // console.log(data.tickers)
  array = data.tickers
  array.forEach(function(element){
    // construct row
    let newrow = [element, 1, 2, 3]
    // append row
    appendRow("mainTableBody", newrow)
    // update this row
    updateRowContent("mainTableBody",0)
  })
});

function hasTicker (ticker) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("tickers", (data) => {
      let oldarray = data.tickers
  
      if (oldarray.includes(ticker)) {
        resolve(true)
      } else {
        resolve(false)
      }
    });
  });
}


// The typeahead
var options = {
  theme: "plate-dark",
  url: "data/tokens.json",
  getValue: "name",
  list: {
    match: {
      enabled: true
    },
    maxNumberOfElements: 6,
    onChooseEvent: function() {
      var ticker = $("#token_name_input").getSelectedItemData().ticker;
      var address = $("#token_name_input").getSelectedItemData().address;

      hasTicker(ticker).then(ticketExists => {
        if (ticketExists) {
          oldarray.push(ticker)
          chrome.storage.sync.set({tickers: oldarray}, function() {
            console.log("The new array was saved:" + oldarray);
          });
        } else {
          // Add row to table
          let newrow = [ticker, 0,0,0] // Here, replace second entry by Top holder address
          appendRow("mainTableBody", newrow)
          // update/populate this row
          updateRowContent("mainTableBody",0)
        }
      })
    }
  }
  , minCharNumber: 2
  , template: {
    type: "custom",
    method: function(value, item) {
      // value corresponds to the "getValue" key, above.
      let abbrevAndName = item.name + " | " + item.ticker
      return "<img src='" + item.pic + "'>" + abbrevAndName
    }
  }
};

$("#token_name_input").easyAutocomplete(options);

// Tooltip visual
$(function () {
  window.setTimeout(function(){
    $('[data-toggle="tooltip"]').tooltip({
     delay: { "show": 300, "hide": 600 }
    })
  },500);
})

updateTableContent("mainTableBody")

// Autoupdate
// every hours call table update

// getHolders('0x0d88ed6e74bbfd96b831231638b66c05571e824f')
//   .then(res => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.log("Error: " + err.message);
//   })
