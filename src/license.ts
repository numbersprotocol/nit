/* Reference: https://pypi.org/classifiers/
 */
export const Licenses = {
  "cc-by": {
    "name": "Creative Commons Attribution 4.0 International",
    "document": "https://creativecommons.org/licenses/by/4.0/"
  },
  "cc-by-sa": {
    "name": "Creative Commons Attribution-ShareAlike 4.0 International",
    "document": "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  "cc-by-nd": {
    "name": "Creative Commons Attribution-NoDerivatives 4.0 International",
    "document": "https://creativecommons.org/licenses/by-nd/4.0/"
  },
  "cc-by-nc": {
    "name": "Creative Commons Attribution-NonCommercial 4.0 International",
    "document": "https://creativecommons.org/licenses/by-nc/4.0/"
  },
  "cc-by-nc-sa": {
    "name": "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International",
    "document": "https://creativecommons.org/licenses/by-nc-sa/4.0/"
  },
  "cc-by-nc-nd": {
    "name": "Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International",
    "document": "https://creativecommons.org/licenses/by-nc-nd/4.0/"
  },
  "mit": {
    "name": "mit",
    "document": "https://opensource.org/licenses/MIT"
  },
  "public": {
    "name": "public-domain",
    "document": "https://opensource.org/licenses/MIT"
  },
};

export const DefaultLicense: string = "cc-by-nc";

export function isSupportedLicense(licenseName: string) {
  if (Object.keys(Licenses).indexOf(licenseName) > -1) {
    return true;
  } else {
    return false;
  }
}