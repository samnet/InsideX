// row content update
function updateRowContent(tableBodyId, rownum) {
  var table = document.getElementById(tableBodyId);
  // fetch & format volume change of last 3 hours
  // Compare with current value. If negative have it in red
  // otherwise have it in green
  // fetch & format volume change of last 24 hours
  // fetch & format current Price
}

// table content update
function updateTableContent(tableBodyId) {
  // for each row call updateRowContent
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
    console.log("tooltipcontent: " + tooltipcontent)
    row.setAttribute("title", tooltipcontent)
}

// Tooltip logic [ TO DO: need to be able to remove row. Should be simple, seems impossible.]
function m(anId){
  var row = document.getElementById(anId);
  console.log(row)
}

// Construct table
chrome.storage.sync.get("tickers", function(data) {
  console.log("The saved tickers:" + data.tickers)
  console.log(data.tickers)
  array = data.tickers
  array.forEach(function(element){
    // construct row
    let newrow = [element, 1, 2, 3]
    // append row
    appendRow("mainTableBody", newrow)
  })
});

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

      // Append newly selected ticker to saved array of selected tickers
      chrome.storage.sync.get("tickers", function(data) {
        let oldarray = data.tickers
        oldarray.push(ticker) // append is here
        chrome.storage.sync.set({tickers: oldarray}, function() {
          console.log("The new array was saved:" + oldarray);
        });
      });

      // Add row to table
      let newrow = [ticker, 0,0,0] // Here, replace second entry by Top holder address
      // 1. find address contract (C) corresponding to newticker. It is actually in token_list.txt (last column).
      // 2. call script.js C and retrieve top holder's address (H)
      // 3. display (H) as follows : newrow = [newticker, H, 2, 3]
      appendRow("mainTableBody", newrow)
      // updateRowContent("mainTableBody", 1)

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

// Autoupdate
// every hours call table update

// getHolders('0x0d88ed6e74bbfd96b831231638b66c05571e824f')
//   .then(res => {
//     console.log(res)
//   })
//   .catch((err) => {
//     console.log("Error: " + err.message);
//   })
