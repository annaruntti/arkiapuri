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

3. **Set Up Environment Variables**:
   Create a [.env](http://_vscodecontentref_/2) file in the root of the project and add the following environment variables:

    For web development:

    ```env
    API_URL=http://localhost:3000
    ```

    For mobile development, you need to set your IP address:

    ```env
    API_URL=http://<your-ip-address>:3000
    ```

    Replace `<your-ip-address>` with your actual IP address. You can find your IP address by running `ipconfig` on Windows or `ifconfig` on macOS/Linux in the terminal.

4. **Start the Backend Server**:
   Ensure that your backend server is running on port `3001`. If you are using a different port, update the `API_URL` accordingly.

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
