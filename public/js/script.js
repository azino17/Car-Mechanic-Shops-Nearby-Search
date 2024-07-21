document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const address = document.getElementById('address').value;
    const pincode = document.getElementById('pincode').value;
    const city = document.getElementById('city').value;
    searchServices(address, pincode, city);
});

function searchServices(address, pincode, city) {
    fetch('/api/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address, pincode, city })
    })
    .then(response => response.json())
    .then(data => {
        const searchResultsDiv = document.getElementById('searchResults');
        searchResultsDiv.innerHTML = '';
        if (data.length === 0) {
            searchResultsDiv.textContent = 'No services found.';
        } else {
            data.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'card mb-2';
                resultElement.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${result}</h5>
                    </div>
                `;
                searchResultsDiv.appendChild(resultElement);
            });
        }
    })
    .catch(error => {
        console.error('Error searching for services:', error);
    });
}
