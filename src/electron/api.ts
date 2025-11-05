import axios, { Axios } from "axios";

let _instance: ApiServices | null = null;

export class ApiServices {
  private _server: Axios;
  private devMode: boolean = process.env.DEV != undefined;

  constructor(private serverUrl: string, ) {
    this._server = axios.create({baseURL: serverUrl});
  }

  server(): Axios {
   return this._server;
  }  
}

/**
 * Cria ou retorna a instância única de ApiServers.
 */
export function getApiServices(config: any): ApiServices {
  if (!_instance) {
    _instance = new ApiServices(config.serverURL);
  }
  return _instance;
}
