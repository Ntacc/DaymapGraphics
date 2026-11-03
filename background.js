"use strict";

//let ports = new Map(), popup, stor, stor2;

const setStorage2 = (stor, stor2) => {
    if(stor && stor2) {
        let stor3 = {}, stor0 = Object.entries(stor);;
        for(let i = 0; i < stor0.length; i++) {
            if(JSON.stringify(stor0[i][1]) != JSON.stringify(stor2[stor0[i][0]])) {
                stor3[stor0[i][0]] = stor2[stor0[i][0]];
            }
        }
        browser.storage.sync.set(stor3);
    }
}

/*browser.runtime.onConnect.addListener((port) => {
    if(port.name == "contentScript") {
        ports.set(port.sender.tab.id, {id: port.sender.tab.id, port: port});
        ports.get(port.sender.tab.id).port.onDisconnect.addListener(() => {
            console.log(port);
            ports.delete(port.sender.tab.id);
        });
    } else if(port.name == "popup") {
        popup = port;
        popup.onDisconnect.addListener(() => {
            popup = undefined;
            if(stor && stor2) {
                setStorage2();
            }
        });
        popup.onMessage.addListener((message) => {
            if(message.changes) {
                ports.forEach((port) => {
                    port.port.postMessage(message);
                    stor2 = message.stor;
                });
            } else if(message.newStor) {
                stor = message.newStor;
            }
        });
    }
});*/

/*browser.runtime.onConnect.addListener(async (port) => {
    if(port.name == "contentScript") {
        ports.set(port.sender.tab.id, {id: port.sender.tab.id, port: port});
        ports.get(port.sender.tab.id).port.onDisconnect.addListener(() => {
            console.log(port);
            ports.delete(port.sender.tab.id);
        });
    }
});*/

browser.runtime.onMessage.addListener(async (message, sender) => {
    let tabs = (await browser.storage.session.get("tabs")).tabs;
    if(!(tabs instanceof Array)) {
        tabs = new Set();
    } else {
        tabs = new Set(tabs);
    }
    if(message.origin == "popup") {
        if(message.changes) {
            browser.storage.session.set({stor2: message.stor});
            for(let tab of tabs) {
                if(await browser.tabs.get(tab)) {
                    browser.tabs.sendMessage(tab, {origin: "background", message: message});
                } else {
                    await tabs.delete(tab);
                    browser.storage.session.set({"tabs": Array.from(tabs)});
                }
            }
        } else if(message.newStor) {
            browser.storage.session.set({stor: message.newStor});
        }
    } else if (message.origin == "contentScript") {
        await tabs.add(sender.tab.id);
        browser.storage.session.set({tabs: Array.from(tabs)});
    }
});

browser.runtime.onConnect.addListener((port) => {
    if(port.name == "popup") {
        port.onDisconnect.addListener(async () => {
            setStorage2(await browser.storage.session.get("stor"), await browser.storage.session.get("stor2"));
        });
    }
});
