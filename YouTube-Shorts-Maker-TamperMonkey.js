// ==UserScript==
// @name         YouTube Caption Clip Finder
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Finds interesting clips from YouTube video closed captions
// @author       ChatGPT with loving guidance by Joe Colburn
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to create a modal to display results
    function createModal(content) {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '10%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -10%)';
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.zIndex = '1000';
        modal.style.border = '1px solid black';
        modal.style.fontSize = '3em'; // Increase font size
        modal.innerHTML = content;
        document.body.appendChild(modal);
    }

        // Function to generate the command for clipping
        function generateClipCommand(videoId, startTime) {
            const endTime = startTime + 10;
            return `youtube-dl -f best -g 'https://www.youtube.com/watch?v=${videoId}' | xargs -I {} ffmpeg -ss ${startTime} -i {} -t 10 -c copy video.mp4 && open video.mp4`;
        }
    
        // Function to create a copy-to-clipboard link
        function createCopyLink(command) {
            const copyLink = document.createElement('a');
            copyLink.href = '#';
            copyLink.textContent = 'Generate';
            copyLink.addEventListener('click', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(command).then(() => {
                    alert('Command copied to clipboard!');
                }, (err) => {
                    console.error('Could not copy text: ', err);
                });
            });
            return copyLink;
        }
    
    // Function to pause the current YouTube video
    function pauseCurrentVideo() {
        const video = document.querySelector('video');
        if (video) {
            video.pause();
        }
    }

    // Function to parse caption data and find clips
    function findClips(data) {
        // Parse the caption data to extract timestamps and texts
        let clips = [];
        try {
            // Assuming 'data' is already a parsed JSON object
            data.events.forEach(event => {
                if (event.segs && event.segs.length > 0) {
                    event.segs.forEach(seg => {
                        if (seg.utf8 && seg.utf8.trim() !== '') {
                            clips.push({ startTime: Math.floor(event.tStartMs / 1000), text: seg.utf8.trim() });
                        }
                    });
                }
            });

            // Now, select a few random segments from the parsed clips
            // Adjust the number of clips and the logic according to your needs
            let selectedClips = [];
            for (let i = 0; i < 6 && clips.length > 0; i++) {
                let index = Math.floor(Math.random() * clips.length);
                selectedClips.push(clips[index]);
                clips.splice(index, 1); // Remove the selected clip to avoid duplicates
            }

            if (clips.length > 0) {
                pauseCurrentVideo();
            }

            return selectedClips;
        } catch (e) {
            console.error('Error parsing caption data:', e);
            return [];
        }
    }

    // Intercept network requests
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            if (this.responseURL.startsWith("https://www.youtube.com/api/timedtext?")) {
                //console.log("Captured CC data", this.responseText);
                try {
                    const data = JSON.parse(this.responseText);
                    const clips = findClips(data);
                    if (clips.length > 0) {
                        const videoId = window.location.search.split('v=')[1].split('&')[0];
                        const content = clips.map(clip =>
                            `Clip: ${clip.text} - <a href="https://youtu.be/${videoId}?t=${clip.startTime}">Watch</a>`
                        ).join('<br>');
                        createModal(content);
                    }
                } catch(e) {
                    console.error('Error parsing caption data:', e);
                }
            }
        });
        origOpen.apply(this, arguments);
    };

})();
