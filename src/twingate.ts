import { exec } from 'promisify-child-process';

export interface Resource {
    address:              string;
    admin_url:            string;
    auth_expires_at:      number;
    auth_flow_id:         string;
    can_open_in_browser:  boolean;
    id:                   string;
    is_visible_in_client: boolean;
    name:                 string;
    open_url:             string;
    type:                 ResourceType;
    aliases?:             Alias[];
}

export interface Alias {
    address:  string;
    open_url: string;
}

export type ResourceType = "fqdn" | "ip";

export interface User {
    avatar_url: string;
    email:      string;
    first_name: string;
    id:         string;
    is_admin:   boolean;
    last_name:  string;
}

export interface NetworkDetails {
    admin_url: string;
    resources: Resource[];
    user: User;
}

export class TwingateCLI {
    public async getData() {
        const { stdout, stderr } = await exec("twingate-notifier resources");

        if (stderr) {
            console.log("getResources failed", stderr);
            return;
        }


        // could use schema validation lib here for safety (ex: zod)
        const data = JSON.parse(stdout.toString()) as NetworkDetails;

        return data;
    }

    public async getResources() {
        const data = await this.getData();

        return data.resources;
    }
}