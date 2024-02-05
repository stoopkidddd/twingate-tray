/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./index.css";

// console.log(
//   '👋 This message is being logged by "renderer.ts", included via Vite',
// );
//

function setNetwork(name: string) {
  // @ts-ignore
  window.electronAPI.setNetwork(name);
}

const setButton = document.getElementById("connect-button");
const networkNameInput = document.getElementById("network-name");
networkNameInput.addEventListener("keydown", (evt) => {
  if (evt.key === "Enter") {
    console.log("Enter key pressed!");
    // Perform desired actions here
    setNetwork((networkNameInput as HTMLButtonElement).value);
  }
});
setButton.addEventListener("click", () => {
  const name = (networkNameInput as HTMLButtonElement).value;
  setNetwork(name);
});
