// main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import {
  Client, McpServersConfig,
  ListToolsResultSchema, CallToolResultSchema,
  ListPromptsResultSchema, GetPromptResultSchema,
  ListResourcesResultSchema, ReadResourceResultSchema, ListResourceTemplatesResultSchema
} from './types.js';
import { initializeClient, manageRequests } from './client.js';

import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';


process.env.PATH = '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine config path based on environment
let configPath = path.join(__dirname, 'config.json');

// Check if we're in a packaged app
const isPackaged = app.isPackaged;
if (isPackaged) {
  // Try looking for config in the resources directory first
  const resourceConfigPath = path.join(process.resourcesPath, 'config.json');
  if (existsSync(resourceConfigPath)) {
    configPath = resourceConfigPath;
  }
}

console.log('Current Path:', __dirname);
console.log('Config path:', configPath);

// Preload and index paths relative to current directory
const preloadPath = path.join(__dirname, '..', 'preload', 'preload.js');
const indexPath = path.join(__dirname, '../renderer/index.html');

console.log('Preload path:', preloadPath);
console.log('Index path:', indexPath);

interface ClientObj {
  name: string;
  client: Client;
  capabilities: Record<string, any> | undefined;
}

function readConfig(configPath: string): McpServersConfig | null {
  try {
    console.log('Reading config from:', configPath);
    const config = readFileSync(configPath, 'utf8');
    return JSON.parse(config);
  } catch (error) {
    console.error('Error reading config file:', error);
    return null;
  }
}

async function initClient(): Promise<ClientObj[]> {
  const config = readConfig(configPath);
  if (config) {
    console.log('Config loaded:', config);

    try {
      const clients = await Promise.all(
        Object.entries(config.mcpServers).map(async ([name, serverConfig]) => {
          console.log(`Initializing client for ${name} with config:`, serverConfig);
          
          const client = await initializeClient(name, serverConfig);

          console.log(`${name} initialized.`);
          const capabilities = client.getServerCapabilities();
          return { name, client, capabilities };
        })
      );

      console.log('All clients initialized.');
      return clients;
    } catch (error) {
      console.error('Error during client initialization:', error);
      return [];
    }
  } else {
    console.error('NO clients initialized.');
    return [];
  }
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    }
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(async () => {
  const clients = await initClient();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.handle('list-clients', () => {
    return features;
  });

  function registerIpcHandlers(
    name: string,
    client: Client,
    capabilities: Record<string, any> | undefined) {

    const feature: { [key: string]: any } = { name };

    const registerHandler = (method: string, schema: any) => {
      const eventName = `${name}-${method}`;
      console.log(`IPC Main ${eventName}`);
      ipcMain.handle(eventName, async (event, params) => {
        return await manageRequests(client, `${method}`, schema, params);
      });
      return eventName;
    };

    const capabilitySchemas = {
      tools: {
        list: ListToolsResultSchema,
        call: CallToolResultSchema,
      },
      prompts: {
        list: ListPromptsResultSchema,
        get: GetPromptResultSchema,
      },
      resources: {
        list: ListResourcesResultSchema,
        read: ReadResourceResultSchema,
        'templates/list': ListResourceTemplatesResultSchema,
      },
    };

    for (const [type, actions] of Object.entries(capabilitySchemas)) {
      if (capabilities?.[type]) {
        feature[type] = {};
        for (const [action, schema] of Object.entries(actions)) {
          feature[type][action] = registerHandler(`${type}/${action}`, schema);
        }
      }
    }

    return feature;
  }

  const features = clients.map(({ name, client, capabilities }) => {
    console.log('Capabilities:', name, '\n', capabilities);
    return registerIpcHandlers(name, client, capabilities);
  });

  console.log(features);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});