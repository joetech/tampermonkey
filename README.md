# Tampermonkey Scripts

## What is this?
[TamperMonkey](http://tampermonkey.net) Scripts I find useful.  Just install the TM extnetion and then add a new script you want to use.

## Contribute?
Yeah. Send a PR if you have a useful script or want to improve one.

## Scripts
Scripts are below, split into sections.

### ChatGPT
[Save Code Button](./ChatGPT-Save-Code-TamperMonkey.js) - Finds all code blocks in a ChatGPT session and adds "Save code" links to them.  When clicked, the link will save the code from the code block, using a filename that matches the language type.  If the page updates with a new code block (which will happen a lot in a session), it will automatically see it and add the link.

### YouTube
[YouTube Audio Search](./YouTube-Audio-Search-TamperMonkey.js) - When closed captions are enabled, a search box will appear and you can type in a comma-delemited list of search words.  Then click Search and you'll get a list of links to the start time of each match.

[YouTube Shorts Maker](./YouTube-Shorts-Maker-TamperMonkey.js) - When closed captions are enabled, a list of clip links will appear, each linking to a spot in the video that the script thought was interesting based on the closed captions.

