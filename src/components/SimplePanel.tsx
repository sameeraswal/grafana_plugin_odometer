import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { getAnimation, getDuration, getFormat, getLatestValue } from 'utils';

import Odometer from 'react-odometerjs';
import './raw.githubusercontent.com_HubSpot_odometer_master_themes_odometer-theme-car.css';

interface Props extends PanelProps<SimpleOptions> {}

/** Rough width of one digit relative to the font size, used to fit the value in the panel. */
const DIGIT_WIDTH_RATIO = 0.8;
const MAX_FONT_SIZE = 100;
const MIN_FONT_SIZE = 12;

export function getFontSize(value: number, format: string, width: number, height: number): number {
  const chars = Math.max(String(Math.trunc(Math.abs(value))).length + (format.includes('.') ? format.split('.')[1].length + 1 : 0), 1);
  const byWidth = width / (chars * DIGIT_WIDTH_RATIO);
  const size = Math.min(MAX_FONT_SIZE, byWidth, height * 0.8);
  return Math.max(MIN_FONT_SIZE, Math.floor(size));
}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const value = getLatestValue(data?.series);
  const format = getFormat(options.decimals);
  const fontSize = getFontSize(value, format, width, height);
  const animation = getAnimation(options.animationType);
  const duration = getDuration(options.duration);

  return (
    <div
      data-testid="odometer-panel"
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontSize,
      }}
    >
      {/* react-odometerjs only reads animation/format/duration on mount, so remount when they change */}
      <Odometer
        key={`${animation}-${format}-${duration}`}
        animation={animation}
        format={format}
        duration={duration}
        value={value}
        style={{ fontSize }}
      />
    </div>
  );
};
