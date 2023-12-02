import { NetworkDetails, Resource, User } from "./twingate";
import { Menu, MenuItem, nativeImage } from "electron";

export function getMenu(data: NetworkDetails): Menu {
  const menu = Menu.buildFromTemplate([
    getUserInfoMenuItem(data.user),
    getLogoutMenuItem(),
    { type: "separator" },
    ...getResourcesSection(data.resources),
  ]);

  return menu;
}

function getUserInfoMenuItem(user: User) {
  const greenIcon = nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/gD+AP7rGNSCAAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAQAAAAEABcxq3DAAAC40lEQVQ4y22TzWtcVRyGn3PPuR+TmUmazFeSKbVFm5JSahYltsSFEOofUGootZQuXLuzUNzq3yAISgm4UEEQBDdWujAUXNhCidpibGOZr8xMPiZz5+Pee87pYiImxR+8y+eB9wev4Oj5wLLKp28VXisv5Qq5EkC72W40NytrSSu8C9wDhv8C4hA84+RSHy8sX3p/5cp7x95eWKQ4mQdga6fFL49+5Zvvvt19dO/BV6bd/xSoAcgDeFYez37+7gdXb9z58KPgwvybBL5PbDSJ1aSCgLlTb3DhrcWg5Q8Wnz37+4ztRPeBrgQ8prxPzq68c+PalasgoLLfpBa2qIdt6mGbWrdFbb/FQEccP3WCzWRnrvnXPwF9/ZMCLrsLs9fnL56n1m1RDVujYuJQQftfhIX5i+d5uv7H9fjn5z8qCsHN4Fxpcig1G93qCHLE/wuMRVgYSk1wrjQZP67fVJTGlkzeozHcRhmJdQQ4jHJYYEYRxpLEGlPwoDS2pJjwpge+phq18YQ3eqsFrHhFYEcSDVEUMfA0THjTCkegXUMz2SVwAxxHIIVFORbpWAC0ESRWoK3AGMtAD9CuAUegCOM6wpaHKkGLkIxrSHmalNK4B4LYCPqJZF9IQu2QyINv9uK6otFbYy9akXlF1k/IpSIm/ISMq/GkASDSgjBW+ErhCI89R6IrEdR7a4pKb1Wsb19Oz3uT+bSlMGbJBYaspwnUSDBIHPYjg+9ahGPQ1tJZ396xld6qBDZFJ5o9dtJdnDkdUMz4FNOCYlqQSzmM+5LAdVHSBydAo+n+tkPv+9qXtpN8JhFoOslDtgZnpsrMnTidZXo8R3EsSz6VYdzP4rkTINPESZ/GgwbV1foP0Ub/NoI9eTCpbrwV3w+f9ALR68wVpwZBOaeYyXhkFAx7Xap/vuDx1y92n6y2v+g+Hd5GUMMeXSOA77gsl14Xt06edZZmy6IkgErFNp7/btYaG/auiY/O+SU8Q0Yz9B1YmAAAAC56VFh0Y3JlYXRlLWRhdGUAAHjaMzIwsNA1sNA1MgkxMLAyMrMyNtE1MLUyMAAAQgQFFppH4IIAAAAuelRYdG1vZGlmeS1kYXRlAAB42jMyMLDQNbDQNTIIMTS2MrCwMjbSNTC1MjAAAEHpBRRgjtirAAAAAElFTkSuQmCC"
  );
  return new MenuItem({
    label: user.email,
    type: "normal",
    icon: greenIcon,
    enabled: false,
  });
}

function getLogoutMenuItem() {
  return new MenuItem({ label: "Logout and Disconnect", type: "normal" });
}

function getResourcesSection(resources: Resource[]) {
  const menuItems: MenuItem[] = [];

  menuItems.push(
    new MenuItem({
      label: `${resources.length} Resources`,
      enabled: false,
      type: "normal",
    })
  );

  resources.forEach((r) => {
    menuItems.push(getResourceMenuItem(r));
  })

  return menuItems;
}

function getResourceMenuItem(resource: Resource) {
  return new MenuItem({
    label: resource.name,
    type: "submenu",
    submenu: Menu.buildFromTemplate([
      { label: resource.address, enabled: false },
      { label: "Copy Address" },
      { type: "separator" },
      {
        label: `Auth expires in ${resource.auth_expires_at} days`,
        enabled: false,
      },
      { label: "Authentice..." },
    ]),
  });
}
