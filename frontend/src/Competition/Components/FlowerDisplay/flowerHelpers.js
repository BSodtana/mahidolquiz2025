export const MIN_UNITS = 3;
export const MAX_UNITS = 7;
export function limitFlowerUnits(units)
{
  return Math.max(MIN_UNITS, Math.min(MAX_UNITS, units));
}
export function calcMultiplier(units) 
{
  const healthy = limitFlowerUnits(units);  
  return healthy / 5; // 3/5=0.6, 5/5=1.0, 7/5=1.4
}
export function getStateName(units) 
{
  const u = limitFlowerUnits(units);
  if (u <= 3) {
    return "Critical";     
    }   
  else if (u <= 4) {
     return "Declining";  
    }
    else{
      return "Healthy"; 
    }
}
export function getStateClasses(stateName) 
{
  switch (stateName) 
  {
    case "Critical":  return "text-red-600";
    case "Declining": return "text-yellow-600";
    default:          return "text-green-600";
  }
}
