import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';

import Odometer from "react-odometerjs";
import './raw.githubusercontent.com_HubSpot_odometer_master_themes_odometer-theme-car.css'

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  let valEnd=0;

  data.series
  .map((series) => series.fields.find((field) => field.type === 'number'))
  .map((field) => 
  {
    valEnd = field?.values.get(field.values.length - 1)
  }
  );

  return (
      <div>
        <Odometer
          format="d"
          duration={5000}
          value={valEnd}
        />
      </div>
    );
};
