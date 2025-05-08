// preload.js - Pure CommonJS
const { contextBridge, ipcRenderer } = require('electron');

/**
 * Fetches the list of available MCP clients
 */
async function listClients() {
  return await ipcRenderer.invoke('list-clients');
}

/**
 * Exposes MCP APIs to the renderer process
 */
async function exposeAPIs() {
  const clients = await listClients();
  const api = {};

  const createAPIMethods = (methods) => {
    const result = {};
    Object.keys(methods).forEach(key => {
      const methodName = methods[key];
      result[key] = (...args) => ipcRenderer.invoke(methodName, ...args);
    });
    return result;
  };

  clients.forEach(client => {
    const { name, tools, prompts, resources } = client;
    api[name] = {};

    if (tools) {
      api[name]['tools'] = createAPIMethods(tools);
    }
    if (prompts) {
      api[name]['prompts'] = createAPIMethods(prompts);
    }
    if (resources) {
      api[name]['resources'] = createAPIMethods(resources);
    }
  });

  contextBridge.exposeInMainWorld('mcpServers', api);
}

exposeAPIs();