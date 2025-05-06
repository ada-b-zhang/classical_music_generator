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
import log from 'electron-log/main.js';


// Configure logging
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';

log.info('Log from the main process');

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

log.debug('Current Path:', __dirname);
log.debug('Config path:', configPath);

// Preload and index paths relative to current directory
const preloadPath = path.join(__dirname, '..', 'preload', 'preload.js');
const indexPath = path.join(__dirname, '..', 'renderer', 'index.html');

log.debug('Preload path:', preloadPath);
log.debug('Index path:', indexPath);

interface ClientObj {
  name: string;
  client: Client;
  capabilities: Record<string, any> | undefined;
}

// Helper to get full path to commands
// Helper to get full path to commands
function getFullCommandPath(command: string): string {
  // Common paths on macOS
  const commonPaths: Record<string, string[]> = {
    'npx': ['/opt/homebrew/bin/npx', '/usr/local/bin/npx', '/usr/bin/npx'],
    'uv': ['/opt/homebrew/bin/uv', '/usr/local/bin/uv', '/usr/bin/uv'],
    'python': ['/usr/bin/python', '/usr/local/bin/python', '/opt/homebrew/bin/python'],
    'python3': ['/usr/bin/python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3']
  };
  
  if (isPackaged && command in commonPaths) {
    for (const path of commonPaths[command]) {
      if (existsSync(path)) {
        log.info(`Using full path for ${command}: ${path}`);
        return path;
      }
    }
  }
  
  return command;
}

// Helper for relative paths in a packaged app
function getResourcePath(relativePath: string): string {
  if (isPackaged) {
    return path.join(process.resourcesPath, relativePath);
  }
  return relativePath;
}

function readConfig(configPath: string): McpServersConfig | null {
  try {
    log.debug('Reading config from:', configPath);
    const config = readFileSync(configPath, 'utf8');
    return JSON.parse(config);
  } catch (error) {
    log.error('Error reading config file:', error);
    return null;
  }
}

async function initClient(): Promise<ClientObj[]> {
  const config = readConfig(configPath);
  if (config) {
    log.info('Config loaded:', config);

    try {
      const clients = await Promise.all(
        Object.entries(config.mcpServers).map(async ([name, serverConfig]) => {
          log.info(`Initializing client for ${name} with config:`, serverConfig);
          
          // Modify config for production if needed
          if (isPackaged) {
            // Use full path for command
            serverConfig.command = getFullCommandPath(serverConfig.command);
            
            // Fix paths in args if necessary
            serverConfig.args = serverConfig.args.map((arg: string) => {
              // For Python scripts or similar resources
              if (typeof arg === 'string' && arg.endsWith('.py')) {
                return getResourcePath(`MCP/${path.basename(arg)}`);
              }
              return arg;
            });
            
            log.info(`Adjusted config for production:`, serverConfig);
          }

          const timeoutPromise = new Promise<Client>((resolve, reject) => {
            setTimeout(() => {
              reject(new Error(`Initialization of client for ${name} timed out after 10 seconds`));
            }, 10000); // 10 seconds
          });

          const client = await Promise.race([
            initializeClient(name, serverConfig),
            timeoutPromise,
          ]);

          log.info(`${name} initialized.`);
          const capabilities = client.getServerCapabilities();
          return { name, client, capabilities };
        })
      );

      log.info('All clients initialized.');
      return clients;
    } catch (error) {
      log.error('Error during client initialization:', error?.message);
      process.exit(1);
    }
  } else {
    log.error('NO clients initialized.');
    return [];
  }
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    }
  });

  mainWindow.loadFile(indexPath);

  // Open DevTools permanently.
  mainWindow.webContents.openDevTools();
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
      log.info(`IPC Main ${eventName}`);
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
    log.info('Capabilities:', name, '\n', capabilities);
    return registerIpcHandlers(name, client, capabilities);
  });

  log.info(features)

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
