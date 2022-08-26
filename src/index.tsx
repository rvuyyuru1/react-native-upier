import { NativeModules, Platform } from 'react-native';
const LINKING_ERROR =
  `The package 'react-native-upier' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

export const UPIModule = NativeModules?.Upier
  ? NativeModules?.Upier
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );
const UPI_APP_NOT_INSTALLED = 'UPI supporting app not installed';
const REQUEST_CODE_MISMATCH = 'Request Code Mismatch';
const NO_ACTION_TAKEN = 'No action taken';
const requiredFields = ['pa', 'am', 'pn', 'tf'];

const validateObject = (config: any) => {
  const errorArray: any = [];
  requiredFields.forEach((eachField) => {
    if (!config[eachField]) {
      errorArray.push(eachField);
    }
  });
  return errorArray;
};
const successCallback = (success: any) => {
  return (data: any) => {
    data = JSON.parse(data);
    console.log('UPISDK_Success', data);
    const successString = data.nameValuePairs && data.nameValuePairs.message;
    let successObj: any = convertURLStringToObject(successString);
    successObj.status = data.status;
    success(successObj);
  };
};

const failureCallback = (failure: any) => {
  return (data: any) => {
    data = JSON.parse(data);
    console.log('UPISDK_Failure', data);
    let failureObj = {};
    if (typeof data.nameValuePairs.message === 'undefined') {
      failure(data.nameValuePairs);
    } else {
      const failureString = data.nameValuePairs && data.nameValuePairs.message;
      if (
        failureString === UPI_APP_NOT_INSTALLED ||
        failureString === REQUEST_CODE_MISMATCH ||
        failureString === NO_ACTION_TAKEN
      ) {
        failure(data.nameValuePairs);
      } else {
        failureObj = convertURLStringToObject(failureString);
        failure(failureObj);
      }
    }
  };
};
export const buildURLQuery = (obj: any): string =>
  Object.entries(obj)
    .map((pair: any) => pair.map(encodeURIComponent).join('='))
    .join('&');
export const convertURLStringToObject = (responseString: string) => {
  return responseString.split('&').reduce((prev: any, curr: any) => {
    const p: Array<string> = curr.split('=');
    prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
    return prev;
  }, {});
};
const RNUPISDK = {
  /**
   *
   * @param config object || string
   * pa : pa is the address of the payee given to you
   * by your bank
   * am: The actual amount to be transferred   *
   * pn: payeeName is the name of the payee you want
   * to make a payment too. Some upi apps need this
   * hence it is a required field   *
   * tf:This is a reference created by you / your server
   * which can help you identify this transaction
   * The UPI spec doesnt mandate this but its a good to have
   * config='upi://pay?pa=xxx@ss&am=10&pn=xxxx&tf=xxxxxxxxx-refid'
   * @param success
   * success handler
   * @param failure
   * failure handler
   * @param packageName
   * packagename
   *
   */

  initializePayment(
    config: object | string,
    success: any,
    failure: any,
    packageName?: string
  ): void {
    if (typeof success !== 'function') {
      throw new Error('success callback not a function');
    }

    if (typeof failure !== 'function') {
      throw new Error('failure callback not a function');
    }
    const Config: any = {};
    Config.packageName = packageName;
    if (typeof config === 'object') {
      const errorArray = validateObject(config);
      if (errorArray.length > 0) {
        throw new Error(
          `following keys are required ${JSON.stringify(errorArray)}`
        );
      }
      let queryString = buildURLQuery(config);
      Config.upiString = `upi://pay?${queryString}`;
    } else if (typeof config === 'string') {
      Config.upiString = config;
    } else {
      throw new Error(
        'config is required and must be vaild object or query string!'
      );
    }
    UPIModule?.intializePayment(
      Config,
      successCallback(success),
      failureCallback(failure)
    );
  },
};

export default RNUPISDK;
