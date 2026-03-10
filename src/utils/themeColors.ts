import { Theme } from '../hooks/useTheme';

export const getThemeColors = (theme: Theme) => {
  const themes = {
    default: {
      palette: [
        [255, 165, 100], [15, 205, 220],
        [120, 100, 235], [100, 190, 200],
        [225, 60, 200], [230, 50, 170]
      ] as [number, number, number][],
      chartColors: {
        arrivals: 'rgba(255, 165, 100, 0.8)',
        arrivalsBorder: 'rgba(255, 165, 100, 1)',
        departures: 'rgba(15, 205, 220, 0.8)',
        departuresBorder: 'rgba(15, 205, 220, 1)',
        present: 'rgba(120, 100, 235, 0.8)',
        presentBorder: 'rgba(120, 100, 235, 1)'
      }
    },
    dark: {
      palette: [
        [64, 64, 64], [96, 96, 96],
        [128, 128, 128], [160, 160, 160],
        [80, 80, 80], [112, 112, 112]
      ] as [number, number, number][],
      chartColors: {
        arrivals: 'rgba(128, 128, 128, 0.8)',
        arrivalsBorder: 'rgba(128, 128, 128, 1)',
        departures: 'rgba(160, 160, 160, 0.8)',
        departuresBorder: 'rgba(160, 160, 160, 1)',
        present: 'rgba(96, 96, 96, 0.8)',
        presentBorder: 'rgba(96, 96, 96, 1)'
      }
    },
    gray: {
      palette: [
        [107, 114, 128], [156, 163, 175],
        [209, 213, 219], [243, 244, 246],
        [75, 85, 99], [55, 65, 81]
      ] as [number, number, number][],
      chartColors: {
        arrivals: 'rgba(107, 114, 128, 0.8)',
        arrivalsBorder: 'rgba(107, 114, 128, 1)',
        departures: 'rgba(156, 163, 175, 0.8)',
        departuresBorder: 'rgba(156, 163, 175, 1)',
        present: 'rgba(75, 85, 99, 0.8)',
        presentBorder: 'rgba(75, 85, 99, 1)'
      }
    },
    pastel: {
      palette: [
        [255, 179, 186], [186, 255, 201],
        [186, 225, 255], [255, 255, 186],
        [255, 200, 221], [200, 255, 255]
      ] as [number, number, number][],
      chartColors: {
        arrivals: 'rgba(255, 179, 186, 0.8)',
        arrivalsBorder: 'rgba(255, 179, 186, 1)',
        departures: 'rgba(186, 255, 201, 0.8)',
        departuresBorder: 'rgba(186, 255, 201, 1)',
        present: 'rgba(186, 225, 255, 0.8)',
        presentBorder: 'rgba(186, 225, 255, 1)'
      }
    },
    vibrant: {
      palette: [
        [255, 107, 107], [78, 205, 196],
        [69, 183, 209], [255, 195, 0],
        [196, 77, 255], [255, 77, 166]
      ] as [number, number, number][],
      chartColors: {
        arrivals: 'rgba(255, 107, 107, 0.8)',
        arrivalsBorder: 'rgba(255, 107, 107, 1)',
        departures: 'rgba(78, 205, 196, 0.8)',
        departuresBorder: 'rgba(78, 205, 196, 1)',
        present: 'rgba(69, 183, 209, 0.8)',
        presentBorder: 'rgba(69, 183, 209, 1)'
      }
    }
  };

  return themes[theme];
};