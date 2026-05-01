import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get('window');

export function SplashScreenView({ onReady }: { onReady: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    // 1. Anima entrada do logo
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Aguarda recursos (fontes, dados iniciais, etc.)
    async function prepare() {
      await new Promise(resolve => setTimeout(resolve, 2200));

      // 3. Fade out antes de esconder
      Animated.timing(opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(async () => {
        await SplashScreen.hideAsync();
        onReady();
      });
    }

    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.75,   // 75% da largura da tela
    height: height * 0.45, // 45% da altura — mantém proporção do PNG
  },
});