// ==UserScript==
// @name         Save Code Button Injector for OpenAI Chat
// @namespace    https://github.com/joetech/tampermonkey
// @version      0.1
// @description  Add a save code button next to copy code buttons in OpenAI Chat
// @author       ChatGPT (with loving guidance from Joe Colburn)
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to create and download a file
    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    // Function to add save buttons
    function addSaveButtons() {
        // Updated selector to target the new format of copy buttons
        const copyButtons = document.querySelectorAll('button:has(> svg.icon-sm)');

        copyButtons.forEach(button => {
            if (button.nextElementSibling && button.nextElementSibling.classList.contains('save-code-button')) {
                // Skip if a save button already exists
                return;
            }

            // Updated to find the nearest ancestor div with class "bg-black" and then the code block within
            const codeBlockContainer = button.closest('.bg-black');
            const codeBlock = codeBlockContainer ? codeBlockContainer.querySelector('pre code') : null;
            if (!codeBlock) return;

            // Extracting the language from the class name of the code block
            const language = codeBlock.className.split(' ').find(cl => cl.startsWith('language-')).replace('language-', '') || 'txt';

            const saveButton = document.createElement('button');
            saveButton.innerText = 'Save Code';
            saveButton.classList.add('save-code-button');
            saveButton.onclick = function() {
                const code = codeBlock.textContent;
                download(`code.${language}`, code);
            };

            // Insert the save button after the copy button
            button.parentNode.insertBefore(saveButton, button.nextSibling);
        });
    }

    // Create an observer instance to watch for DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                addSaveButtons();
            }
        });
    });

    // Configuration of the observer
    const config = { childList: true, subtree: true };

    // Pass in the target node and the observer options
    observer.observe(document.body, config);
})();
