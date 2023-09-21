document.addEventListener('DOMContentLoaded', () => {
    const requestForm = document.getElementById('requestForm');
    const urlInput = document.getElementById('urlInput');
    const tokenInput = document.getElementById('tokenInput');
    const responseContainer = document.getElementById('responseContainer');

    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        responseContainer.innerHTML = ''; // Clear previous responses

        const url = urlInput.value.trim();
        const tokens = tokenInput.value.split('\n').map(token => token.trim());

        if (!url || tokens.length === 0) {
            responseContainer.textContent = 'Please enter a URL and at least one Discord token.';
            return;
        }

        const maxConcurrentRequests = 3; // Adjust this to control concurrency
        const tokenQueue = [...tokens]; // Create a copy of the tokens array

        async function processTokenQueue() {
            while (tokenQueue.length > 0) {
                const token = tokenQueue.shift(); // Get and remove the first token from the queue

                if (token !== '') {
                    try {
                        const response = await fetch(url, {
                            method: "PUT",
                            headers: {
                                "Authorization": token,
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            body: ""
                        });

                        const message = document.createElement('div');
                        message.textContent = `API request for token: ${token}`;

                        if (response.status === 204) {
                            message.classList.add('success');
                            message.textContent += ' was successful.';
                        } else {
                            message.classList.add('failure');
                            message.textContent += ` failed with status code: ${response.status}.`;
                        }

                        responseContainer.appendChild(message);
                    } catch (error) {
                        const errorMessage = document.createElement('div');
                        errorMessage.classList.add('failure');
                        errorMessage.textContent = `An error occurred for token: ${token} (${error})`;

                        responseContainer.appendChild(errorMessage);
                    }
                }
            }
        }

        // Limit the number of concurrent requests
        const concurrentRequests = Array.from({ length: maxConcurrentRequests }, processTokenQueue);

        await Promise.all(concurrentRequests);
    });
});
