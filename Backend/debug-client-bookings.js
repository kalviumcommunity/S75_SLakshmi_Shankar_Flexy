const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'https://flexy-backend.onrender.com/api';

// Test client credentials from our previous successful test
const testClient = {
    phone: '9876543210', // Use existing client
    password: 'testpass123'
};

const debugClientBookings = async () => {
    console.log('🔍 Debugging Client Bookings Issue...\n');
    
    try {
        // Step 1: Login as client
        console.log('1️⃣ Logging in as client...');
        const loginResult = await axios.post(`${BASE_URL}/client-login`, {
            phone: testClient.phone,
            password: testClient.password
        }, { withCredentials: true });
        
        console.log('✅ Login successful');
        
        // Extract cookies
        let cookies = '';
        if (loginResult.headers['set-cookie']) {
            cookies = loginResult.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
            console.log('📝 Cookies extracted:', cookies.substring(0, 50) + '...');
        }
        
        // Step 2: Test client bookings endpoint
        console.log('\n2️⃣ Testing client bookings endpoint...');
        const bookingsResult = await axios.get(`${BASE_URL}/client-bookings`, {
            headers: {
                'Cookie': cookies
            },
            withCredentials: true
        });
        
        console.log('✅ Client bookings retrieved successfully');
        console.log('📊 Bookings found:', bookingsResult.data.bookings?.length || 0);
        
        if (bookingsResult.data.bookings && bookingsResult.data.bookings.length > 0) {
            console.log('📋 Booking details:');
            bookingsResult.data.bookings.forEach((booking, index) => {
                console.log(`   ${index + 1}. Expert: ${booking.expertName}, Status: ${booking.status}`);
            });
        }
        
    } catch (error) {
        console.log('❌ Error occurred:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
        console.log('Full error:', error.message);
        
        // Additional debugging
        if (error.response?.data) {
            console.log('\n🔍 Detailed error analysis:');
            console.log(JSON.stringify(error.response.data, null, 2));
        }
    }
};

debugClientBookings();
