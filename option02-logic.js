// js/option02-logic.js
window.option02Logic = (function() { // <--- Make sure to change 'const' to 'window.'
    let inputElement = null;
    let displayElement = null;

    function handleInput() {
        if (displayElement && inputElement) {
            displayElement.textContent = inputElement.value;
        }
        console.log(`Option 02 input updated in cell ${this.cellId}`);
    }

    function init(cellId) {
        const contentDiv = document.getElementById(`content-display-${cellId}`);
        if (contentDiv) {
            inputElement = contentDiv.querySelector('#option02-input');
            displayElement = contentDiv.querySelector('#option02-display');

            if (inputElement) {
                inputElement.addEventListener('input', handleInput.bind({ cellId: cellId }));
                console.log(`Option 02 logic initialized for cell: ${cellId}`);
            }
        }
    }

    function destroy(cellId) {
        if (inputElement) {
            inputElement.removeEventListener('input', handleInput.bind({ cellId: cellId }));
            console.log(`Option 02 logic destroyed for cell: ${cellId}`);
        }
        inputElement = null;
        displayElement = null;
    }

    return {
        init: init,
        destroy: destroy
    };
})();