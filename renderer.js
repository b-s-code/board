/*
* Can: access DOM here.
* Cannot: access node.js APIs here.
*/

const information = document.getElementById('info');

let newContents = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;

information.innerHTML = newContents;
