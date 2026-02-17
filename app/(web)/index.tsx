/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - react-native types not resolving in this file (global.d.ts augmentation); runtime is correct.
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import LogoLoadingScreen from "../../components/LogoLoadingScreen";
import OutdoorBackground from "../../components/OutdoorBackground";
import WebHeader from "../../components/WebHeader";
import { Colors, Radius, Shadows, Spacing, Typography } from "../../constants/theme";

const isWeb = Platform.OS === "web";

// ——— Landing page constants ———
const HERO_GRADIENT =
  "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.4) 60%, rgba(10,10,10,0.9) 100%)";

const APP_STORE_BADGE_URI =
  "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg";
const GOOGLE_PLAY_BADGE_URI =
  "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";
const SURVEY_URL =
  "https://forms.office.com/Pages/ResponsePage.aspx?id=MQA3jGPCNki0BLhvtw0_nFLgk1DC_whHmx5uhgS8F8lUMVpGSTJVQktESEFSREJRS1ZNRzhGNkM2UC4u";
const PARTNER_SURVEY_URL =
  "https://forms.office.com/Pages/ResponsePage.aspx?id=MQA3jGPCNki0BLhvtw0_nFLgk1DC_whHmx5uhgS8F8lUNlIwMEs1QktXRVFUQ05CT1Q3WDFEWFFFUS4u";
// Add TestFlight link when there is an iOS build to share
const TESTFLIGHT_URL = "";

// ——— Backend endpoints (Power Automate) ———
// Set in Netlify env: MS_FLOW_SIGNUP_URL (YM Signup List), MS_FLOW_MESSAGES_URL (YM Messages).
// Signup List = Founder's Club only. Messages = Contact Founders only.
//
// Founder's Club (Signup) request body — use these exact keys in your flow when mapping to SharePoint:
//   { "Title": "email@...", "email": "...", "role": "explorer"|"vendor"|"both", "message": "", "form_source": "Signup", "date": "..." }
const MS_FLOW_URL_SIGNUP =
  "https://default8c370031c2634836b404b86fb70d3f.9c.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/a5e315bd5bc84a499681d1c9d033e486/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=nsuBD3lScrWg10v43s_ZMRSXNHm_J6-pE8WADRMdFCw";
const MS_FLOW_URL_MESSAGES =
  "https://default8c370031c2634836b404b86fb70d3f.9c.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/68f4089b8c464c2a86728b8f59b926fd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=KYfA6f9ZDCNuqbke1aJ7YBL6GcqUoe0iiMD7VbAjgYA";

  

const brandLogo = require("../../assets/brand-logo.png");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

function isLocalHost(): boolean {
  if (typeof window === "undefined") return false;
  const origin = window.location?.origin ?? "";
  const hostname = window.location?.hostname ?? "";
  return origin.includes("localhost") || hostname === "127.0.0.1";
}

function getSignupEndpoint(): string {
  if (typeof window === "undefined") return MS_FLOW_URL_SIGNUP;
  return isLocalHost() ? MS_FLOW_URL_SIGNUP : "/.netlify/functions/signup";
}

function getContactEndpoint(): string {
  if (typeof window === "undefined") return MS_FLOW_URL_MESSAGES;
  return isLocalHost() ? MS_FLOW_URL_MESSAGES : "/.netlify/functions/contact";
}

function Logo({ size = "header" }: { size?: "header" | "hero" | "footer" }) {
  const dims =
    size === "hero"
      ? { width: 260, height: 130 }
      : size === "footer"
        ? { width: 240, height: 120 }
        : { width: 160, height: 80 };
  return (
    <View style={[styles.logoWrap, size === "hero" && styles.logoWrapHero]}>
      <Image source={brandLogo} style={{ width: dims.width, height: dims.height }} resizeMode="contain" />
    </View>
  );
}

type JoinAs = "Explorer" | "Vendor Partner" | "Both";

