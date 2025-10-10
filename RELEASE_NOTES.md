# Cookly Mobile App - Release Notes

## Version 1.0.3 - Android Compatibility & Password Management Update

**Release Date:** October 10, 2025

---

### 🚀 **What's New**

#### **🔒 Password Management**

- **New Change Password Feature**: Users can now securely update their passwords from the profile screen
- **Enhanced Security**: Form validation with password strength requirements
- **User-Friendly Interface**: Toggle password visibility with eye icons for better usability
- **Real-time Validation**: Instant feedback on password requirements and confirmation matching

#### **📱 Android 15/16 Compatibility Fixes**

- **Deprecated API Resolution**: Removed deprecated `edgeToEdgeEnabled` and `predictiveBackGestureEnabled` parameters
- **Modern System UI**: Migrated to `expo-system-ui` plugin for proper edge-to-edge display handling
- **Future-Proof Configuration**: Updated app configuration to comply with Android 15 standards

#### **📺 Large Screen Device Support**

- **Orientation Freedom**: Removed portrait-only restriction to support all device orientations
- **Foldable Device Support**: Enhanced compatibility with Samsung Galaxy Fold, Google Pixel Fold, and other foldables
- **Tablet Optimization**: Improved experience on Android tablets and iPads with proper resizing support
- **Multi-Window Ready**: Full support for split-screen and multi-window modes
- **Android 16 Preparedness**: Configuration updated for upcoming Android 16 where orientation restrictions will be ignored

---

### 🔧 **Technical Improvements**

#### **Configuration Updates**

- Removed deprecated `orientation: "portrait"` restriction
- Added `supportsTablet: true` for Android devices
- Added `resizeableActivity: true` for proper foldable support
- Added `requireFullScreen: false` for iOS multitasking
- Updated system UI handling with proper plugin configuration

#### **API Enhancements**

- New `changePassword` API method with secure authentication
- Enhanced type definitions for password change requests
- Improved error handling and user feedback

#### **Security Improvements**

- Secure password validation with minimum length requirements
- Current password verification before allowing changes
- Password confirmation matching validation
- Clear security tips and best practices display

---

### 🏗️ **Architecture Changes**

#### **New Components**

- **Change Password Screen**: Complete password update interface with validation
- **Enhanced Navigation**: New route handling for password management
- **Improved Forms**: React Hook Form integration for better form management

#### **Updated Dependencies**

- Enhanced `expo-system-ui` integration
- Improved TypeScript definitions
- Better error handling across API calls

---

### 🎨 **User Experience Improvements**

#### **Navigation Enhancements**

- New "Change Password" option in profile menu
- Consistent navigation patterns with back button support
- Better visual feedback during password change process

#### **Visual Improvements**

- Password visibility toggles for better user control
- Clear validation messages and error states
- Consistent theming across new components
- Security tips section for user education

#### **Responsive Design**

- Adaptive layouts for all screen sizes
- Proper scaling on tablets and foldable devices
- Consistent experience across orientations

---

### 🛡️ **Security & Compliance**

#### **Android Compatibility**

- ✅ **Android 15 Ready**: All deprecated APIs removed
- ✅ **Android 16 Prepared**: Orientation restrictions removed for large screens
- ✅ **Play Store Compliant**: Passes all current and upcoming Google Play requirements

#### **Password Security**

- Secure password change workflow with current password verification
- Client-side validation with security best practices
- Clear user guidance on password strength requirements

---

### 📋 **Fixed Issues**

1. **Android 15 Deprecation Warnings**

   - Removed `edgeToEdgeEnabled` parameter (deprecated in Android 15)
   - Removed `predictiveBackGestureEnabled` parameter (no longer needed)
   - Migrated to modern `expo-system-ui` configuration

2. **Large Screen Device Compatibility**

   - Removed portrait-only orientation restriction
   - Added proper foldable and tablet support
   - Enabled multi-window and split-screen functionality
   - Future-proofed for Android 16 orientation handling changes

3. **User Account Management**
   - Added missing password change functionality
   - Improved profile management capabilities
   - Enhanced security workflows

---

### 🔄 **Migration Notes**

#### **For Users**

- New "Change Password" option available in Profile → Change Password
- App now supports landscape mode and multi-window usage on compatible devices
- Improved experience on tablets and foldable devices

#### **For Developers**

- Updated app.json configuration removes deprecated parameters
- New API method `changePassword` available in API service
- Enhanced TypeScript definitions for better development experience

---

### 📱 **Device Compatibility**

#### **Enhanced Support**

- **Foldable Devices**: Samsung Galaxy Fold series, Google Pixel Fold, OnePlus Open, etc.
- **Tablets**: All Android tablets, iPad (all sizes)
- **Multi-Window**: Split-screen mode on compatible devices
- **Orientation**: Portrait, landscape, and adaptive orientations

#### **Android Versions**

- ✅ Android 14 and earlier: Full compatibility maintained
- ✅ Android 15: Deprecated API warnings resolved
- ✅ Android 16: Prepared for orientation restriction changes

---

### 🚀 **What's Coming Next**

- Enhanced dietary preference management
- Recipe sharing capabilities
- Offline recipe access
- Advanced search filters
- Social features and recipe collections

---

### 📞 **Support & Feedback**

If you encounter any issues with this update:

1. Check that you're running the latest version (1.0.3)
2. Restart the app after updating
3. For foldable devices, try rotating the device to test new orientation support
4. Report any issues through the app or our support channels

---

**Built with ❤️ for better cooking experiences across all devices**

_This release ensures Cookly remains compatible with current and future Android versions while adding essential user-requested features._
