const UserModel = require('../Models/user')
const axios = require('axios')

const getProfile = async (req, res) => {
    try{
        const user = await UserModel.findById(req.user._id).select('-password');
        if(!user) {
            return res.status(404).json({ message: 'User not found'});
        }
        res.json({success: true, user });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message});
    }
};

const updateProfile = async (req, res) => {
    try{
        const{fullName, email, mobileNumber} = req.body;

        if(!fullName || !email || !mobileNumber){
            return res.status(400).json({message: 'All fields are required'};)
        }

        const existingUser = await UserModel.findOne({
            mobileNumber,
            _id: { $ne: req.user._id }
        });

        if(existingUser) {
            return res.status(400).json({message: 'Mobile Number already exists'});
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user._id,
            {fullName, email, mobileNumber},
            {new: true, runValidators: true}
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatesUser
        });

    }
    catch (error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

const getAddress = async(req, res) => {
    try{
        const user = await UserModel.findById(req.user._id).select('address');
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        res.json({success: true, address: user.address});
    }
    catch (error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

const updateAddressManual = async (req, res) => {
    try{
        const{ street, city, state, pincode, country } = req.body;

        if(!street || !city || !state || !pincode || !country){
            return res.status(400).json({message: 'All address fields are required'});
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user._id,
            {
                'address.street': street,
                'address.city': city,
                'address.state': state,
                'address.pincode': pincode,
                'address.country': country,
                'address.addressType': 'manual',
                'address.latitude': null,
                'address.longitude': null
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Address updated successfully',
            user: updatedUser
        });
    }
    catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

const updateAddressLocation = async (req, res) => {
    try{
        const {latitude, longitude} = req.body;

        if(!latitude || !longitude){
            return res.status(400).json({message: 'Latitude and longitude are required'});
        }

        const addressData = await reverseGeocode(latitude, lognitude);

        if(!addressData){
            return res.status(400).json({message: 'Unable to fetch address from coordinates'});
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user._id,
            {
                'address.street': addressData.street || '',
                'address.city': addressData.city || '',
                'address.state': addressData.state || '',
                'address.pincode': addressData.pincode || '',
                'address.country': addressData.country || '',
                'address.latitude': latitude,
                'address.longitude': longitude,
                'address.addressType': 'location'
            },
            { new: true, runValidator: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Address updated successfully using location',
            user: updatedUser
        });
    }
    catch(error) {
        res.status(500).json({ message: 'Server error', error: error.message});
    }
};

const reverseGeocode = async (lat, lon) => {
    try{
        const response = await axios.get(
            'https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1',
            {
                headers: {
                    'User-Agent': 'SmartStore/1.0'
                }
            }
        );

        if(response.data && response.data.address){
            const addr = response.data.address;
            return{
                street: `${addr.house_number || ''} ${addr.road || ''}`.trim(),
                city: addr.city || addr.town || addr.village || '',
                state: addr.state || '',
                pincode: addr.postcode || '',
                country: addr.country || ''
            };
        }
        return null
    }
    catch(error){
        console.error('Reverse geocoding error', error);
        return null;
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAddress,
    updateAddressManual,
    updateAddressLocation
};