export default function WebLandingScreen() {
  const [overlayDone, setOverlayDone] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactEmailBlurred, setContactEmailBlurred] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [foundersEmail, setFoundersEmail] = useState("");
  const [foundersEmailBlurred, setFoundersEmailBlurred] = useState(false);
  const [joinAs, setJoinAs] = useState<JoinAs | null>(null);
  const [foundersSubmitting, setFoundersSubmitting] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeHeadline, setWelcomeHeadline] = useState("");
  const [welcomeBody, setWelcomeBody] = useState<string[]>([]);
  const { width: windowWidth } = useWindowDimensions();
  const surveySectionY = useRef(0);
  const foundersSectionY = useRef(0);
  const appPreviewSectionY = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const headerHeight = useRef(120);
  const contentOpacity = useRef(new Animated.Value(isWeb ? 0 : 1)).current;
  const joinAsStacked = windowWidth < 480;

  const startContentFadeIn = useRef(() => {
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }).current;

  const openSurvey = () => Linking.openURL(SURVEY_URL);
  const openPartnerSurvey = () => Linking.openURL(PARTNER_SURVEY_URL);
  const openContactModal = () => setShowContactModal(true);
  const closeContactModal = () => {
    setShowContactModal(false);
    setContactEmail("");
    setContactMessage("");
    setContactEmailBlurred(false);
    setContactSubmitting(false);
  };
  const handleContactSend = async () => {
    const email = contactEmail.trim();
    if (!email || !isValidEmail(email)) {
      if (Platform.OS === "web" && typeof alert !== "undefined") {
        alert("Please enter a valid email address.");
      }
      return;
    }
    if (!contactMessage.trim()) {
      if (Platform.OS === "web" && typeof alert !== "undefined") {
        alert("Please enter a message.");
      }
      return;
    }
    setContactSubmitting(true);
    const endpoint = getContactEndpoint();
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          message: contactMessage.trim(),
          form_source: "Contact",
          date: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        let msg = "Something went wrong on our end.";
        try {
          const text = await response.text();
          if (text) {
            try {
              const data = JSON.parse(text);
              if (data?.error) msg = data.error;
              else msg = text.slice(0, 120);
            } catch {
              msg = text.slice(0, 120);
            }
          }
        } catch {
          /* use default msg */
        }
        if (typeof console !== "undefined") {
          console.warn("Contact form error", response.status, msg);
        }
        if (response.status === 500 && msg.toLowerCase().includes("configuration")) {
          if (Platform.OS === "web" && typeof alert !== "undefined") {
            alert("Contact form is not configured yet. Please email Ryan@YourMountains.Life directly.");
          }
        } else if (Platform.OS === "web" && typeof alert !== "undefined") {
          alert(`We couldn't send your message (${response.status}). Please try again or email Ryan@YourMountains.Life.`);
        }
        setContactSubmitting(false);
        return;
      }
      if (Platform.OS === "web" && typeof alert !== "undefined") {
        alert("Message sent! We'll reply as soon as we can.");
      }
      closeContactModal();
    } catch (err) {
      if (typeof console !== "undefined") {
        console.warn("Contact form request failed:", err, "endpoint:", endpoint);
      }
      if (Platform.OS === "web" && typeof alert !== "undefined") {
        alert("We couldn't send your message. Check your connection and try again, or email Ryan@YourMountains.Life.");
      }
      setContactSubmitting(false);
    }
  };
  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
    setWelcomeHeadline("");
    setWelcomeBody([]);
  };

  const roleToApi = (j: JoinAs): "explorer" | "vendor" | "both" => {
    if (j === "Explorer") return "explorer";
    if (j === "Vendor Partner") return "vendor";
    return "both";
  };

  const handleFoundersSubmit = async () => {
    const email = foundersEmail.trim();
    if (!email || !joinAs) return;
    if (!isValidEmail(email)) {
      if (Platform.OS === "web" && typeof alert !== "undefined") {
        alert("Please enter a valid email address.");
      }
      return;
    }
    setFoundersSubmitting(true);
    const role = roleToApi(joinAs);
    const data = {
      Title: email,
      email,
      role,
      message: "",
      form_source: "Signup",
      date: new Date().toISOString(),
    };
    const attemptSignup = async (endpoint: string) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res;
    };

    try {
      let response = await attemptSignup(getSignupEndpoint());
      if (!response.ok && !isLocalHost()) {
        const status = response.status;
        const text = await response.text();
        if (typeof console !== "undefined") {
          console.warn("Founder's Club proxy failed", status, text?.slice(0, 200));
        }
        if ((status === 500 || status === 502) && text?.toLowerCase().includes("configuration")) {
          if (Platform.OS === "web" && typeof alert !== "undefined") {
            alert("Signup isn't configured on the server. Please email Ryan@YourMountains.Life to join the Founder's Club.");
          }
          setFoundersSubmitting(false);
          return;
        }
        response = await attemptSignup(MS_FLOW_URL_SIGNUP);
      }
      if (response.ok) {
        if (role === "explorer") {
          setWelcomeHeadline("The Trail Starts Here.");
          setWelcomeBody([
            "Welcome to the collective. You've just secured your spot as one of the first 10,000 members of Your Mountains.",
            "We aren't just building an app; we're building a movement. As a Founder's Club member, you'll have early access and exclusive badges.",
          ]);
        } else if (role === "vendor") {
          setWelcomeHeadline("Partnering for a New Era.");
          setWelcomeBody([
            "Thank you for believing in the vision. You're stepping up to shape how the outdoor industry connects with explorers.",
            "We're limiting Founding Partner status to just 20 businesses per region. We'll be in touch shortly.",
          ]);
        } else {
          setWelcomeHeadline("Explorer by Day, Builder by Trade.");
          setWelcomeBody([
            "Welcome to the inner circle. You've joined not just as an explorer, but as a partner looking to fuel adventure for others.",
            "You've secured your spot as a Founder's Club member, and we've flagged your interest as a Regional Founding Partner.",
          ]);
        }
        setShowWelcomeModal(true);
        setFoundersEmail("");
        setFoundersEmailBlurred(false);
        setJoinAs(null);
      } else {
        let msg = "Signup didn't go through.";
        try {
          const text = await response.text();
          if (text) {
            try {
              const parsed = JSON.parse(text);
              if (parsed?.error) msg = parsed.error;
              else msg = text.slice(0, 100);
            } catch {
              msg = text.slice(0, 100);
            }
          }
        } catch {
          /* use default */
        }
        if (typeof console !== "undefined") console.warn("Founder's Club signup error", response.status, msg);
        if (Platform.OS === "web" && typeof alert !== "undefined") {
          alert(`${msg} Please try again or email Ryan@YourMountains.Life to join.`);
        }
      }
    } catch (err) {
      if (typeof console !== "undefined") console.warn("Founder's Club signup request failed:", err);
      if (Platform.OS === "web" && typeof alert !== "undefined") {
        alert("We couldn't reach the server. Check your connection and try again—or email Ryan@YourMountains.Life to join the Founder's Club.");
      }
    } finally {
      setFoundersSubmitting(false);
    }
  };

  const openTestFlight = () =>
    TESTFLIGHT_URL && Linking.openURL(TESTFLIGHT_URL);

  const scrollToSurvey = () => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, surveySectionY.current - headerHeight.current - 20),
      animated: true,
    });
  };
  const scrollToFounders = () => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, foundersSectionY.current - headerHeight.current - 20),
      animated: true,
    });
  };
  const scrollToAppPreview = () => {
    scrollViewRef.current?.scrollTo({
      y: appPreviewSectionY.current,
      animated: true,
    });
  };

  return (
    <View style={styles.wrapper}>
      <WebHeader 
        onScrollToSurvey={scrollToSurvey}
        onScrollToFounders={scrollToFounders}
        onHeaderLayout={(h) => { headerHeight.current = h; }}
      />
      <Animated.View
        style={[styles.contentFadeWrap, { opacity: contentOpacity }]}
      >
        <OutdoorBackground />
        <View style={isWeb ? styles.scrollWrapWeb : styles.scrollWrap}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero — full viewport feel */}
            <View
              style={[
                styles.hero,
                isWeb && styles.heroWeb,
                isWeb && ({ backgroundImage: HERO_GRADIENT } as object),
              ]}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroHeadline}>
                  No Excuses.{"\n"}Get Out There and Move.
                </Text>
                <Text style={styles.heroBody}>
                  We&apos;re building the world&apos;s largest outdoor-minded
                  community — powered by AI to inspire movement, exploration,
                  and thriving beyond walls.
                </Text>
                <Text style={styles.heroBody}>
                  Whether you are the busy mom planning your family&apos;s
                  weekends and vacations, or a solo explorer seeking your next
                  adventure or even your tribe—we give you the tools to make it
                  happen.
                </Text>
              </View>
            </View>

            {/* Mission — combined manifesto */}
            <View style={[styles.section, styles.missionSection]}>
              <View style={styles.missionCard}>
                <Text style={styles.missionLabel}>OUR MISSION</Text>
                <Text style={styles.missionBody}>
                  We make the outdoors radically more accessible by removing
                  barriers, inspiring lifelong motion, and proving that with
                  community, anything is possible. We are the bridge between
                  human passion and innovation — a new era of outdoor
                  connection.
                </Text>
                <View style={styles.missionDivider} />
                <Text style={styles.missionLabel}>
                  WE&apos;RE UNLOCKING THE OUTDOORS
                </Text>
                <View style={styles.missionPillars}>
                  <Text style={styles.missionPillar}>
                    &ldquo;Adventure is within your reach.&rdquo;
                  </Text>
                  <Text style={styles.missionPillar}>
                    &ldquo;The right gear is accessible.&rdquo;
                  </Text>
                  <Text style={styles.missionPillar}>
                    &ldquo;There is a community waiting for you.&rdquo;
                  </Text>
                </View>
                <Text style={styles.missionAccent}>
                  So that everyone can live a healthier life.
                </Text>
              </View>
            </View>

            {/* App preview — iPhone mockup + optional TestFlight CTA */}
            {isWeb && (
              <View
                style={[styles.section, styles.appPreviewSection]}
                onLayout={(e: { nativeEvent: { layout: { y: number } } }) => {
                  appPreviewSectionY.current = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.appPreviewContent}>
                  <Text style={styles.appPreviewTitle}>See the app</Text>
                  <Text style={styles.appPreviewSub}>
                    Community, and the outdoors in your pocket.
                  </Text>
                  {TESTFLIGHT_URL && (
                    <View style={styles.appPreviewBetaBlock}>
                      <TouchableOpacity
                        style={styles.ctaPrimary}
                        onPress={openTestFlight}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.ctaPrimaryText}>
                          Try the iOS beta
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={styles.comingSoonTouchable}>
                    <TouchableOpacity
                      onPress={scrollToAppPreview}
                      activeOpacity={0.9}
                      style={styles.comingSoonTextTouchable}
                    >
                      <Text
                        style={[
                          styles.comingSoonLabel,
                          {
                            fontSize: 36,
                            lineHeight: 44,
                            color: "#FFFFFF",
                            fontWeight: "700",
                          },
                        ]}
                      >
                        Beta coming soon to
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.storeBadges,
                        { opacity: 0.7 },
                        isWeb && {
                          filter: "grayscale(100%)",
                        } as { filter: string },
                      ]}
                      pointerEvents="none"
                    >
                      <View style={styles.storeBadge}>
                        <Image
                          source={{ uri: APP_STORE_BADGE_URI }}
                          style={[styles.storeBadgeImage, { opacity: 0.8 }]}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={styles.storeBadge}>
                        <Image
                          source={{ uri: GOOGLE_PLAY_BADGE_URI }}
                          style={[
                            styles.storeBadgeImageGoogle,
                            { opacity: 0.8 },
                          ]}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.phoneMockup}>
                    <View style={styles.phoneFrame}>
                      <View style={styles.phoneScreen}>
                        <Image
                          source={require("../../assets/app-first-screen.png")}
                          style={styles.phoneScreenImage}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Two paths — Explorers & Vendor Partners (combined) */}
            <View
              style={[styles.section, styles.pathsSection]}
              onLayout={(e: { nativeEvent: { layout: { y: number } } }) => {
                surveySectionY.current = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.pathsCombinedCard}>
                <Text style={styles.pathsCombinedTitle}>Take the Survey</Text>
                <Text style={styles.pathsCombinedIntro}>
                  Help us shape the future of the Collective. We are not guessing
                  what you need — we&apos;re asking. Your input shapes what we
                  build. Take the survey as an Explorer or a Vendor Partner.
                </Text>
                <View style={styles.pathsGrid}>
                  <View style={styles.pathCard}>
                    <View style={styles.pathIconWrap}>
                      <Ionicons
                        name="compass-outline"
                        size={28}
                        color={Colors.claire.primary}
                      />
                    </View>
                    <Text style={styles.h3}>Explorers</Text>
                    <Text style={styles.body}>
                      What stops you from getting outside? Gear, time, or
                      confidence? If you are an outdoor enthusiast, or aspire to
                      be, take the 2 minute survey, and help us crush those
                      barriers.
                    </Text>
                    <TouchableOpacity
                      style={styles.pathCtaButton}
                      onPress={openSurvey}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.pathCtaButtonText}>
                        Take the Explorer Survey
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.pathCard}>
                    <View style={styles.pathIconWrap}>
                      <Ionicons
                        name="storefront-outline"
                        size={28}
                        color={Colors.claire.primary}
                      />
                    </View>
                    <Text style={styles.h3}>Vendor Partners</Text>
                    <Text style={styles.body}>
                      Let&apos;s focus on meaningful impressions. If you are an
                      outdoor business (e.g. gear shop, guides, tour operator)
                      tell us how we can help you reach high-intent, loyal
                      customers.
                    </Text>
                    <TouchableOpacity
                      style={styles.pathCtaButton}
                      onPress={openPartnerSurvey}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.pathCtaButtonText}>
                        Take the Vendor Partner Survey
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Final CTA — Founder's Club + Coming soon */}
            <View
              style={[styles.section, styles.finalCtaSection]}
              onLayout={(e: { nativeEvent: { layout: { y: number } } }) => {
                foundersSectionY.current = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.foundersCard}>
                <Text style={styles.foundersTitle}>
                  Join the Founder&apos;s Club
                </Text>
                <Text style={styles.foundersIntro}>
                  Build the Future of Outdoor Access. We&apos;re gathering the
                  explorers, the guides, the gear shops, and the dreamers. Join
                  the Founder&apos;s Club to stay in touch and gain access to
                  founders only exclusives.
                </Text>
                <View style={styles.pathsGrid}>
                  <View style={styles.pathCard}>
                    <View style={styles.pathIconWrap}>
                      <Ionicons
                        name="compass-outline"
                        size={28}
                        color={Colors.claire.primary}
                      />
                    </View>
                    <Text style={styles.h3}>Explorers</Text>
                    <Text style={styles.foundersPathBody}>
                      The first{" "}
                      <Text style={styles.foundersBodyBold}>10,000 members</Text>{" "}
                      earn permanent Founder&apos;s Club status — a once-ever
                      honor. Enjoy exclusive badges, priority access, special
                      perks, and members-only invitations that will never be
                      offered again. Secure your spot in history as one of the
                      originals who helped shape this community.
                    </Text>
                  </View>
                  <View style={styles.pathCard}>
                    <View style={styles.pathIconWrap}>
                      <Ionicons
                        name="storefront-outline"
                        size={28}
                        color={Colors.claire.primary}
                      />
                    </View>
                    <Text style={styles.h3}>Vendor Partners</Text>
                    <Text style={styles.foundersPathBody}>
                      We&apos;re opening just{" "}
                      <Text style={styles.foundersBodyBold}>
                        20 Founding Vendor Partner spots
                      </Text>{" "}
                      per region. Early partners receive lifetime reduced
                      commissions, premium placement, exclusive event access,
                      and ongoing visibility that future vendors can&apos;t match.
                      Join early and lock in lasting benefits while helping
                      build the foundation of our marketplace.
                    </Text>
                  </View>
                </View>
                <View style={styles.foundersFieldGroup}>
                  <Text style={styles.foundersLabel}>Email Address</Text>
                  <TextInput
                    style={[
                      styles.foundersInput,
                      foundersEmailBlurred &&
                        foundersEmail.length > 0 &&
                        !isValidEmail(foundersEmail) &&
                        styles.foundersInputError,
                    ]}
                    placeholder="you@example.com"
                    placeholderTextColor={Colors.ui.textTertiary}
                    value={foundersEmail}
                    onChangeText={setFoundersEmail}
                    onBlur={() => setFoundersEmailBlurred(true)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {foundersEmailBlurred &&
                    foundersEmail.length > 0 &&
                    !isValidEmail(foundersEmail) && (
                      <Text style={styles.foundersInputErrorText}>
                        Please enter a valid email address.
                      </Text>
                    )}
                </View>
                <View style={styles.foundersFieldGroup}>
                  <Text style={styles.foundersLabel}>I am joining as...</Text>
                  <View
                    style={[
                      styles.joinAsRow,
                      joinAsStacked && styles.joinAsRowStacked,
                    ]}
                  >
                    {(["Explorer", "Vendor Partner", "Both"] as const).map(
                      (option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.joinAsOption,
                            joinAs === option && styles.joinAsOptionSelected,
                          ]}
                          onPress={() => setJoinAs(option)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.joinAsOptionText,
                              joinAs === option &&
                                styles.joinAsOptionTextSelected,
                            ]}
                          >
                            {option === "Explorer"
                              ? "an Explorer"
                              : option === "Vendor Partner"
                                ? "a Vendor Partner"
                                : option}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.ctaPrimary,
                    styles.ctaPrimaryCentered,
                    (foundersSubmitting ||
                      !foundersEmail.trim() ||
                      !isValidEmail(foundersEmail) ||
                      !joinAs) &&
                      styles.ctaPrimaryDisabled,
                  ]}
                  onPress={handleFoundersSubmit}
                  disabled={
                    foundersSubmitting ||
                    !foundersEmail.trim() ||
                    !isValidEmail(foundersEmail) ||
                    !joinAs
                  }
                  activeOpacity={0.8}
                >
                  {foundersSubmitting ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.ctaPrimaryText}>
                      Join the Founder&apos;s Club
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerInner}>
                <Logo size="footer" />
                <View style={styles.footerLinks}>
                  <TouchableOpacity
                    onPress={openContactModal}
                    activeOpacity={0.7}
                    style={styles.footerContactButton}
                  >
                    <Text style={styles.footerContactText}>
                      Contact Founders
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.footerCopy}>© 2026 Your Mountains</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Animated.View>
      {/* Loading overlay: fades to transparent so website shows through (no white flash). */}
      {isWeb && (
        <View
          style={[
            styles.loadingOverlay,
            overlayDone && styles.loadingOverlayDone,
          ]}
          pointerEvents={overlayDone ? "none" : "auto"}
        >
          <LogoLoadingScreen
            onDone={() => setOverlayDone(true)}
            onFadeStart={startContentFadeIn}
          />
        </View>
      )}

      {/* Contact Us modal */}
      <Modal
        visible={showContactModal}
        transparent
        animationType="fade"
        onRequestClose={closeContactModal}
      >
        <TouchableOpacity
          style={styles.contactModalOverlay}
          activeOpacity={1}
          onPress={closeContactModal}
        >
          <TouchableOpacity
            style={styles.contactModalCard}
            activeOpacity={1}
            onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
          >
            <Text style={styles.contactModalTitle}>Contact Us</Text>
            <Text style={styles.contactModalBody}>
              The best trails are forged together, and we can&apos;t build this
              without you. No question is too small and no idea is too big.
              Drop us a line below—we are real people on the other end, and
              we&apos;ll do our best to respond ASAP.
            </Text>
            <View style={styles.contactFieldGroup}>
              <Text style={styles.contactLabel}>Email Address</Text>
              <TextInput
                style={[
                  styles.contactInput,
                  contactEmailBlurred &&
                    contactEmail.length > 0 &&
                    !isValidEmail(contactEmail) &&
                    styles.contactInputError,
                ]}
                placeholder="you@example.com"
                placeholderTextColor={Colors.ui.textTertiary}
                value={contactEmail}
                onChangeText={setContactEmail}
                onBlur={() => setContactEmailBlurred(true)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {contactEmailBlurred &&
                contactEmail.length > 0 &&
                !isValidEmail(contactEmail) && (
                  <Text style={styles.contactInputErrorText}>
                    Please enter a valid email address.
                  </Text>
                )}
            </View>
            <View style={styles.contactFieldGroup}>
              <Text style={styles.contactLabel}>Message</Text>
              <TextInput
                style={[styles.contactInput, styles.contactMessageInput]}
                placeholder="Write your message here..."
                placeholderTextColor={Colors.ui.textTertiary}
                value={contactMessage}
                onChangeText={setContactMessage}
                multiline
                textAlignVertical="top"
              />
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.contactCancel}
                onPress={closeContactModal}
                activeOpacity={0.8}
              >
                <Text style={styles.contactCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.contactSendButton,
                  contactSubmitting && styles.contactSendButtonDisabled,
                ]}
                onPress={handleContactSend}
                disabled={contactSubmitting}
                activeOpacity={0.8}
              >
                <Text style={styles.contactSendText}>
                  {contactSubmitting ? "Sending..." : "Send Message"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Welcome modal after Founder's Club signup */}
      <Modal
        visible={showWelcomeModal}
        transparent
        animationType="fade"
        onRequestClose={closeWelcomeModal}
      >
        <TouchableOpacity
          style={styles.welcomeModalOverlay}
          activeOpacity={1}
          onPress={closeWelcomeModal}
        >
          <TouchableOpacity
            style={styles.welcomeModalCard}
            activeOpacity={1}
            onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
          >
            <View style={styles.welcomeModalIconWrap}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={Colors.semantic.success}
              />
            </View>
            <Text style={styles.welcomeModalHeadline}>{welcomeHeadline}</Text>
            <View style={styles.welcomeModalBody}>
              {welcomeBody.map((paragraph, i) => (
                <Text key={i} style={styles.welcomeModalParagraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
            <TouchableOpacity
              style={styles.welcomeModalButton}
              onPress={closeWelcomeModal}
              activeOpacity={0.8}
            >
              <Text style={styles.welcomeModalButtonText}>
                Got it, let&apos;s go.
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    position: "relative",
    ...(isWeb && { minHeight: "100vh" as unknown as number }),
    zIndex: 0,
  },
  contentFadeWrap: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loadingOverlayDone: {
    pointerEvents: "none",
  },
  scrollWrap: {}, // non-web: no extra layout
  scrollWrapWeb: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 0,
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 1,
    ...(isWeb && { minHeight: 0, overflow: "auto" as const }),
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl * 2,
    flexGrow: 1,
  },

  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapHero: {
    marginBottom: Spacing.md,
  },

  // Hero
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl * 1.5,
    paddingBottom: Spacing.xxxl,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  heroWeb: {
    ...(isWeb && { minHeight: "100vh" as unknown as number }),
    paddingTop: 160,
    paddingBottom: Spacing.xxxl,
    justifyContent: "center",
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
    maxWidth: 880,
    width: "100%",
  },
  heroTagline: {
    ...Typography.body,
    color: Colors.claire.primary,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 3,
    fontSize: 14,
  },
  heroHeadline: {
    ...Typography.display,
    color: Colors.ui.text,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 48,
    ...(isWeb &&
      ({
        fontSize: 52,
        lineHeight: 58,
        marginBottom: Spacing.xl,
        fontFamily: "'Outfit', system-ui, sans-serif",
        fontWeight: "800",
      } as object)),
  },
  heroBody: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    textAlign: "center",
    maxWidth: 720,
    marginBottom: Spacing.xl,
    lineHeight: 26,
    ...(isWeb && ({ fontSize: 20, lineHeight: 30 } as object)),
  },
  heroCtaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  heroCtaButton: {
    backgroundColor: Colors.claire.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: 250,
    alignItems: "center",
    ...Shadows.claire,
  },
  heroCtaButtonAlt: {
    backgroundColor: Colors.brand.burntGreen,
  },
  heroCtaButtonText: { ...Typography.bodyBold, color: "#FFF" },
  ctaPrimary: {
    backgroundColor: Colors.brand.burntGreen,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    ...Shadows.claire,
  },
  ctaPrimaryText: { ...Typography.bodyBold, color: "#FFF" },
  ctaPrimaryCentered: { alignSelf: "center" },
  ctaPrimaryDisabled: { opacity: 0.6 },
  comingSoonTouchable: {
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  comingSoonTextTouchable: {
    alignSelf: "center",
  },
  comingSoonLabel: {
    ...Typography.body,
    color: Colors.ui.text,
    marginBottom: Spacing.sm,
    textAlign: "center",
    fontSize: 32,
    lineHeight: 40,
  },
  storeBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    marginTop: Spacing.sm,
    opacity: 0.5,
    ...(isWeb && ({ filter: "grayscale(1)" } as object)),
  },
  storeBadge: {
    width: 155,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  storeBadgeImage: {
    width: 155,
    height: 52,
  },
  storeBadgeImageGoogle: {
    width: 155,
    height: 52,
    transform: [{ scale: 1.3 }],
  },
  // Founder's Club section
  foundersSection: {
    paddingVertical: Spacing.xxxl,
    alignItems: "center",
  },
  foundersCard: {
    backgroundColor: Colors.ui.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: Spacing.xl,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  foundersTitle: {
    ...Typography.h2,
    color: Colors.ui.text,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  foundersIntro: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    marginBottom: Spacing.md,
    maxWidth: 640,
    textAlign: "center",
    alignSelf: "center",
  },
  foundersBody: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    textAlign: "left",
    marginBottom: Spacing.md,
  },
  foundersBodyBold: {
    ...Typography.body,
    color: Colors.claire.primary,
    fontWeight: "700",
  },
  foundersPathBody: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    textAlign: "left",
    marginBottom: 0,
  },
  foundersSectionTitle: {
    ...Typography.h4,
    color: Colors.ui.text,
    textAlign: "left",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  foundersFieldGroup: {
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
    marginTop: Spacing.lg,
  },
  foundersLabel: {
    ...Typography.bodyBold,
    color: Colors.ui.text,
    marginBottom: Spacing.xs,
  },
  foundersInput: {
    backgroundColor: Colors.ui.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    color: Colors.ui.text,
    fontSize: 16,
    width: "100%",
  },
  foundersInputError: {
    borderColor: Colors.semantic.error,
  },
  foundersInputErrorText: {
    ...Typography.caption,
    color: Colors.semantic.error,
    marginTop: Spacing.xs,
  },
  joinAsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    justifyContent: "center",
  },
  joinAsRowStacked: {
    flexDirection: "column",
    flexWrap: "nowrap",
    alignItems: "center",
  },
  joinAsOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  joinAsOptionSelected: {
    borderColor: Colors.claire.primary,
    backgroundColor: Colors.claire.primary + "20",
  },
  joinAsOptionText: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
  },
  joinAsOptionTextSelected: {
    color: Colors.claire.primary,
    fontWeight: "600",
  },
  headerComingSoon: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  headerComingSoonText: {
    ...Typography.body,
    color: Colors.ui.textTertiary,
    fontSize: 14,
  },

  // App preview (web)
  appPreviewSection: {
    paddingVertical: Spacing.xxxl,
    alignItems: "center",
  },
  appPreviewContent: {
    alignItems: "center",
    maxWidth: 400,
  },
  appPreviewTitle: {
    ...Typography.h2,
    color: Colors.ui.text,
    marginBottom: Spacing.sm,
    ...(isWeb &&
      ({
        fontFamily: "'Outfit', system-ui, sans-serif",
        fontWeight: "700",
        fontSize: 30,
        lineHeight: 36,
      } as object)),
  },
  appPreviewSub: {
    ...Typography.body,
    color: Colors.ui.text,
    textAlign: "center",
    marginBottom: Spacing.xs,
    ...(isWeb && ({ fontSize: 24, lineHeight: 32 } as object)),
  },
  appPreviewBeta: {
    ...Typography.body,
    color: Colors.ui.textTertiary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    fontSize: 14,
  },
  phoneMockup: {
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  appPreviewBetaBlock: {
    marginBottom: Spacing.xl,
  },
  appPreviewComing: {
    ...Typography.body,
    color: Colors.ui.text,
    textAlign: "center",
    ...(isWeb && ({ fontSize: 19, lineHeight: 27 } as object)),
  },
  phoneFrame: {
    width: 260,
    padding: 10,
    borderRadius: 36,
    backgroundColor: "#1c1c1e",
    transform: [{ rotate: "-8deg" }],
    ...Shadows.claire,
    ...(isWeb &&
      ({
        boxShadow:
          "0 20px 40px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.06)",
      } as object)),
  },
  phoneScreen: {
    width: 240,
    height: 520,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#0A0A0A",
  },
  phoneScreenImage: {
    width: "100%",
    height: "100%",
  },
  // Container
  container: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
  },

  // Mission (combined barriers + manifesto)
  missionSection: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  missionCard: {
    backgroundColor: Colors.ui.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  missionLabel: {
    ...Typography.small,
    color: Colors.claire.primary,
    textTransform: "uppercase",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: Spacing.lg,
    fontWeight: "600",
  },
  missionBody: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
    ...(isWeb && ({ fontSize: 18, lineHeight: 28 } as object)),
  },
  missionPillars: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  missionPillar: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    flex: 1,
    minWidth: 160,
    ...(isWeb && ({ fontSize: 18, lineHeight: 28 } as object)),
  },
  missionDivider: {
    width: 90,
    height: 2,
    backgroundColor: Colors.claire.primary,
    alignSelf: "center",
    marginBottom: Spacing.lg,
    borderRadius: 1,
  },
  missionAccent: {
    ...Typography.body,
    color: Colors.ui.text,
    textAlign: "center",
    ...(isWeb && ({ fontSize: 18, lineHeight: 28 } as object)),
  },

  // Paths
  pathsSection: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  pathsCombinedCard: {
    backgroundColor: Colors.ui.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    marginHorizontal: Spacing.lg,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  pathsCombinedTitle: {
    ...Typography.h2,
    color: Colors.ui.text,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  pathsCombinedIntro: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    marginBottom: Spacing.md,
    maxWidth: 640,
    textAlign: "center",
    alignSelf: "center",
  },
  h2: {
    ...Typography.h2,
    color: Colors.ui.text,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  pathsIntro: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    marginBottom: Spacing.xl,
    maxWidth: 640,
    textAlign: "center",
    alignSelf: "center",
    ...(isWeb && ({ fontSize: 20, lineHeight: 30 } as object)),
  },
  pathsGrid: {
    flexDirection: "column",
    gap: Spacing.lg,
    ...(isWeb &&
      ({
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 24,
      } as object)),
  },
  pathCard: {
    flex: 1,
    minWidth: isWeb ? 280 : undefined,
    backgroundColor: Colors.ui.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  pathNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.claire.primary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  pathIconWrap: {
    marginBottom: Spacing.sm,
  },
  h3: { ...Typography.h3, color: Colors.ui.text, marginBottom: Spacing.xs },
  body: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    marginBottom: Spacing.md,
  },
  pathCtaButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minWidth: 200,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.claire.primary,
    borderRadius: Radius.md,
  },
  pathCtaButtonText: { ...Typography.bodyBold, color: Colors.claire.primary },
  ctaSecondary: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.claire.primary,
    borderRadius: Radius.md,
  },
  ctaSecondaryText: { ...Typography.bodyBold, color: Colors.claire.primary },
  link: {
    ...Typography.body,
    color: Colors.claire.primary,
    marginTop: Spacing.lg,
  },

  // Final CTA
  finalCtaSection: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  finalCtaHeadlineBlock: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },
  finalCtaCard: {
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
    backgroundColor: Colors.ui.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.25)",
    alignItems: "center",
    ...Shadows.lg,
  },
  finalCtaHeadline: {
    ...Typography.h2,
    color: Colors.ui.text,
    textAlign: "center",
    marginBottom: Spacing.md,
    ...(isWeb && ({ fontSize: 28 } as object)),
  },
  finalCtaBody: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.md,
    ...(isWeb && ({ fontSize: 20, lineHeight: 30 } as object)),
  },
  finalCtaBadge: {
    ...Typography.h4,
    color: Colors.claire.primary,
    marginBottom: Spacing.sm,
  },
  finalCtaDetail: {
    ...Typography.body,
    color: Colors.ui.textTertiary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    fontSize: 14,
  },
  ctaPrimaryLarge: {
    backgroundColor: Colors.claire.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    ...Shadows.claire,
    minWidth: 280,
    alignItems: "center",
  },

  // Footer
  footer: {
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  footerInner: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
  },
  footerLinks: {
    flexDirection: "row",
    gap: 24,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  footerContactButton: {
    backgroundColor: Colors.brand.burntGreen,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: 250,
    alignItems: "center",
  },
  footerContactText: { ...Typography.bodyBold, color: "#FFF" },
  footerCopy: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
  },

  // Contact Us modal
  contactModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  contactModalCard: {
    backgroundColor: Colors.ui.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: Spacing.xl,
    maxWidth: 420,
    minWidth: 320,
    width: "100%",
    alignItems: "stretch",
  },
  contactModalTitle: {
    ...Typography.h3,
    color: Colors.ui.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  contactModalBody: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  contactFieldGroup: {
    width: "100%",
    marginBottom: Spacing.md,
  },
  contactLabel: {
    ...Typography.bodyBold,
    color: Colors.ui.text,
    marginBottom: Spacing.xs,
  },
  contactInput: {
    backgroundColor: Colors.ui.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.ui.text,
    fontSize: 16,
  },
  contactMessageInput: {
    minHeight: 140,
  },
  contactInputError: {
    borderColor: Colors.semantic.error,
  },
  contactInputErrorText: {
    ...Typography.caption,
    color: Colors.semantic.error,
    marginTop: Spacing.xs,
  },
  contactActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  contactCancel: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  contactCancelText: {
    ...Typography.body,
    color: Colors.ui.textTertiary,
  },
  contactSendButton: {
    backgroundColor: Colors.claire.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  contactSendButtonDisabled: {
    opacity: 0.6,
  },
  contactSendText: {
    ...Typography.bodyBold,
    color: "#FFF",
  },

  // Welcome modal (after Founder's Club signup)
  welcomeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  welcomeModalCard: {
    backgroundColor: Colors.ui.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: Spacing.xxxl,
    maxWidth: 480,
    width: "100%",
    alignItems: "center",
  },
  welcomeModalIconWrap: {
    marginBottom: Spacing.lg,
  },
  welcomeModalHeadline: {
    ...Typography.h2,
    color: Colors.ui.text,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  welcomeModalBody: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  welcomeModalParagraph: {
    ...Typography.body,
    color: Colors.ui.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  welcomeModalButton: {
    backgroundColor: Colors.ui.surfaceElevated,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  welcomeModalButtonText: {
    ...Typography.bodyBold,
    color: Colors.ui.text,
  },
});
