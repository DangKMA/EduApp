import {View} from 'react-native';
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {globalStyles} from '../styles/globalStyles';

interface Props {
  children: React.ReactNode;
  justify?:
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';

  onPress?: () => void;
  styles?: StyleProp<ViewStyle>;
}

const RowComponent = (props: Props) => {
  const {children, justify, styles} = props;

  const localStyles = [
    globalStyles.row,
    {
      justifyContent: justify,
    },
    styles,
  ];

  return <View style={localStyles}>{children}</View>;
};

export default RowComponent;
