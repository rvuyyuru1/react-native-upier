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

interface ConfigforInit {
  vpa: string;
  amount: string;
  payeeName: string;
  currency?: string;
  transactionRef: string;
  transactionNote?: string;
}
function isNull(data: any): boolean {
  if (data === '' || data === 'null' || data === null || data === undefined) {
    return true;
  } else {
    return false;
  }
}
const upiConfig: any = {
  vpa: 'pa',
  payeeName: 'pn',
  transactionRef: 'tr',
  amount: 'am',
  transactionNote: 'tn',
  currency: 'cu',
};
const RNUPIPayment = {
  requiredFields: ['vpa', 'amount', 'payeeName', 'transactionRef'],
  UPI_APP_NOT_INSTALLED: 'UPI supporting app not installed',
  REQUEST_CODE_MISMATCH: 'Request Code Mismatch',
  NO_ACTION_TAKEN: 'No action taken',
  validateObject(config: any) {
    const errorArray: any = [];
    this.requiredFields.forEach((eachField) => {
      if (!config[eachField]) {
        errorArray.push(eachField);
      }
    });
    return errorArray;
  },

  successCallback(success: any) {
    return (data: any) => {
      data = JSON.parse(data);
      const successString = data.nameValuePairs && data.nameValuePairs.message;
      let successObj: any = this.convertStringToObject(successString);
      successObj.status = data.status;
      success(successObj);
    };
  },

  failureCallback(failure: any) {
    return (data: any) => {
      data = JSON.parse(data);
      let failureObj = {};
      if (typeof data.nameValuePairs.message == 'undefined') {
        failure(data.nameValuePairs);
      } else {
        const failureString =
          data.nameValuePairs && data.nameValuePairs.message;
        if (
          failureString === this.UPI_APP_NOT_INSTALLED ||
          failureString === this.REQUEST_CODE_MISMATCH ||
          failureString === this.NO_ACTION_TAKEN
        ) {
          failure(data.nameValuePairs);
        } else {
          failureObj = this.convertStringToObject(failureString);
          failure(failureObj);
        }
      }
    };
  },

  convertStringToObject(responseString: string) {
    let object: any = {};
    const stringArray: Array<string> = responseString.split('&');
    object = stringArray.reduce((accumulator: any, current: string) => {
      const currentArray = current?.split('=');
      accumulator[currentArray[0]] = currentArray[1];
      return accumulator;
    }, {});
    return object;
  },
  genrateQueryString(config: any) {
    return Object.keys(config).reduce(
      (accumulator: string, current: string) => {
        let prefix = '';
        if (accumulator) {
          prefix = '&';
        }
        accumulator =
          accumulator +
          prefix +
          `${upiConfig[current]}=${encodeURIComponent(config[current])}`;
        return accumulator;
      },
      ''
    );
  },
  async getUpiIntentList() {
    return await UPIModule.getUpiIntentList();
  },
  /**
   *
   * @param config
   * vpa : vpa is the address of the payee given to you
   * by your bank
   *
   * amount: The actual amount to be transferred
   *
   * payeeName: payeeName is the name of the payee you want
   * to make a payment too. Some upi apps need this
   * hence it is a required field   *
   *
   * transactionRef:This is a reference created by you / your server
   * which can help you identify this transaction
   * The UPI spec doesnt mandate this but its a good to have
   *
   * transactionNote: Transactional message to be shown in upi apps
   *
   * @param success
   * success handler
   * @param failure
   * failure handler
   * @param payApp
   * name of app if you know the app name
   */

  initializePayment(
    config: ConfigforInit,
    success: any,
    failure: any,
    payApp?: string
  ): void {
    if (typeof success !== 'function') {
      throw new Error('success callback not a function');
    }

    if (typeof failure !== 'function') {
      throw new Error('failure callback not a function');
    }

    if (typeof config !== 'object') {
      throw new Error('config not of type object');
    }
    const errorArray = this.validateObject(config);
    if (errorArray.length > 0) {
      throw new Error(
        `Following keys are required ${JSON.stringify(errorArray)}`
      );
    }
    config.currency = 'INR';
    let queryString = this.genrateQueryString(config);
    const Config: any = {};
    const app = isNull(payApp) ? '' : payApp + '://';
    Config.upiString = app + `upi://pay?${queryString}`;
    UPIModule?.intializePayment(
      Config,
      this.successCallback(success),
      this.failureCallback(failure)
    );
  },
};

export default RNUPIPayment;
