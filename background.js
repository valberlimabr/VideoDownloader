importScripts('VideoDownloader.js');
importScripts('Streamer.js');
importScripts('background/MediaData.js');
importScripts('background/Sniffer.js');
importScripts('background/Stream.js');
importScripts('background/Capture.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getMediaData') {
        const media = VideoDownloader.mediaData.getMediaByTabId(request.tabId);
        sendResponse({ media });
    } else if (request.action === 'startStream') {
        VideoDownloader.streamer.start(request.media);
    }
    return true; 
});


chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        console.log('Interceptando requisição:', details);
    },
    { urls: ["<all_urls>"] } 
);
