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
