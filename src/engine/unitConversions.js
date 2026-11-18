/**
 * Unit conversions and formatting utilities for WaterFlow
 */

export const UNITS = {
  FLOW: {
    M3_S: { id: 'm3_s', label: 'm³/s', factor: 1, name: 'Cubic metres per second' },
    L_S: { id: 'l_s', label: 'L/s', factor: 0.001, name: 'Litres per second' },
    M3_H: { id: 'm3_h', label: 'm³/h', factor: 1 / 3600, name: 'Cubic metres per hour' },
  },
  LENGTH: {
    M: { id: 'm', label: 'm', factor: 1 },
    KM: { id: 'km', label: 'km', factor: 1000 },
  },
  DIAMETER: {
    M: { id: 'm', label: 'm', factor: 1 },
    MM: { id: 'mm', label: 'mm', factor: 0.001 },
  },
  HEAD: {
    M: { id: 'm', label: 'm (head)', factor: 1 },
    KPA: { id: 'kpa', label: 'kPa', factor: 9.80665 },
    BAR: { id: 'bar', label: 'bar', factor: 0.0980665 },
  }
};

/**
 * Format a number to engineering precision, avoiding messy scientific notation
 * for readable numbers while preserving precision.
 */
export function formatNum(val, decimals = 4) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (val === 0) return '0.0000';
  const abs = Math.abs(val);
  if (abs < 1e-5 && abs > 0) {
    return val.toExponential(3);
  }
  return Number(val).toFixed(decimals);
}

export function formatFlow(val, unit = 'm3_s', decimals = 4) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (unit === 'l_s') {
    return (val * 1000).toFixed(decimals > 2 ? 2 : decimals) + ' L/s';
  }
  return formatNum(val, decimals) + ' m³/s';
}

export function formatHead(val, unit = 'm', decimals = 3) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return formatNum(val, decimals) + ' m';
}

export function formatDiameter(valInMeters, unit = 'mm', decimals = 1) {
  if (valInMeters === null || valInMeters === undefined || isNaN(valInMeters)) return '—';
  if (unit === 'mm') {
    return (valInMeters * 1000).toFixed(decimals) + ' mm';
  }
  return formatNum(valInMeters, 4) + ' m';
}
