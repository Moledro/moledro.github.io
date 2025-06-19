// js/option01-logic.js
// Expose the module to the global 'window' object so script.js can access it
window.option01Logic = (function() {
    let buttonElement = null;
    let outputElement = null;
    let clickCount = 0;

    // We use .bind({ cellId: cellId }) to ensure 'this.cellId' is available in handleClick
    // This is good practice for event listeners attached this way.
    function handleClick() {
        clickCount++;
        if (outputElement) {
            outputElement.textContent = `Button clicked ${clickCount} times!`;
        }
        console.log('Option 01 button clicked in cell ${this.cellId}');
    }

    function init(cellId) {
        const contentDiv = document.getElementById(`content-display-${cellId}`);
        if (contentDiv) {
            buttonElement = contentDiv.querySelector('#option01-button');
            outputElement = contentDiv.querySelector('#option01-output');

            if (buttonElement) {
                // Attach the event listener
                buttonElement.addEventListener('click', handleClick.bind({ cellId: cellId }));
                console.log(`Option 01 logic initialized for cell: ${cellId}`);
            }
        }
    }

    function destroy(cellId) {
        if (buttonElement) {
            // IMPORTANT: Remove the listener with the same function reference and bound context
            buttonElement.removeEventListener('click', handleClick.bind({ cellId: cellId }));
            console.log(`Option 01 logic destroyed for cell: ${cellId}`);
        }
        // Reset element references and state to prevent memory leaks
        buttonElement = null;
        outputElement = null;
        clickCount = 0;
    }

    return {
        init: init,
        destroy: destroy
    };
})();