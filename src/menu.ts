import { CLIStatus, Resource, TwingateCLI, User } from "./twingate";
import {
  App,
  Menu,
  MenuItem,
  nativeImage,
  Tray,
  clipboard,
  BrowserWindow,
  ipcMain,
} from "electron";
import open from "open";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import path from "path";

export class TwingateMenu {
  private app: App;
  private cli: TwingateCLI;
  private tray: Tray;

  private quitMenuItem: MenuItem = new MenuItem({
    label: "Quit Tray",
    type: "normal",
    click: () => this.app.quit(),
  });

  private refreshMenuItem: MenuItem = new MenuItem({
    label: "Refresh Menu",
    type: "normal",
    click: async () => {
      this.tray.setContextMenu(await this.getMenu());
      this.tray.popUpContextMenu();
    },
  });

  private logoutMenuItem: MenuItem = new MenuItem({
    label: "Logout and Disconnect",
    type: "normal",
    click: async () => {
      await this.cli.logout();
      this.tray.setContextMenu(await this.getMenu());
    },
  });

  constructor(app: App, tray: Tray) {
    this.app = app;
    this.cli = new TwingateCLI();
    this.tray = tray;
  }

  public async getMenu() {
    const status = await this.cli.getCLIStatus();

    let menu: Menu;

    console.log("getMenu", status === CLIStatus.ONLINE);

    switch (status) {
      case CLIStatus.DOES_NOT_EXIST: {
        menu = this.getInstallCLIMenu();
        break;
      }
      case CLIStatus.NOT_RUNNING: {
        menu = this.getStartTwingateServiceMenu();
        break;
      }
      case CLIStatus.AUTHENTICATING: {
        menu = this.getAuthenticatingMenu();
        break;
      }
      case CLIStatus.ONLINE: {
        menu = await this.getOnlineMenu();
        break;
      }
      default: {
        menu = this.getUnknownMenu();
        break;
      }
    }

    menu.append(new MenuItem({ type: "separator" }));
    menu.append(this.refreshMenuItem);
    menu.append(this.quitMenuItem);

    return menu;
  }

  private getStartTwingateServiceMenu() {
    return Menu.buildFromTemplate([
      {
        label: "Start Twingate Service",
        type: "normal",
        click: async () => {
          await this.cli.start();

          // TODO: this is a hack to wait for the service to start
          // Should have a shorter time and a max number of retries
          setTimeout(async () => {
            const url = await this.cli.getNetworkAuthURL();
            open(url);
          }, 1000);
        },
      },
    ]);
  }

  private getAuthenticatingMenu() {
    return Menu.buildFromTemplate([
      {
        label: "Authentication Pending",
        sublabel: "Click to Open Browser",
        type: "normal",
        click: async () => {
          const url = await this.cli.getNetworkAuthURL();
          open(url);
        },
      },
    ]);
  }

  private getInstallCLIMenu() {
    return Menu.buildFromTemplate([
      {
        label: "Install CLI",
        type: "normal",
        click: () => open("https://www.twingate.com/docs/linux"),
      },
    ]);
  }

  private getUnknownMenu() {
    return Menu.buildFromTemplate([
      {
        label: "Unknown CLI Status",
        type: "normal",
        click: () => open("https://www.twingate.com/docs/linux"),
      },
    ]);
  }

  private async getOnlineMenu() {
    const data = await this.cli.getData();
    const menu = Menu.buildFromTemplate([
      this.getUserInfoMenuItem(data.user),
      this.logoutMenuItem,
      { type: "separator" },
      ...this.getResourcesSection(data.resources),
      { type: "separator" },
      this.getMoreMenu(),
    ]);

    return menu;
  }

  private getResourcesSection(resources: Resource[]) {
    const menuItems: MenuItem[] = [];

    menuItems.push(
      new MenuItem({
        label: `${resources.length} Resources`,
        enabled: false,
        type: "normal",
      }),
    );

    resources.forEach((r) => {
      if (r.is_visible_in_client) {
        menuItems.push(this.getResourceMenuItem(r));
      }
    });

    return menuItems;
  }

