import produce from 'immer';

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

export function upsertArray(oldArray, newArray) {
  if (!newArray) return oldArray;
  if (!oldArray) return newArray;

  let objectKeys = Object.keys(newArray);
  console.log('array? ', objectKeys);

  const upsertedArray = produce(oldArray, (draft) => {
    // objectKeys?.forEach((obj) => {
    // console.log('draft ', draft);
    // draft['yo'] = 'yo';
    // draft[obj] = newArray[obj];
    // console.log(oldArray[obj.toString()]);
    // oldArray[obj] = newArray[obj];
    // });
    return { ...draft, ...newArray };
  });

  console.log('out of foreach');
  return upsertedArray;
}
