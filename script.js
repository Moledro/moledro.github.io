// Mapping of option values to their HTML content paths
const htmlContentPaths = {
    "option01": "content/option01.html",
    "option02": "content/option02.html",
    "option03": "content/option03.html",
    "option04": "content/option04.html",
    "option05": "content/option05.html"
};

// Mapping of option values to their JavaScript logic file paths
const jsLogicPaths = {
    "option01": "js/option01-logic.js",
    "option02": "js/option02-logic.js",
    "option03": "js/option03-logic.js",
    "option04": "js/option04-logic.js",
    "option05": "js/option05-logic.js"
};

// Cache for loaded JavaScript modules to prevent redundant loading
// Key: optionValue (e.g., 'option01'), Value: The JS module object (e.g., option01Logic)
const loadedJsModules = {};

// Store the current state (active option and its logic) for each cell
// Key: cellId (e.g., '0-0'), Value: { activeOption: 'option01', activeLogic: option01Logic }
const cellStates = {};


/**
 * Generates the dynamic grid based on user input.
 */
function generateGrid() {
    const numRows = document.getElementById('numRows').value;
    const numCols = document.getElementById('numCols').value;
    const gridContainer = document.getElementById('grid-container');

    // --- Cleanup existing grid before regenerating ---
    // Iterate through active cell states and call destroy on their logic
    for (const cellId in cellStates) {
        if (cellStates.hasOwnProperty(cellId)) { // Ensure it's not a prototype property
            const state = cellStates[cellId];
            if (state.activeLogic && typeof state.activeLogic.destroy === 'function') {
                state.activeLogic.destroy(cellId);
            }
            delete cellStates[cellId]; // Remove state for this cell
        }
    }
    gridContainer.innerHTML = ''; // Clear all HTML content

    // Set grid template columns based on user input
    gridContainer.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;

    // --- Generate new grid cells ---
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            const cellId = `${i}-${j}`; // Unique ID for each cell (e.g., '0-0', '0-1')

            const select = document.createElement('select');
            select.id = `select-${cellId}`; // Unique ID for each dropdown
            // When dropdown changes, update content and logic for this specific cell
            select.onchange = (event) => updateCellContentAndLogic(cellId, event.target.value);

            // Populate dropdown with options
            for (let k = 1; k <= 5; k++) {
                const option = document.createElement('option');
                const optionValue = `option0${k}`;
                option.value = optionValue;
                option.textContent = `Option 0${k}`;
                select.appendChild(option);
            }

            const contentDisplayDiv = document.createElement('div');
            contentDisplayDiv.id = `content-display-${cellId}`; // Unique ID for content display area
            contentDisplayDiv.classList.add('content-display');

            cell.appendChild(select);
            cell.appendChild(contentDisplayDiv);
            gridContainer.appendChild(cell);

            // Initialize cell state and load default content/logic (option01)
            cellStates[cellId] = { activeOption: '', activeLogic: null }; // Initialize state
            updateCellContentAndLogic(cellId, select.value); // Load initial selection
        }
    }
}

/**
 * Dynamically loads a JavaScript module if it hasn't been loaded already.
 * @param {string} optionValue - The value representing the option (e.g., 'option01').
 * @returns {Promise<Object|null>} A promise that resolves with the loaded JS module object or null if not found/error.
 */
/**
 * Dynamically loads a JavaScript module if it hasn't been loaded already.
 * @param {string} optionValue - The value representing the option (e.g., 'option01').
 * @returns {Promise<Object|null>} A promise that resolves with the loaded JS module object or null if not found/error.
 */
