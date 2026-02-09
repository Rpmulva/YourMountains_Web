/* NativeWind / Tailwind: className on React Native components */
declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
}

declare module "react-native-svg" {
  interface SvgProps {
    className?: string;
  }
}
