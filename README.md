# react-native-upier

UPI handler for react native apps

## Installation

```sh
npm install react-native-upier
```

## Usage

### Android

#### Automatic Installation

```
react-native run link
```

#### Manual Installation

Open `android/settings.gradle` add the following

```
include ':react-native-upier'
project(':react-native-upier').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-upier/android')

```

Open `android/build.gradle` add the following in the dependencies section

```
dependencies {
    compile project(':react-native-upier')
}
```

Open `MainApplication.java`

```java
// Other imports
import com.rvuyyuru.rnupier.UpierPackage;

  // Add this in the Main Application Class
  @Override
  protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
       //... Other packages
          new UpierPackage() // <- Add this line
    );
  }
```

## Usage

```javascript
RNUPIPayment.initializePayment(
  {
    vpa: 'john@upi', // or can be john@ybl or mobileNo@upi
    payeeName: 'John Doe',
    amount: '1',
    transactionRef: 'aasf-332-aoei-fn',
  },
  successCallback,
  failureCallback
);
```

## Config docs

```javascript
{
  /*
  * REQUIRED
  * vpa is the address of the payee given to you
  * by your bank
  */
  vpa: 'somehandle@upi',

  /*
  * REQUIRED
  * payeeName is the name of the payee you want
  * to make a payment too. Some upi apps need this
  * hence it is a required field
  */
  payeeName: 'Payee name',

  /*
  * REQUIRED
  * This is a reference created by you / your server
  * which can help you identify this transaction
  * The UPI spec doesnt mandate this but its a good to have
  */
  transactionRef: 'some-hash-string',

  /*
  * REQUIRED
  * The actual amount to be transferred
  */
  amount: '200',

  /*
  * OPTIONAL
  * Transactional message to be shown in upi apps
  */
  transactionNote: 'for food'
}
```

## Callbacks

```javascript
function successCallback(data) {
  // do whatever with the data
}

function failureCallback(data) {
  // do whatever with the data
}
```

## Responses

SUCCESS CASE

```javascript
{
/**
* SUCCESS STATUS
* */
Status: "SUCCESS",
/**
* Transaction Id of bank to which upi has been initiated
* */
txnId: "AXId8c71205eb7d459889bb7018bdf2c056",
/**
* 00 response code, for success
* transaction is successful money has been debited
* */
responseCode: "00",
/**
* Transaction reference stated in init obect
* */
txnRef: "aasf-332-aoeifn"

}
```

FAILURE CASES

```javascript
{
  /**
   * Status Sent on transaction
   * If the user presses back or closes app
   * */
  status: "FAILURE",

  /**
  * If the user presses back or closes app
  * */
  message: "No action taken"
} // No action
```

```javascript
{
  /**
  * FAILURE STATUS
  * */
  Status: "FAILURE",
  /**
  * Transaction Id of bank to which upi has been initiated
  * */
  txnId: "AXIa463c7ca81a24e168df5ac9c1359c38c",
  /**
  * Non 0 response code,
  * If the user enters the wrong pin
  * */
  responseCode: "ZM",
  /**
  * Transaction reference stated in init obect
  * */
  txnRef: "aasf-332-aoeifn"

  }
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
