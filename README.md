# react-native-upier

UPI handler for react native apps
react-native-upier is a tiny plugin to integrate the UPI payment interface made by NPCI from your react native apps. This plugin allows you to enable peer to peer payments via UPI in your react native apps. Linking specs have been followed as per this doc

## Installation

```sh
npm install react-native-upier

```

```sh
yarn add react-native-upier

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

Open `android/app/build.gradle` add the following in the dependencies section

```
dependencies {
    implementation project(':react-native-upier')
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
import RNUPISDK from 'react-native-upier';

RNUPISDK.initializePayment(
  {
    pa: 'xxxx@upi', // or can be xxx@ybl or mobileNo@upi
    pn: 'xxxx xxx',
    am: '1',
    tf: 'xxxx-xxx-xxx-xxrefid',
  },
  successCallback,
  failureCallback
);
// or
RNUPISDK.initializePayment(
  'upi://pay?pa=xxx@upi&am=1&pn=xxxx&tf=xxxx-xxx-xxx-xxrefid', // UPI encodedURI string
  successCallback,
  failureCallback
);
```

## Config docs

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
txnRef: "xxxx-xxx-xxx-xxrefid"

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
  txnRef: "xxxx-xxx-xxx-xxrefid"

  }
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
