package com.flb.app;

import android.os.Bundle;

import com.phonegap.DroidGap;

public class FigLeafBetty extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("loadUrlTimeoutValue", 60000);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}

