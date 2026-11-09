import { View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { colors } from '../screens/LoginScreen.styles';

const BLUE = colors.blue;
const LIGHT = '#64BAFF';
const ORANGE = '#F47C20';
const BUILDINGS = [
  { x: 108, y: 132, height: 76, color: '#1F6AA5' },
  { x: 158, y: 102, height: 106, color: BLUE },
  { x: 208, y: 72, height: 136, color: LIGHT },
];

// Simple vector marks use the buildings and colors of the ObraSync identity.
export function OnboardingIllustration({ index }) {
  return (
    <View style={{ flex: 1 }} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 360 290">
        <Circle cx="180" cy="145" r="110" fill={BLUE} fillOpacity="0.05" />
        <Circle cx="180" cy="145" r="109" fill="none" stroke={BLUE} strokeOpacity="0.15" />
        {index === 0 && <G>
          <Rect x="145" y="66" width="70" height="141" rx="17" fill={BLUE} fillOpacity="0.1" />
          <Rect x="89" y="116" width="38" height="81" rx="7" fill="#1F6AA5" />
          <Rect x="157" y="78" width="46" height="119" rx="8" fill={BLUE} />
          <Rect x="233" y="116" width="38" height="81" rx="7" fill="#1F6AA5" />
          <Path d="M103 132H113M171 96H189M247 132H257" stroke={LIGHT} strokeWidth="3" strokeLinecap="round" />
          <Path d="M108 198V218Q108 225 115 225H245Q252 225 252 218V198M180 198V225" stroke={LIGHT} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="180" cy="225" r="12" fill={ORANGE} fillOpacity="0.14" />
          <Circle cx="180" cy="225" r="5" fill={ORANGE} />
        </G>}
        {index === 1 && <G>
          <Rect x="113" y="64" width="134" height="162" rx="16" fill={BLUE} fillOpacity="0.08" stroke={LIGHT} strokeWidth="3" />
          <Path d="M151 64V60Q151 54 157 54H203Q209 54 209 60V73H151Z" fill={BLUE} />
          {[104, 141, 178].map((y, row) => <G key={y}>
            <Circle cx="139" cy={y + 6} r="4" fill={row === 2 ? ORANGE : BLUE} />
            <Path d={`M156 ${y + 6}H${216 - row * 12}`} stroke={row === 2 ? ORANGE : LIGHT} strokeWidth="6" strokeLinecap="round" />
          </G>)}
          <Path d="M135 208H225" stroke={BLUE} strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
        </G>}
        {index === 2 && <G>
          {BUILDINGS.map(building => <Rect key={building.x} x={building.x} y={building.y + 26} width="34" height={building.height - 26} rx="7" fill={building.color} />)}
          <Path d="M101 218H250" stroke={BLUE} strokeWidth="6" strokeLinecap="round" />
          <Path d="M116 119L170 88L237 59M219 58L240 57L235 78" stroke={ORANGE} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </G>}
      </Svg>
    </View>
  );
}
