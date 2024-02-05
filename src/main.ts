import { app, BrowserWindow, Tray, nativeImage } from "electron";
import path from "path";
import { TwingateMenu } from "./menu";

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

let tray: Tray;

app.whenReady().then(async () => {
  const icon = nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJwSURBVHgB7ZZPSBtBFMa/uMGeAp5yyGlPlR5KUiI9x2OhBKFqaC/21NCLWsSjVCg2NAS8CCVFKEjZYqXUS06mlJ4CxVJBKfa0YppUgo0hCfl3mb5JTEiTiTubrAfBHzx2d2bevO89ZmcGuEYSxtgImY/sLZnOuvlx3jcBKzkP/JzsjMmjcx8MCk3iYeJszQhR0Q/kOMOsY95s8DlmPTOiWDZBcJUeOi6HOzabba+9YUgw6AtMsLn5AbOzz2SHf6IER3oKYI2Vq0KCXC6HlZUQQqEwSqUSJFHJ5nsKIB5Dgv39A0xOBrC19bGrj4syYK69Ci0BrLGBqEbe0egbBINPcXr6t9U2Pu5DMpmE3z8hFNUBD+7pEkAY7mCa9h5ra6+p5OX6t8vlojWgwW5XEAg8wvHxb0jS+iPsbY1uI6+dnTgURam/j47eRCTyChsb72Sy7sQnEuAx8kqn/9SfPPP19SimpgI4OcmgD9TmyxBMoCgNvTz7ePxzv8H/w5SAJlzA7u73nv2FQgGXKoDTrMagtAs4gkU4HA6jIXsiAV9hAX7/fcMxtVrtoEtAJpPRIAHPbmzMK+zjG9Li4oLRFFzAdpcAp9P5jR65ixx5YL7xiATwwKurEZnyH9GYbWEPbcfLsof70tIyc7u9bHr6ITs8/CXrxqrV6oue0vghQeVJykzEBYTDEZbP55kJ+D1jGBdBx6xXZqZUKsXMkkgkbkGGbDYbZBZTqVQWYAbuwCyCqvoE/RCLxW6zAa7lfD0RdzEgw8Vi8WW5XE6biH3GVzvruP8NLITufg/INBLzU5QtCdV0Xb9nJrAN/XOj47uKq8g/+GYukZ+WOTUAAAAASUVORK5CYII=",
  );
  tray = new Tray(icon);
  const menu = new TwingateMenu(app, tray);

  const m = await menu.getMenu();

  tray.setContextMenu(m);

  tray.on("click", async () => {
    console.log("tray clicked!");
    const m = await menu.getMenu();


    tray.setContextMenu(m);
  });
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
