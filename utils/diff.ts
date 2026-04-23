
export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export const computeDiff = (oldText: string, newText: string): DiffPart[] => {
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);
  const diff: DiffPart[] = [];
  
  let i = 0;
  let j = 0;

  while (i < oldWords.length && j < newWords.length) {
    if (oldWords[i] === newWords[j]) {
      diff.push({ value: oldWords[i] });
      i++;
      j++;
    } else {
      // Look ahead to find next match
      let matchFound = false;
      // Look ahead in newText
      for (let k = 1; k < 5; k++) {
        if (j + k < newWords.length && oldWords[i] === newWords[j + k]) {
           // Insertions found
           for (let m = 0; m < k; m++) {
               diff.push({ value: newWords[j + m], added: true });
           }
           j += k;
           matchFound = true;
           break;
        }
      }
      
      if (!matchFound) {
          // Look ahead in oldText (Deletion)
          for (let k = 1; k < 5; k++) {
              if (i + k < oldWords.length && oldWords[i + k] === newWords[j]) {
                  for (let m = 0; m < k; m++) {
                      diff.push({ value: oldWords[i + m], removed: true });
                  }
                  i += k;
                  matchFound = true;
                  break;
              }
          }
      }

      if (!matchFound) {
          // Substitution (remove old, add new)
          diff.push({ value: oldWords[i], removed: true });
          diff.push({ value: newWords[j], added: true });
          i++;
          j++;
      }
    }
  }

  // Append remaining
  while (i < oldWords.length) {
      diff.push({ value: oldWords[i], removed: true });
      i++;
  }
  while (j < newWords.length) {
      diff.push({ value: newWords[j], added: true });
      j++;
  }

  return diff;
};
