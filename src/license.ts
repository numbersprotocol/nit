/* References:
 *   https://spdx.org/licenses/
 *   https://pypi.org/classifiers/
 */

export const Licenses = {
  "cc-by-4.0": {
    "name": "CC-BY-4.0",
    "document": "https://creativecommons.org/licenses/by/4.0/legalcode"
  },
  "cc-by-sa-4.0": {
    "name": "CC-BY-SA-4.0",
    "document": "https://creativecommons.org/licenses/by-sa/4.0/legalcode"
  },
  "cc-by-nd-4.0": {
    "name": "CC-BY-ND-4.0",
    "document": "https://creativecommons.org/licenses/by-nd/4.0/legalcode"
  },
  "cc-by-nc-4.0": {
    "name": "CC-BY-NC-4.0",
    "document": "https://creativecommons.org/licenses/by-nc/4.0/legalcode"
  },
  "cc-by-nc-sa-4.0": {
    "name": "CC-BY-NC-SA-4.0",
    "document": "https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode"
  },
  "cc-by-nc-nd-4.0": {
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

<<<<<<< Updated upstream
export const DefaultLicense: string = "cc-by-nc-4.0";
=======
export const DefaultLicense = "cc-by-nc";
>>>>>>> Stashed changes

export function isSupportedLicense(licenseName: string) {
  if (Object.keys(Licenses).indexOf(licenseName) > -1) {
    return true;
  } else {
    return false;
  }
}