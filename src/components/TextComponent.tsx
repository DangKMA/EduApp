import {Text, StyleProp, TextStyle, Platform} from 'react-native';
import React from 'react';
import {appColors} from '../constants/appColors';
import {fontfamilies} from '../constants/fontfamilies';
import {globalStyles} from '../styles/globalStyles';

interface Props {
  text: string;
  color?: string;
  size?: number;
  flex?: number;
  font?: string;
  styles?: StyleProp<TextStyle>;
  title?: boolean;
  numberOfLine?: number;
  weight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
}

const TextComponent = (props: Props) => {
  const {text, size, flex, font, color, styles, title, numberOfLine} = props;

  const fontSizeDefault = Platform.OS === 'android' ? 16 : 14;

  return (
    <Text
      numberOfLines={numberOfLine}
      style={[
        globalStyles.text,
        {
          color: color ?? appColors.text,
          flex: flex ?? 0,
          fontSize: size ? size : title ? 24 : fontSizeDefault,
          fontFamily: font
            ? font
            : title
            ? fontfamilies.medium
            : fontfamilies.regular,
        },
        styles,
      ]}>
      {text}
    </Text>
  );
};

export default TextComponent;
