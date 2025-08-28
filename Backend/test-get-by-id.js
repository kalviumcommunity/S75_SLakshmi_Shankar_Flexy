const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'https://flexy-backend.onrender.com/api';

const testGetById = async () => {
    console.log('🔍 Testing /get-by-id endpoint...\n');
    
    try {
        // Step 1: Login as client to get authentication
        console.log('1️⃣ Logging in as client...');
        const loginResult = await axios.post(`${BASE_URL}/client-login`, {
            phone: '9876543210',
            password: 'testpass123'
        }, { withCredentials: true });
        
        console.log('✅ Login successful');
        
        // Extract cookies
        let cookies = '';
        if (loginResult.headers['set-cookie']) {
            cookies = loginResult.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
        }
        
        // Step 2: Get all experts to find a valid ID
        console.log('\n2️⃣ Getting all experts to find a valid ID...');
        const expertsResult = await axios.get(`${BASE_URL}/all-experts`, {
            headers: { 'Cookie': cookies },
            withCredentials: true
        });
        
        if (!expertsResult.data.users || expertsResult.data.users.length === 0) {
            console.log('❌ No experts found to test with');
            return;
        }
        
        const testExpertId = expertsResult.data.users[0]._id;
        console.log('✅ Found test expert ID:', testExpertId);
        
        // Step 3: Test get-by-id with valid ID
        console.log('\n3️⃣ Testing get-by-id with valid expert ID...');
        const getByIdResult = await axios.post(`${BASE_URL}/get-by-id`, {
            _id: testExpertId
        }, {
            headers: { 'Cookie': cookies },
            withCredentials: true
        });
        
        console.log('✅ get-by-id successful!');
        console.log('📋 Expert details:');
        console.log(`   Name: ${getByIdResult.data.name}`);
        console.log(`   Profession: ${getByIdResult.data.profession}`);
        console.log(`   Location: ${getByIdResult.data.location}`);
        console.log(`   Experience: ${getByIdResult.data.exp}`);
        
        // Step 4: Test with invalid ID
        console.log('\n4️⃣ Testing get-by-id with invalid ID...');
        try {
            await axios.post(`${BASE_URL}/get-by-id`, {
                _id: '507f1f77bcf86cd799439011' // Invalid but properly formatted ObjectId
            }, {
                headers: { 'Cookie': cookies },
                withCredentials: true
            });
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Correctly returned 404 for invalid ID');
            } else {
                console.log('❌ Unexpected error for invalid ID:', error.response?.data);
            }
        }
        
        // Step 5: Test with missing ID
        console.log('\n5️⃣ Testing get-by-id with missing ID...');
        try {
            await axios.post(`${BASE_URL}/get-by-id`, {}, {
                headers: { 'Cookie': cookies },
                withCredentials: true
            });
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Correctly returned 400 for missing ID');
            } else {
                console.log('❌ Unexpected error for missing ID:', error.response?.data);
            }
        }
        
        console.log('\n🎉 All get-by-id tests completed successfully!');
        
    } catch (error) {
        console.log('❌ Test failed:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
    }
};

testGetById();
