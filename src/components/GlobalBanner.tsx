import React from 'react';
import { Image, StyleSheet, View, Text, Platform } from 'react-native';

export function GlobalBanner() {
  return (
    <View style={styles.bannerContainer}>
      {/* Left Logo */}
      <View style={styles.logoBox}>
        <Image
          source={{ uri: 'https://static.wixstatic.com/media/2faa6d_acc04fb02882461e906fc55049768b40~mv2.png' }}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Center Content */}
      <View style={styles.centerContent}>
        <View style={styles.topRow}>
          <Text style={styles.yellowText}>Estd: 2003</Text>
          <View style={styles.eapcetCode}>
            <Text style={styles.yellowTextSmall}>EAPCET CODE</Text>
            <Text style={styles.sbitCode}>SBIT</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>Swarna Bharathi</Text>
        <Text style={styles.subTitle}>Institute of Science & Technology</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.yellowTextBold}>An Autonomous Institution </Text>
          <Text style={styles.whiteTextSmall}>+9187121 12331, 87127 12331, principal@sbit.ac.in</Text>
        </View>
      </View>

      {/* Right Side - Chairman & NAAC */}
      <View style={styles.rightSide}>
        <View style={styles.imageBox}>
          <Image
            // Placeholder for Chairman image
            source={require('../../assets/chairman.png')}
            style={styles.chairmanImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.imageBox}>
          <Image
            // NAAC A+ Logo
            source={require('../../assets/naac.png')}
            style={styles.naacImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    height: 70,
    backgroundColor: '#6c0b11', // Dark Maroon
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#d4af37',
  },
  logoBox: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#6c0b11',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yellowText: {
    color: '#ffcc00',
    fontWeight: 'bold',
    fontSize: 10,
  },
  yellowTextSmall: {
    color: '#ffcc00',
    fontWeight: 'bold',
    fontSize: 8,
    marginRight: 4,
  },
  yellowTextBold: {
    color: '#ffcc00',
    fontWeight: 'bold',
    fontSize: 9,
  },
  whiteTextSmall: {
    color: '#fff',
    fontSize: 8,
  },
  eapcetCode: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sbitCode: {
    color: '#ffcc00',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  mainTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    marginTop: -2,
  },
  subTitle: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    marginTop: -2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  rightSide: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 4,
  },
  imageBox: {
    width: 50,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  chairmanImage: {
    width: '100%',
    height: '100%',
  },
  naacImage: {
    width: '90%',
    height: '90%',
  },
});
