import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
  Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OutdoorBackground from '../components/OutdoorBackground';
import { Colors, Radius, Shadows, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

const brandLogo = require('../assets/brand-logo.png');

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, signInWithFacebook, signInWithInstagram } = useAuth();
  const router = useRouter();

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && !name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      if (Platform.OS === 'web') {
        router.replace('/(web)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      if (Platform.OS === 'web') router.replace('/(web)');
      else router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithFacebook();
      if (Platform.OS === 'web') router.replace('/(web)');
      else router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Facebook sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstagramSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithInstagram();
      if (Platform.OS === 'web') router.replace('/(web)');
      else router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Instagram sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <OutdoorBackground />
      <SafeAreaView style={styles.safeContent} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={styles.backToSite}
                onPress={() => router.replace('/(web)')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.claire.primary} />
                <Text style={styles.backToSiteText}>Back to site</Text>
              </TouchableOpacity>
            )}
            {/* Logo/Header */}
            <View style={styles.header}>
              {isSignUp && (
                <Text style={styles.title}>
                  Create Account
                </Text>
              )}
              <View style={styles.logoContainer}>
              <Image source={brandLogo} style={styles.logo} resizeMode="contain" />
              </View>
              <Text style={styles.subtitle}>
                {isSignUp
                  ? 'Join the adventure community'
                  : 'Sign in to continue your adventure'}
              </Text>
            </View>

          {/* Social Sign In Buttons */}
          <View style={styles.socialSection}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="google" size={24} color={Colors.ui.text} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleFacebookSignIn}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="facebook" size={24} color={Colors.ui.text} />
              <Text style={styles.socialButtonText}>Continue with Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleInstagramSignIn}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="instagram" size={24} color={Colors.ui.text} />
              <Text style={styles.socialButtonText}>Continue with Instagram</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email/Password Form */}
          <View style={styles.formSection}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.ui.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.ui.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.ui.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={isSignUp ? 'password-new' : 'password'}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleEmailAuth}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContent: {
    flex: 1,
    zIndex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.md,
  },
  backToSite: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: Spacing.md,
  },
  backToSiteText: {
    ...Typography.body,
    color: Colors.claire.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  logo: {
    width: 180,
    height: 90,
    alignSelf: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.ui.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  socialSection: {
    marginBottom: Spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  socialButtonText: {
    ...Typography.bodyBold,
    color: Colors.ui.text,
    marginLeft: Spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.ui.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.ui.textTertiary,
    marginHorizontal: Spacing.md,
  },
  formSection: {
    marginTop: 0,
  },
  inputContainer: {
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.smallBold,
    color: Colors.ui.text,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
    color: Colors.ui.text,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  primaryButton: {
    backgroundColor: Colors.claire.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadows.claire,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: '#FFF',
  },
  switchButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  switchButtonText: {
    ...Typography.body,
    color: Colors.ui.text,
  },
});
