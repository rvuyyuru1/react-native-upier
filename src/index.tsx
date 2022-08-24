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
  transactionRef: string;
  currency?: string;
  transactionRefUrl?: string;
  transactionNote?: string;
  merchantCode?: string;
  gstIn?: string;
  invoiceDate?: string;
  invoiceNo?: string;
  gstBrkUp?: string;
}
/**
 *      pa: 'merchant-vpa@xxx',
        pn: 'Merchant Name',
        tr: '1234ABCD',  // your custom transaction reference ID
        url: 'http://url/of/the/order/in/your/website',
        mc: '1234', // your merchant category code
        tn: 'Purchase in Merchant',
        gstBrkUp: 'GST:16.90|CGST:08.45|SGST:08.45', // GST value break up
        invoiceNo: 'BillRef123', // your invoice number
        invoiceDate: '2019-06-11T13:21:50+05:30', // your invoice date and time
        gstIn: '29ABCDE1234F2Z5', // your GSTIN
 */

const upiConfig: any = {
  vpa: 'pa',
  payeeName: 'pn',
  transactionRef: 'tr',
  amount: 'am',
  transactionNote: 'tn',
  currency: 'cu',
  merchantCode: 'mc',
  transactionRefUrl: 'url',
  gstIn: 'gstIn',
  invoiceDate: 'invoiceDate',
  invoiceNo: 'invoiceNo',
  gstBrkUp: 'gstBrkUp',
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
   *
   *
   * @param success
   * success handler
   * @param failure
   * failure handler
   * @param packageName
   * packagename
   *
   */

  initializePayment(
    config: ConfigforInit,
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
    Config.packageName = packageName;
    Config.upiString = `upi://pay?${queryString}`;
    UPIModule?.intializePayment(
      Config,
      this.successCallback(success),
      this.failureCallback(failure)
    );
  },
};

export default RNUPIPayment;
