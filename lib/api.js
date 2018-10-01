function getHolders (address) {
  return axios.get('https://www.bytes.io/api/holders/' + address)
    .then(resp => {
      return resp.data;
    })
}

function getDiffInHoldings(hours, contracts) {
  return axios.get(`https://www.bytes.io/api/holders/change/${hours}`, {
    params: {contracts}
  }).then(resp => {
    return resp.data;
  })
}

function getPrices(tickers) {
  return axios.get('https://www.bytes.io/api/prices', {
    params: { tickers }
  }).then(resp => {
    return resp.data;
  })
}