  private getResourceMenuItem(resource: Resource) {
    const address =
      (resource.aliases &&
        resource.aliases.length > 0 &&
        resource.aliases[0].address) ||
      resource.address;

    return new MenuItem({
      label: resource.name,
      type: "submenu",
      submenu: Menu.buildFromTemplate([
        {
          label: address,
          enabled: false,
        },
        { label: "Copy Address", click: () => clipboard.writeText(address) },
        { label: "Open in Browser", click: () => open(resource.open_url) },
        { type: "separator" },
        {
          label:
            resource.auth_expires_at <= 0
              ? "Authentication Expired"
              : `Auth expires in ${this.getDisplayExpireDate(
                  resource.auth_expires_at,
                )}`,
          enabled: false,
        },
        {
          label: "Authenticate...",
          visible: resource.auth_expires_at <= 0,
          click: async () => {
            const url = await this.cli.getResourceAuthURL(resource.name);
            open(url);
          },
        },
      ]),
    });
  }

  private getUserInfoMenuItem(user: User) {
    const greenIcon = nativeImage.createFromDataURL(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/gD+AP7rGNSCAAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAQAAAAEABcxq3DAAAC40lEQVQ4y22TzWtcVRyGn3PPuR+TmUmazFeSKbVFm5JSahYltsSFEOofUGootZQuXLuzUNzq3yAISgm4UEEQBDdWujAUXNhCidpibGOZr8xMPiZz5+Pee87pYiImxR+8y+eB9wev4Oj5wLLKp28VXisv5Qq5EkC72W40NytrSSu8C9wDhv8C4hA84+RSHy8sX3p/5cp7x95eWKQ4mQdga6fFL49+5Zvvvt19dO/BV6bd/xSoAcgDeFYez37+7gdXb9z58KPgwvybBL5PbDSJ1aSCgLlTb3DhrcWg5Q8Wnz37+4ztRPeBrgQ8prxPzq68c+PalasgoLLfpBa2qIdt6mGbWrdFbb/FQEccP3WCzWRnrvnXPwF9/ZMCLrsLs9fnL56n1m1RDVujYuJQQftfhIX5i+d5uv7H9fjn5z8qCsHN4Fxpcig1G93qCHLE/wuMRVgYSk1wrjQZP67fVJTGlkzeozHcRhmJdQQ4jHJYYEYRxpLEGlPwoDS2pJjwpge+phq18YQ3eqsFrHhFYEcSDVEUMfA0THjTCkegXUMz2SVwAxxHIIVFORbpWAC0ESRWoK3AGMtAD9CuAUegCOM6wpaHKkGLkIxrSHmalNK4B4LYCPqJZF9IQu2QyINv9uK6otFbYy9akXlF1k/IpSIm/ISMq/GkASDSgjBW+ErhCI89R6IrEdR7a4pKb1Wsb19Oz3uT+bSlMGbJBYaspwnUSDBIHPYjg+9ahGPQ1tJZ396xld6qBDZFJ5o9dtJdnDkdUMz4FNOCYlqQSzmM+5LAdVHSBydAo+n+tkPv+9qXtpN8JhFoOslDtgZnpsrMnTidZXo8R3EsSz6VYdzP4rkTINPESZ/GgwbV1foP0Ub/NoI9eTCpbrwV3w+f9ALR68wVpwZBOaeYyXhkFAx7Xap/vuDx1y92n6y2v+g+Hd5GUMMeXSOA77gsl14Xt06edZZmy6IkgErFNp7/btYaG/auiY/O+SU8Q0Yz9B1YmAAAAC56VFh0Y3JlYXRlLWRhdGUAAHjaMzIwsNA1sNA1MgkxMLAyMrMyNtE1MLUyMAAAQgQFFppH4IIAAAAuelRYdG1vZGlmeS1kYXRlAAB42jMyMLDQNbDQNTIIMTS2MrCwMjbSNTC1MjAAAEHpBRRgjtirAAAAAElFTkSuQmCC",
    );
    return new MenuItem({
      label: user.email,
      type: "normal",
      icon: greenIcon,
      enabled: false,
    });
  }

  private getDisplayExpireDate(expires_at: number) {
    const date = fromUnixTime(expires_at);
    return formatDistanceToNow(date);
  }

  private getMoreMenu() {
    return new MenuItem({
      label: "More...",
      type: "submenu",
      submenu: Menu.buildFromTemplate([
        {
          label: "Change Network...",
          click: () => {
            this.createWindow();
          },
        },
      ]),
    });
  }

  private createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });

    ipcMain.on("set-network", async (_, name) => {
      await this.cli.setConfig("network", name);
      mainWindow.close();
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
    // mainWindow.webContents.openDevTools();
  }
}
