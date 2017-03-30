///<reference types="mocha"/>
// import mocha from 'mocha';
import totalLength from './tests/total-length';
import complete from './tests/complete';
import progress from './tests/progress';
import fetch from './tests/fetch';


mocha.setup('bdd');

function unregister() {
    return navigator.serviceWorker.getRegistration()
        .then((reg) => {
            if (!reg) {
                return;
            }
            return reg.unregister()
                .then(() => {
                    console.info("Service worker unregistered")
                })
        })
}

before(function () {

    return unregister()
        .then(() => {
            console.info("Registering service worker...")
            navigator.serviceWorker.register('./worker.js');
            return navigator.serviceWorker.ready
        })

        .then(() => {
            console.info("Service Worker registered")
        })
})

after(unregister);

afterEach(() => {
    return new Promise((fulfill, reject) => {

        let channel = new MessageChannel();

        channel.port2.onmessage = () => {
            console.info("Cleared caches");
            fulfill();
        };

        navigator.serviceWorker.controller.postMessage({
            operation: 'clear-caches'
        }, [channel.port1]);
    })
})

totalLength();
complete();
progress();
fetch();

mocha.run();