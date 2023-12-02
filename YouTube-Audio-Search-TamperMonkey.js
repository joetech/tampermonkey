// ==UserScript==
// @name         YouTube Audio Search
// @namespace    https://github.com/joetech/tampermonkey
// @version      0.1
// @description  Find keywords in YouTube video captions and link to their occurrences
// @author       ChatGPT (with loving guidance from Joe Colburn)
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to create a modal with a search form
    function createSearchForm() {
        const form = document.createElement('div');
        form.innerHTML = `
            <input type="text" id="keywordSearch" placeholder="comma, separated, list">
            <button id="searchButton">Search</button>
        `;
        form.style.position = 'fixed';
        form.style.top = '10%';
        form.style.left = '50%';
        form.style.transform = 'translate(-50%, -10%)';
        form.style.backgroundColor = 'white';
        form.style.padding = '20px';
        form.style.zIndex = '1000';
        form.style.border = '1px solid black';

        document.body.appendChild(form);

        // Event listener for the search button
        document.getElementById('searchButton').addEventListener('click', function() {
            const keywords = document.getElementById('keywordSearch').value.split(',').map(k => k.trim());
            findKeywordsInCaptions(keywords);
        });
    }

    // Global event listener for the ESC key
    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 27) { // 27 is the key code for ESC
            const linksModal = document.getElementById('linksModal');
            if (linksModal) {
                linksModal.remove();
            }
        }
    });

    // Function to find keywords in captions and display links
    function findKeywordsInCaptions(keywords) {
        // Assuming 'captionsData' contains the parsed caption data
        let links = [];
        captionsData.events.forEach(event => {
            if (event.segs && event.segs.length > 0) {
                event.segs.forEach(seg => {
                    if (seg.utf8) {
                        const text = seg.utf8.trim();
                        keywords.forEach(keyword => {
                            if (text.includes(keyword)) {
                                const time = Math.max(0, Math.floor(event.tStartMs / 1000) - 3);
                                const videoId = window.location.search.split('v=')[1].split('&')[0];
                                const link = `https://youtu.be/${videoId}?t=${time}`;
                                links.push(`<a href="${link}" target="_blank">Jump to '${keyword}' at ${time} seconds</a>`);
                            }
                        });
                    }
                });
            }
        });

        // Display the links
        if (links.length > 0) {
            const linksModal = document.createElement('div');
            linksModal.id = 'linksModal';
            linksModal.innerHTML = links.join('<br>');
            linksModal.style.position = 'fixed';
            linksModal.style.top = '20%';
            linksModal.style.left = '50%';
            linksModal.style.transform = 'translate(-50%, -20%)';
            linksModal.style.backgroundColor = 'white';
            linksModal.style.padding = '20px';
            linksModal.style.zIndex = '1001';
            linksModal.style.border = '1px solid black';
            document.body.appendChild(linksModal);
        }
    }

    // Intercept network requests to get caption data
    let captionsData = null;
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            if (this.responseURL.startsWith("https://www.youtube.com/api/timedtext?")) {
                try {
                    captionsData = JSON.parse(this.responseText);
                    createSearchForm(); // Create the search form when data is available
                } catch(e) {
                    console.error('Error parsing caption data:', e);
                }
            }
        });
        origOpen.apply(this, arguments);
    };

})();
