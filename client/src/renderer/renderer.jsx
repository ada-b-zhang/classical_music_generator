// Sample renderer code
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // List all available clients
    const clients = await window.mcpAPI.listClients();
    console.log('Available clients:', clients);
    
    // Display clients in the UI
    const clientList = document.getElementById('client-list');
    if (clientList) {
      clients.forEach(client => {
        const clientDiv = document.createElement('div');
        clientDiv.className = 'client-item';
        clientDiv.innerHTML = `
          <h3>${client.name}</h3>
          <button class="tools-button" data-client="${client.name}">List Tools</button>
        `;
        clientList.appendChild(clientDiv);
      });
    }
    
    // Add event listeners for tool buttons
    document.querySelectorAll('.tools-button').forEach(button => {
      button.addEventListener('click', async (e) => {
        const clientName = e.target.getAttribute('data-client');
        const methodName = `${clientName}-tools/list`;
        
        try {
          const toolsResult = await window.mcpAPI.callClientMethod(methodName);
          console.log(`Tools for ${clientName}:`, toolsResult);
          
          // Display tools in the UI
          const toolsContainer = document.getElementById('tools-container');
          if (toolsContainer) {
            toolsContainer.innerHTML = `<h3>Tools for ${clientName}</h3>`;
            
            if (toolsResult?.tools?.length > 0) {
              const toolsList = document.createElement('ul');
              toolsResult.tools.forEach(tool => {
                const toolItem = document.createElement('li');
                toolItem.textContent = `${tool.name}: ${tool.description || 'No description'}`;
                toolsList.appendChild(toolItem);
              });
              toolsContainer.appendChild(toolsList);
            } else {
              toolsContainer.innerHTML += '<p>No tools available</p>';
            }
          }
        } catch (error) {
          console.error(`Error fetching tools for ${clientName}:`, error);
          alert(`Error fetching tools: ${error.message}`);
        }
      });
    });
    
  } catch (error) {
    console.error('Error initializing renderer:', error);
    document.body.innerHTML = `<div class="error">Error initializing: ${error.message}</div>`;
  }
});