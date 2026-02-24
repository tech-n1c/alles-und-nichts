// ==UserScript==
// @name         YouTube → Hassio Licht (Play/Pause)
// @namespace    yt-hass-final
// @version      1.0
// @match        *://*.youtube.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @connect      192.168.178.124
// ==/UserScript==

(() => {
    const WEBHOOK_ON  = 'http://0.0.0.0:8123/api/webhook/your-turn-on-lights-hook';
    const WEBHOOK_OFF = 'http://0.0.0.0:8123/api/webhook/your-turn-off-lights-hook';

    let lastState = null;

    function callWebhook(url) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            data: '{}',
            onload: () => console.log('Webhook gesendet:', url),
            onerror: err => console.error('Webhook Fehler', err)
        });
    }

    function hookVideo() {
        const video = document.querySelector('video');
        if (!video || video._hassHooked) return;

        video._hassHooked = true;
        console.log('Video gefunden, Events gesetzt');

        video.addEventListener('play', () => {
            if (lastState !== 'play') {
                lastState = 'play';
                console.log(' PLAY -> Licht AUS');
                callWebhook(WEBHOOK_OFF);
            }
        });

        video.addEventListener('pause', () => {
            if (lastState !== 'pause') {
                lastState = 'pause';
                console.log(' PAUSE → Licht AN');
                callWebhook(WEBHOOK_ON);
            }
        });

        video.addEventListener('ended', () => {
            lastState = 'ended';
            console.log('ENDE -> Licht AN');
            callWebhook(WEBHOOK_ON);
        });
    }

    setInterval(hookVideo, 500);
})();
