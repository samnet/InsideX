function getTokens() {
  return axios.get('https://www.bytes.io/api/tokens/')
    .then(resp => {
      return resp.data;
    })
    .catch(err => {
      console.log('Error getTokens')
      return []
    })
}

function getHolders (address) {
  return axios.get('https://www.bytes.io/api/holders/' + address)
    .then(resp => {
      return resp.data;
    })
    .catch(err => {
      console.log('Error getHolders', address)
      return []
    })
}

function getDiffInHoldings(hours, contracts) {
  contracts = contracts.filter(function (item, pos) {
    return contracts.indexOf(item) == pos;
  })
  return axios.get(`https://www.bytes.io/api/holders/change/${hours}`, {
    params: {contracts}
  })
  .then(resp => {
    return resp.data;
  })
  .catch(err => {
    console.log('Error getDiffInHoldings', hours, contracts)
    return []
  })
}

function getPrices(tickers) {
  tickers = tickers.filter(function (item, pos) {
    return tickers.indexOf(item) == pos;
  })
  return axios.get('https://www.bytes.io/api/prices', {
    params: { tickers }
  })
  .then(resp => {
    return resp.data;
  })
  .catch(err => {
    console.log('Error getPrices', tickers)
    return []
  })
}