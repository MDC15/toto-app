import { RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

const rewarded = RewardedAd.createForAdRequest(
    "ca-app-pub-1234567890123456/5566778899"
);

export function showReward() {
    rewarded.load();

    rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        rewarded.show();
    });
}
