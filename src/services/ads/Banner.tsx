import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

export default function Banner() {
    return (
        <BannerAd
            unitId="ca-app-pub-5365972372246300/4916948000"   // ID thật
            size={BannerAdSize.FULL_BANNER}
        />
    );
}
