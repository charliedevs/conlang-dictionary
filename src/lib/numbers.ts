const englishOrdinalRules = new Intl.PluralRules("en", { type: "ordinal" });

/**
 * Format a number as an ordinal, e.g. `3` to `3rd`.
 * @link https://stackoverflow.com/a/57518703/223225
 * @param {number} number To format
 */
export function ordinal(number: number) {
  const category = englishOrdinalRules.select(number);
  switch (category) {
    case "one": {
      return `${number}st`;
    }

    case "two": {
      return `${number}nd`;
    }

    case "few": {
      return `${number}rd`;
    }

    default: {
      return `${number}th`;
    }
  }
}
