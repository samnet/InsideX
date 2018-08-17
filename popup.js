// The typehead
var options = {
  url: "resources/tokens.json",
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
      let imgpath = "resources/icons/" + (item.name).toLowerCase() + ".png"
      let country = value + " - " + item.name
      return "<img src='" + imgpath + "'>" + country
    }
  }

};
$("#addedTicker").easyAutocomplete(options);

// Tooltip
$(function () {
  window.setTimeout(function(){
    $('[data-toggle="tooltip"]').tooltip({
     delay: { "show": 300, "hide": 600 }
    })
  },500);
})


// Function definitions
function m(anId){
  var row = document.getElementById(anId);
  console.log(row)
}
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
  // Append newly selected ticker to saved array
  let addedTicker = document.getElementById("addedTicker");
  let newticker = addedTicker.value;
  chrome.storage.sync.get("tickers", function(data) {
    let oldarray = data.tickers
    oldarray.push(newticker) // append is here
    chrome.storage.sync.set({tickers: oldarray}, function() {
      console.log("The new array was saved:" + oldarray);
    });
  });
  let newrow = [newticker, 1,2,3]
  appendRow("mainTableBody", newrow)
};
