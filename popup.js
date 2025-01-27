chrome.tabs.query({active: true, currentWindow: true }, (tabs)=> {
    console.log(tabs)
})