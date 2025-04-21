document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Add School Form Submission
    const schoolForm = document.getElementById('school-form');
    const addMessage = document.getElementById('add-message');

    // Function to validate coordinates
    function isValidCoordinate(value) {
        // Allow any decimal number format
        return !isNaN(parseFloat(value));
    }

    schoolForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const latitudeValue = document.getElementById('latitude').value;
        const longitudeValue = document.getElementById('longitude').value;

        // Validate coordinates
        if (!isValidCoordinate(latitudeValue)) {
            addMessage.textContent = 'Please enter a valid latitude value';
            addMessage.className = 'message error';
            return;
        }

        if (!isValidCoordinate(longitudeValue)) {
            addMessage.textContent = 'Please enter a valid longitude value';
            addMessage.className = 'message error';
            return;
        }

        const latitude = latitudeValue;
        const longitude = longitudeValue;

        try {
            const response = await fetch('/addSchool', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    address,
                    latitude,
                    longitude
                })
            });

            const data = await response.json();

            if (data.success) {
                addMessage.textContent = data.message;
                addMessage.className = 'message success';
                schoolForm.reset();
            } else {
                addMessage.textContent = data.message;
                addMessage.className = 'message error';
            }
        } catch (error) {
            addMessage.textContent = 'An error occurred. Please try again.';
            addMessage.className = 'message error';
            console.error('Error:', error);
        }
    });

    // List Schools Form Submission
    const locationForm = document.getElementById('location-form');
    const schoolsList = document.getElementById('schools-list');

    locationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const latitudeValue = document.getElementById('user-latitude').value;
        const longitudeValue = document.getElementById('user-longitude').value;

        // Validate coordinates
        if (!isValidCoordinate(latitudeValue)) {
            schoolsList.innerHTML = '<p class="error">Please enter a valid latitude value</p>';
            return;
        }

        if (!isValidCoordinate(longitudeValue)) {
            schoolsList.innerHTML = '<p class="error">Please enter a valid longitude value</p>';
            return;
        }

        const latitude = latitudeValue;
        const longitude = longitudeValue;

        try {
            const response = await fetch(`/listSchools?latitude=${latitude}&longitude=${longitude}`);
            const data = await response.json();

            if (data.success) {
                displaySchools(data.data);
            } else {
                schoolsList.innerHTML = `<p class="error">${data.message}</p>`;
            }
        } catch (error) {
            schoolsList.innerHTML = '<p class="error">An error occurred. Please try again.</p>';
            console.error('Error:', error);
        }
    });

    // Function to display schools
    function displaySchools(schools) {
        if (schools.length === 0) {
            schoolsList.innerHTML = '<p>No schools found.</p>';
            return;
        }

        let html = '';

        schools.forEach(school => {
            html += `
                <div class="school-card">
                    <div class="school-name">${school.name}</div>
                    <div class="school-address">${school.address}</div>
                    <div class="school-distance">Distance: ${school.distance} km</div>
                </div>
            `;
        });

        schoolsList.innerHTML = html;
    }

    // Optional: Add geolocation to automatically fill user coordinates
    if (navigator.geolocation) {
        const geolocateButtons = document.createElement('button');
        geolocateButtons.textContent = 'Use My Location';
        geolocateButtons.className = 'btn';
        geolocateButtons.style.marginLeft = '10px';

        document.querySelector('#location-form button').after(geolocateButtons);

        geolocateButtons.addEventListener('click', function(e) {
            e.preventDefault();

            navigator.geolocation.getCurrentPosition(function(position) {
                document.getElementById('user-latitude').value = position.coords.latitude;
                document.getElementById('user-longitude').value = position.coords.longitude;
            }, function(error) {
                console.error('Geolocation error:', error);
                alert('Could not get your location. Please enter coordinates manually.');
            });
        });
    }
});
