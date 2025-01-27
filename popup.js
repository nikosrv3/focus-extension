var WebsiteUrl;
var WebsiteHostName;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    WebsiteUrl = tabs[0].url
    WebsiteHostName = new URL(tabs[0].url).hostname
    console.log(tabs)
    document.getElementById("url").innerText = WebsiteHostName
})

function ShowError(text = "An unknown error occurred") {
    var div = document.createElement('div');
    div.setAttribute('id', 'ERRORcontainer');
    div.innerHTML = `
        <div class="ERROR">
            <p>${text}</p>     
        </div>`;
    document.getElementsByClassName("bottomItem")[0].appendChild(div);

    setTimeout(() => {
        document.getElementById("ERRORcontainer").remove();
    }, 3000);
}

document.getElementById("unblockButton").addEventListener("click", () => {
    const urlToUnblock = document.getElementById("unblockUrlInput").value.trim();
    if (urlToUnblock) {
        chrome.runtime.sendMessage({ action: "unblock", url: urlToUnblock }, (response) => {
            if (response && response.status === "success") {
                alert(`Successfully unblocked: ${response.url}`);
            } else {
                alert("Failed to unblock the URL. Please try again.");
            }
        });
    }
});

document.getElementById("btn").addEventListener("click", () => {

    if (WebsiteUrl.toLowerCase().includes("chrome://")) {
        ShowError("You cannot block a chrome URL")
    }
    else {
        chrome.storage.local.get("BlockedUrls", (data) => {
            if (data.BlockedUrls === undefined) {
                chrome.storage.local.set({ BlockedUrls: [{ status: "In_Progress", url: WebsiteHostName }] })
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        { from: "popup", subject: "startTimer" }
                    );
                });

                setTimeout(() => {
                    var then = new Date();
                    then.setHours(24, 0, 0, 0);
                    const blockTill = then.getTime()

                    chrome.storage.local.set({
                        BlockedUrls: [{
                            status: "BLOCKED", url: WebsiteHostName, BlockTill: blockTill
                        }]
                    })
                }, 5000);

            }
            else {
                if (data.BlockedUrls.some((e) => e.url === WebsiteHostName && e.status === "In_Progress")) {
                    ShowError("This URL will be completely blocked after some time")
                }
                else if (data.BlockedUrls.some((e) => e.url === WebsiteHostName && e.status === "BLOCKED")) {
                    ShowError("This URL is Blocked completely")
                }
                else {
                    chrome.storage.local.set({ BlockedUrls: [...data.BlockedUrls, { status: "In_Progress", url: WebsiteHostName }] })

                    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            { from: "popup", subject: "startTimer" }
                        );
                    });

                    setTimeout(() => {
                        chrome.storage.local.get("BlockedUrls", (data) => {
                            data.BlockedUrls.forEach((e, index) => {
                                if (e.url === WebsiteHostName && e.status === 'In_Progress') {
                                    var arr = data.BlockedUrls.splice(index, 1);

                                    var then = new Date();
                                    then.setHours(24, 0, 0, 0);
                                    const blockTill = then.getTime()

                                    chrome.storage.local.set({ BlockedUrls: [...arr, { status: "BLOCKED", url: WebsiteHostName, BlockTill: blockTill }] })
                                }
                            })
                        })


                    }, 5000);

                }
            }
        })

    }


})

chrome.storage.local.get(null, (data) => {
    console.log("chrome.storage.local contents:", data);
});

function checkIfTabIsOpen(urlToCheck, callback) {
    chrome.tabs.query({}, (tabs) => {
        const matchingTab = tabs.find((tab) => tab.url.includes(urlToCheck));
        if (matchingTab) {
            callback(true, matchingTab); // Tab is open
        } else {
            callback(false, null); // Tab is not open
        }
    });
}

// Example Usage:
checkIfTabIsOpen("example.com", (isOpen, tab) => {
    if (isOpen) {
        console.log(`Tab is open:`, tab);
    } else {
        console.log("Tab is not open");
    }
});
