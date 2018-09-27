function getHolders (address) {
  return axios.get('http://localhost:3000/api/holders/' + address)
    .then(resp => {
      return resp.data;
    })
}

function getDiffInHoldings(contracts) {
  return axios.get('http://localhost:3000/api/holders/change?contracts=' + contracts)
    .then(resp => {
      return resp.data;
    })
}
