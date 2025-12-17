# Arkiapuri

Web app and native mobile app for iOS and Android created with React Native. Arkiapuri brings help to everyone's everyday life.

---

This app is built with React Native using [Expo](https://docs.expo.dev/) toolset and has been boostrapped with `npx create-expo-app`.

To use Expo and run the application, you must have installed:

1. [Node.js LTS release](https://nodejs.org/en/) and
2. [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall) (for Linux or macOS users, according to [this](https://docs.expo.dev/get-started/installation/) documentation)

After running `npm install` on the project folder in order to install all required npm packages, you should be able to start the app with `npm start`. There are various ways to access the app:

1. on your device using [Expo Go](https://expo.dev/client) sandbox (Android and iOS) and run the app over WLAN or USB-cable (great for quick iterations with hot reloading but has some limitations making it unfit for testing a production grade version of the app),
2. on your device using [development build](https://docs.expo.dev/develop/development-builds/create-a-build/) (more suitable for testing production grade behaviour, needs to be built again if dependencies change),
3. run an emulator using Android Studio or Xcode or
4. web version (since the project also uses react-native-web) can be tested with pressing `w` after `npm start`.

## Notes:

### Running the Application Locally

To run the application locally, follow these steps:

1. **Clone the Repository**:

    ```sh
    git clone https://github.com/your-repo/arkiapuri.git
    cd arkiapuri
    ```

2. **Install Dependencies**:

    ```sh
    npm install
    ```

3. **Environment Configuration**:
   
   The app uses `src/environment.js` for API URL configuration, not `.env` files. The `.env` file (if present) only needs:
   
   ```env
   EXPO_USE_METRO_WORKSPACE_ROOT=1
   ```
   
   **Current Configuration:**
   - `development`: Uses `http://localhost:3000` as API URL
   - `production`: Uses `https://arkiapuri-api-production.up.railway.app` as API URL
   
   The app automatically uses the correct environment based on `NODE_ENV` (set by Expo).
   
   **To Change API URLs:**
   
   Edit `src/environment.js` directly:
   
   ```javascript
   const ENV = {
       development: {
           apiUrl: 'http://localhost:3000',  // For local backend
           // Or use your IP for mobile device testing:
           // apiUrl: 'http://<your-ip-address>:3000',
       },
       production: {
           apiUrl: 'https://arkiapuri-api-production.up.railway.app',
       },
   }
   ```
   
   **Note:** The current setup in `environment.js` is sufficient for most use cases. If you want to use `.env` files instead, you would need to install `react-native-dotenv` or `react-native-config` and modify `environment.js` to read from `process.env`.

4. **Start the Backend Server**:
   Ensure that your backend server is running on port `3000` (or update the `apiUrl` in `src/environment.js` if using a different port).

5. **Run the Application**:

    For web:

    ```sh
    npm start
    ```

    Navigate to http://localhost:8081

    For mobile (using Expo):

    ```sh
    npm start
    ```

    Follow the instructions in the terminal to open the app on your mobile device using the Expo Go app.

### Additional Notes:

- **Mobile Development**: Ensure that your mobile device is connected to the same network as your development machine.
- **API Endpoints**: Make sure that the API endpoints in your application match the ones provided by your backend server.
- **Troubleshooting**: If you encounter issues, check the console logs for errors and ensure that the backend server is running and accessible from your development machine.

By following these steps, you should be able to set up and run the application locally for both web and mobile development.
