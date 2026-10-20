/**
 * Central image registry for the app.
 *
 * Local files live in `src/assets/images/` — add new UI images there and
 * export them from this module. Prefer importing from here instead of
 * hardcoding CDN URLs or `require(...)` paths in screens/components.
 *
 * Expo native shell (app icon / splash / favicon) also points at
 * `src/assets/images/` via `app.json`.
 */

// --- Local files -----------------------------------------------------------

export const LOGO_IMAGE = require('../assets/images/arkiapuri-logo.png')
export const FAMILY_COOKING_IMAGE = require('../assets/images/family-cooking.png')
export const LETUT_IMAGE = require('../assets/images/letut.png')

// --- Remote placeholders & illustrations (Contentful CDN) ------------------

/** Default placeholder for food / pantry / shopping-list product rows */
export const FOOD_PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/1YIQLI04JJpf76ARo3k0b9/87322f1b9ccec07d2f2af66f7d61d53d/undraw_online-groceries_n03y.png'

/** Default placeholder for meal cards and meal lists */
export const MEAL_PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/3b9imD6TDC4i68V4uHVgL1/1ac1194dccb086bb52ebd674c59983e3/undraw_breakfast_rgx5.png'

/** @deprecated Use MEAL_PLACEHOLDER_IMAGE_URL */
export const PLACEHOLDER_IMAGE_URL = MEAL_PLACEHOLDER_IMAGE_URL

/** Logo used when a remote/uri source is required (e.g. Image uri) */
export const LOGO_IMAGE_URI =
    'https://images.ctfassets.net/hef5a6s5axrs/2wzxlzyydJLVr8T7k67cOO/90074490ee64362fe6f0e384d2b3daf8/arkiapuri-removebg-preview.png'

export const LOGO_IMAGE_SOURCE = { uri: LOGO_IMAGE_URI }

export const DEFAULT_PROFILE_IMAGE = LOGO_IMAGE_SOURCE

export const LANDING_HERO_IMAGE = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/4GwuSgvoXA0VX6cv5ix521/8545dbed4f7a510976eb78f8dcf4b91e/pexels-katerina-holmes-5907832.jpg',
}

'https://images.ctfassets.net/2pij69ehhf4n/dV2UGoK64R1sT2VmFFHb8/beccc09403ccd939f0bbdd519eb862cf/pexels-karola-g-7681236.jpg'
'https://images.ctfassets.net/2pij69ehhf4n/2gLa5t2U2KAt6rykv3scHh/3be708109afff22cda961e455c9d9b18/pexels-lulizler-20092337.jpg'
'https://images.ctfassets.net/2pij69ehhf4n/38PWYGjTAGr4VtUNM55t0k/fe51e098026add7005abeccd101dd92e/pexels-cottonbro-3298607.jpg'
'https://images.ctfassets.net/2pij69ehhf4n/1ZDEEilwqBgNUpAkpZ62cc/cf8f4995cb1395c8f498a1fe551c11c8/pexels-tara-clark-89384110-9070106.jpg'
'https://images.ctfassets.net/2pij69ehhf4n/22vckJZOsQYsur8QfzAh2R/18faf136fb484468c1618d83569fd302/pexels-thirdman-7236730.jpg'
'https://images.ctfassets.net/2pij69ehhf4n/3xQwlD3SRjWZK6VlPRqouY/b7e64f1652b48d2a2af6eafe11e1ef35/pexels-n-voitkevich-8939558.jpg'


/** Home screen navigation / feature card illustrations */
export const HOME_CARD_IMAGES = {
    meals: {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/1fvToRJqesGgl6dJCFyyJl/0f484ccfe293cca2a0a4ab57d3324c34/undraw_breakfast_rgx5.png',
    },
    pantry: {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/ShAURfxCIu9Og4KJZW5dW/ace0e55a861fa451eec6090a9b79c44e/undraw_online-groceries_n03y.png',
    },
    shoppingList: {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/4RDsykanJeWsUOE9vZJWsT/be968786ae294ee4dcedbc29823dbbdc/undraw_shopping-app_b80f.png',
    },
    readingOrder: {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/5s04BoMG8Blt6H2mvimgUK/ec13e9499e1d6e280ad8ae44c13e674b/undraw_diet_zdwe.png',
    },
    quickMeals: {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/1fvToRJqesGgl6dJCFyyJl/0f484ccfe293cca2a0a4ab57d3324c34/undraw_breakfast_rgx5.png',
    },
    randomMeal: {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/5s04BoMG8Blt6H2mvimgUK/ec13e9499e1d6e280ad8ae44c13e674b/undraw_diet_zdwe.png',
    },
}
