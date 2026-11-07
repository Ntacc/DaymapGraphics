"use strict";

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
                if((await browser.tabs.get(tab).catch(() => 0))) {
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
