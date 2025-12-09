import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';

const interstitial = InterstitialAd.createForAdRequest(
    "ca-app-pub-1234567890123456/1122334455"
);

export function showInterstitial() {
    interstitial.load();

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitial.show();
    });
}
