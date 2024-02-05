import { exec, spawn } from "promisify-child-process";
import { spawn as baseSpawn } from "child_process";

export interface Resource {
  address: string;
  admin_url: string;
  auth_expires_at: number;
  auth_flow_id: string;
  can_open_in_browser: boolean;
  id: string;
  is_visible_in_client: boolean;
  name: string;
  open_url: string;
  type: ResourceType;
  aliases?: Alias[];
}

export interface Alias {
  address: string;
  open_url: string;
}

export type ResourceType = "fqdn" | "ip";

export interface User {
  avatar_url: string;
  email: string;
  first_name: string;
  id: string;
  is_admin: boolean;
  last_name: string;
}

export interface NetworkDetails {
  admin_url: string;
  resources: Resource[];
  user: User;
}

export enum CLIStatus {
  DOES_NOT_EXIST = "does-not-exist",
  NOT_RUNNING = "not-running",
  ONLINE = "online",
  AUTHENTICATING = "authenticating",
  UNKNOWN = "unknown",
}

export class TwingateCLI {
  public async start() {
    const { stdout, stderr } = await spawn("pkexec", ["twingate", "start"], {
      maxBuffer: 1024 * 500,
    });

    if (stderr) {
      console.log("start failed", stderr);
      return;
    }

    console.log("start success", stdout.toString());

    return stdout.toString();
  }

  public async logout() {
    const { stdout, stderr } = await spawn("pkexec", ["twingate", "stop"], {
      maxBuffer: 1024 * 500,
    });

    if (stderr) {
      console.log("logout failed", stderr);
      return;
    }

    return stdout.toString();
  }

  public async getNetworkAuthURL() {
    const { stdout, stderr } = await exec("twingate status");

    if (stderr) {
      console.log("getNetworkAuthURL failed", stderr.toString());
      return;
    }

    // TODO: this is unsafe and should be checked better for error/failure states
    const url = stdout
      .toString()
      .split("\n")
      .filter((x) => x.includes("https"))[0];

    return url;
  }

  public async getCLIStatus() {
    const { stdout } = await exec("which twingate");

    if (stdout.toString().includes("not found")) {
      return CLIStatus.DOES_NOT_EXIST;
    }

    const { stdout: statusStdOut } = await exec("twingate status");

    const status = statusStdOut.toString().split("/n")[0].trim().toLowerCase();

    console.log("status", { status, equal: status.includes("authenticating") });

    if (status.includes("authenticating")) {
      return CLIStatus.AUTHENTICATING;
    }

    switch (status) {
      case "not-running":
        return CLIStatus.NOT_RUNNING;
      case "authenticating":
        return CLIStatus.AUTHENTICATING;
      case "online":
        return CLIStatus.ONLINE;
      default:
        return CLIStatus.UNKNOWN;
    }
  }

  public async setConfig(key: string, value: string) {
    const { stdout, stderr } = await spawn(
      "pkexec",
      ["twingate", "config", key, value],
      {
        maxBuffer: 1024 * 500,
      },
    );

    if (stderr) {
      console.log("setConfig failed", stderr);
      return;
    }

    // await spawn("systemctl", ["restart", "twingate"], {
    //   maxBuffer: 1024 * 500,
    // });

    return stdout.toString();
  }

  public async getData() {
    const { stdout, stderr } = await exec("twingate-notifier resources");

    if (stderr) {
      console.log("getResources failed", stderr);
      return;
    }

    const data = JSON.parse(stdout.toString()) as NetworkDetails;

    return data;
  }

  public async getResources() {
    const data = await this.getData();

    return data.resources;
  }

  public async getResourceAuthURL(name: string) {
    const { stdout, stderr } = await exec("twingate auth " + name);

    if (stderr) {
      console.log("getResourceAuthURL failed", stderr);
      return;
    }

    // TODO: does this actually work? not sure what gets sent back....
    return stdout
      .toString()
      .match(
        /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim,
      )
      .pop();
  }
}
