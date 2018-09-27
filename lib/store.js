function getStore(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (data) => {
      if (chrome.runtime.error) {
        const err = new Error("Storage runtime error #get", key)
        console.log(err)
        reject(err)
      } else {
        resolve(data[key])
      }
    });
  });
}

function setStore(key, value) {
  return new Promise((resolve, reject) => {
    const temp = {}
    temp[key] = value
    chrome.storage.sync.set(temp, (data) => {
      if (chrome.runtime.error) {
        const err = new Error("Storage runtime error #get", key)
        console.log(err)
        reject(err)
      } else {
        resolve(data)
      }
    });
  });
}
