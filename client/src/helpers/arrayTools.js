export function getObjectByProp(array, prop, val) {
  for (var i = 0; i < array.length; i++) {
    // check the obj has the property before comparing it
    if (typeof array[i][prop] === 'undefined') continue;

    // if the obj property equals the test value, return the obj
    if (array[i][prop] === val) return array[i];
  }

  // didn't find an object with the property
  return false;
}
