export function calculatePercentageColor (points: number, maxPoints: number): string {
  const maxColor = 130; // max% of matrixPoints
  const minColor = 220; // min% of matrixPoints
  const defaultColor = 'rgba(230,230,230, .5)';

  const pointsPercentage = points / maxPoints;

  if (pointsPercentage > 0 ){

    // 255 -150 = 105 => 0 - 105
    const colorSpan = Math.abs(maxColor - minColor);

    // the color span should start at 30% of reference-points and end at 100% reference-points
    const startPercentage = 0.3;

    // eg item has 50% of pints => 50%-30% = 20% over startPercentage
    const percentPointsOverStartPercentage = pointsPercentage - startPercentage;

    // 20% of colorSpan 20% of 105 colorPoints = 21 colorPoints
    const colorPoints = Math.abs(percentPointsOverStartPercentage * colorSpan);
    
    let newColor = maxColor - colorPoints;
    if (minColor > maxColor) {
      newColor = minColor - colorPoints;
    }
    
    return `rgb(${newColor}, 210, 68)`;
    
  }
  else {
    return defaultColor;
  }
}
