// The typehead
var options = {
  url: "data/tokens.json",
  getValue: "ticker",
  list: {
    match: {
      enabled: true
    },
    maxNumberOfElements: 5
  }
  , minCharNumber: 2
  , template: {
    type: "custom",
    method: function(value, item) {
      // return "<span class='flag flag-" + (item.code).toLowerCase() + "' ></span>" + value;
      let imgpath = "vendor/icons/" + (item.name).toLowerCase() + ".png"
      let country = value + " - " + item.name
      return "<img src='" + imgpath + "'>" + country
    }
  }

};
$("#addedTicker").easyAutocomplete(options);

// Tooltip visual
$(function () {
  window.setTimeout(function(){
    $('[data-toggle="tooltip"]').tooltip({
     delay: { "show": 300, "hide": 600 }
    })
  },500);
})


// Tooltip logic [ TO DO: need to be able to remove row. Should be simple, seems impossible.]
function m(anId){
  var row = document.getElementById(anId);
  console.log(row)
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

// Append to table if user inputs new tickers
let saveit = document.getElementById("saveit");
saveit.onclick = function(element) {
  // get user text input
  let addedTicker = document.getElementById("addedTicker");
  let newticker = addedTicker.value;
  // [TO DO] check on validity of this input. If not in token_list.txt, then do nothing.
  // Append newly selected ticker to saved array of selected tickers
  chrome.storage.sync.get("tickers", function(data) {
    let oldarray = data.tickers
    oldarray.push(newticker) // append is here
    chrome.storage.sync.set({tickers: oldarray}, function() {
      console.log("The new array was saved:" + oldarray);
    });
  });
  let newrow = [newticker, 1,2,3] // Here, replace second entry by Top holder address
  // 1. find address contract (C) corresponding to newticker. It is actually in token_list.txt (last column).
  // 2. call script.js C and retrieve top holder's address (H)

  getHolders('0x0d88ed6e74bbfd96b831231638b66c05571e824f')
    .then(res => {
      console.log(res)
    })
    .catch((err) => {
      console.log("Error: " + err.message);
    })

  // 3. display (H) as follows : newrow = [newticker, H, 2, 3]

  appendRow("mainTableBody", newrow)
};
