package com.rvuyyuru.rnupier;

import androidx.annotation.NonNull;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;


import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.gson.Gson;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;





@ReactModule(name = UpierModule.NAME)
public class UpierModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    public static final String NAME = "Upier";
    private static final int REQUEST_CODE = 123;
    private final Gson gson = new Gson();
    private Callback successHandler;    
    private Callback failureHandler;
    private String FAILURE = "FAILURE";

    public UpierModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

 @ReactMethod
    public void getUPIListOfApps(final Promise promise,){
        try{
    packageManager = context.getPackageManager();
    final Intent mainIntent = new Intent(Intent.ACTION_MAIN, null);
    mainIntent.addCategory(Intent.CATEGORY_DEFAULT);
    mainIntent.addCategory(Intent.CATEGORY_BROWSABLE);
    mainIntent.setAction(Intent.ACTION_VIEW);
    Uri uriforUpi = new Uri.Builder().scheme("upi").authority("pay").build();
    mainIntent.setData(uriforUpi);
    final JSONObject responseData = new JSONObject();
    final List pkgAppsList = 
    context.getPackageManager().queryIntentActivities(mainIntent, 0);
    responseData.put("list", pkgAppsList);
    responseData.put("status", 'Success');
    for (int i = 0; i < pkgAppsList.size(); i++) {
        ResolveInfo resolveInfo = (ResolveInfo) pkgAppsList.get(i);
        Log.d("TAG", "packageName: " + resolveInfo.activityInfo.packageName);
        Log.d("TAG", "AppName: " + resolveInfo.loadLabel(packageManager));
        Log.d("TAG", "AppIcon: " +resolveInfo.loadIcon(packageManager));
    }
    promise.resolve( gson.toJson(responseData);    
    }
    
        catch (JSONException e) {
              e.printStackTrace();
                    responseData.put("message", "UPI supporting app not installed");
                     responseData.put("status", FAILURE);
                     promise.reject(gson.toJson(responseData))
                  
                }
    
    return;
    }


     @ReactMethod
    public void intializePayment(ReadableMap config, Callback successHandler, Callback failureHandler) {
        this.successHandler = successHandler;
        this.failureHandler = failureHandler;
        Intent intent = new Intent();
        intent.setAction(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(config.getString("upiString")));
        Context currentContext = getCurrentActivity().getApplicationContext();
        getCurrentActivity().startActivityForResult(intent, REQUEST_CODE);
        // if (intent != null) {
        //     // Intent chooser = Intent.createChooser(intent, "Choose a upi app");
        //     if (isCallable(chooser, currentContext)) {
        //         getCurrentActivity().startActivityForResult(chooser, REQUEST_CODE);
        //     } else {
        //         final JSONObject responseData = new JSONObject();
        //         try {
        //             responseData.put("message", "UPI supporting app not installed");
        //             responseData.put("status", FAILURE);
        //         } catch (JSONException e) {
        //             e.printStackTrace();
        //         }
        //         this.failureHandler.invoke(gson.toJson(responseData));
        //     }
        // }
    }

    private boolean isCallable(Intent intent, Context context) {
        List<ResolveInfo> list = context.getPackageManager().queryIntentActivities(intent,
                PackageManager.MATCH_DEFAULT_ONLY);
        return list.size() > 0;
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        final JSONObject responseData = new JSONObject();
        try {
            if (data == null) {
                responseData.put("status", FAILURE);
                responseData.put("message", "No action taken");
                if(this.failureHandler!=null){
                    this.failureHandler.invoke(gson.toJson(responseData));
                }
                return;
            }

            if (requestCode == REQUEST_CODE) {
                Bundle bundle = data.getExtras();
                if (data.getStringExtra("Status").trim().equals("SUCCESS")){
                    responseData.put("status", data.getStringExtra("Status"));
                    responseData.put("message", bundle.getString("response"));
                    this.successHandler.invoke(gson.toJson(responseData));

                } else {
                    responseData.put("status", data.getStringExtra("Status"));
                    responseData.put("message", bundle.getString("response"));
                    this.failureHandler.invoke(gson.toJson(responseData));
                }
            } else {
                responseData.put("message", "Request Code Mismatch");
                responseData.put("status", FAILURE);
                if(this.failureHandler!=null){
                    this.failureHandler.invoke(gson.toJson(responseData));
                }
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onNewIntent(Intent intent) {

    }

  
}
