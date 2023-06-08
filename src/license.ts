/* Reference: https://pypi.org/classifiers/
              https://spdx.org/licenses/
 */
export const Licenses = {
  "cc-by": {
    "name": "CC-BY-4.0",
    "document": "https://creativecommons.org/licenses/by/4.0/legalcode"
  },
  "cc-by-sa": {
    "name": "CC-BY-SA-4.0",
    "document": "https://creativecommons.org/licenses/by-sa/4.0/legalcode"
  },
  "cc-by-nd": {
    "name": "CC-BY-ND-4.0",
    "document": "https://creativecommons.org/licenses/by-nd/4.0/legalcode"
  },
  "cc-by-nc": {
    "name": "CC-BY-NC-4.0",
    "document": "https://creativecommons.org/licenses/by-nc/4.0/legalcode"
  },
  "cc-by-nc-sa": {
    "name": "CC-BY-NC-SA-4.0",
    "document": "https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode"
  },
  "cc-by-nc-nd": {
    "name": "CC-BY-NC-ND-4.0",
    "document": "https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode"
  },
  "mit": {
    "name": "MIT",
    "document": "https://opensource.org/licenses/MIT"
  },
  "public": {
    "name": "MIT",
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