async function loadJsModule(optionValue) {
    // These lines below were in the wrong spot in your code.
    // They should be inside the Promise where 'script' is defined.
    // script.onload = () => {
    //     console.log(`Script ${jsPath} loaded!`);
    // }

    if (loadedJsModules[optionValue]) {
        return loadedJsModules[optionValue]; // Return cached module if already loaded
    }

    const jsPath = jsLogicPaths[optionValue];
    if (!jsPath) {
        console.warn(`No JavaScript file path defined for option: ${optionValue}`);
        return null;
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script'); // 'script' is defined here
        script.src = jsPath;
        script.async = true; // Load script asynchronously

        // This is the correct place to set the onload handler for 'script'
        script.onload = () => {
            console.log(`Script ${jsPath} loaded!`); // Your debugging log, now in the right place

            // IMPORTANT: This relies on your JS files (e.g., option01-logic.js)
            // making their module object available globally (e.g., 'option01Logic').
            let loadedModule = null;
            switch(optionValue) {
                case 'option01': loadedModule = window.option01Logic; break;
                case 'option02': loadedModule = window.option02Logic; break;
                case 'option03': loadedModule = window.option03Logic; break; // Add your other modules here
                case 'option04': loadedModule = window.option04Logic; break;
                case 'option05': loadedModule = window.option05Logic; break;
                default:
                    console.warn(`No known global module for option: ${optionValue}`);
            }

            if (loadedModule) {
                loadedJsModules[optionValue] = loadedModule; // Cache the loaded module
                resolve(loadedModule);
            } else {
                console.error(`JS module for '${optionValue}' not found or not correctly exposed after loading '${jsPath}'.`);
                reject(new Error(`Module ${optionValue} not found.`));
            }
        };

        script.onerror = (e) => {
            console.error(`Failed to load JavaScript file: ${jsPath}`, e);
            reject(new Error(`Failed to load script: ${jsPath}`));
        };

        document.body.appendChild(script); // Append to body to execute
    });
}

/**
 * Updates the HTML content and initializes/destroys associated JavaScript logic for a given cell.
 * @param {string} cellId - The unique ID of the grid cell.
 * @param {string} selectedOption - The option value selected from the dropdown.
 */
async function updateCellContentAndLogic(cellId, selectedOption) {
    const contentDisplayDiv = document.getElementById(`content-display-${cellId}`);
    if (!contentDisplayDiv) {
        console.error(`Content display div not found for cellId: ${cellId}`);
        return;
    }

    const currentCellState = cellStates[cellId];

    // 1. Destroy previous active logic if the option is changing
    if (currentCellState.activeLogic && currentCellState.activeOption !== selectedOption) {
        if (typeof currentCellState.activeLogic.destroy === 'function') {
            currentCellState.activeLogic.destroy(cellId);
        }
    }

    // 2. Load and inject the HTML content
    const htmlPath = htmlContentPaths[selectedOption];
    if (!htmlPath) {
        contentDisplayDiv.innerHTML = '<p>No HTML content available for this option.</p>';
        currentCellState.activeOption = selectedOption;
        currentCellState.activeLogic = null;
        return;
    }

    try {
        const response = await fetch(htmlPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${htmlPath}`);
        }
        const htmlContent = await response.text();
        contentDisplayDiv.innerHTML = htmlContent; // Inject the HTML

        // 3. Load and initialize the new JavaScript logic
        let newJsModule = null;
        if (jsLogicPaths[selectedOption]) { // Check if there's JS defined for this option
            newJsModule = await loadJsModule(selectedOption);
            if (newJsModule && typeof newJsModule.init === 'function') {
                newJsModule.init(cellId); // Initialize the new logic for this cell
            } else {
                console.warn(`JS module for '${selectedOption}' has no 'init' function or failed to load.`);
            }
        } else {
            console.log(`No specific JS logic defined for option: ${selectedOption}`);
        }

        // 4. Update the cell's state
        currentCellState.activeOption = selectedOption;
        currentCellState.activeLogic = newJsModule;

    } catch (error) {
        console.error(`Error loading content or script for cell ${cellId}, option ${selectedOption}:`, error);
        contentDisplayDiv.innerHTML = `<p>Error loading content: ${error.message}</p>`;
        currentCellState.activeOption = selectedOption;
        currentCellState.activeLogic = null;
    }
}

// Generate an initial grid when the page loads
document.addEventListener('DOMContentLoaded', generateGrid);
