package com.onionthemer.app

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject

/**
 * Hosts the Onion Themer web app (HTML/CSS/JS under assets/www) inside a
 * full-screen WebView, and exposes a small native bridge for things the
 * web layer cannot do on its own under modern Android: picking a save
 * location for project files, opening a previously saved project, and
 * exporting the final theme ZIP via the system "Save As" / share sheet.
 *
 * All actual painting, layer compositing, and OnionOS folder/zip assembly
 * happens in JS. This class is intentionally a thin transport layer.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var pendingSaveBytes: ByteArray? = null

    private val createDocumentLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                val uri = result.data?.data
                if (uri != null && pendingSaveBytes != null) {
                    try {
                        contentResolver.openOutputStream(uri)?.use { out ->
                            out.write(pendingSaveBytes)
                        }
                        notifyJs("onSaveComplete", JSONObject().put("ok", true).put("uri", uri.toString()))
                    } catch (e: Exception) {
                        notifyJs("onSaveComplete", JSONObject().put("ok", false).put("error", e.message))
                    }
                } else {
                    notifyJs("onSaveComplete", JSONObject().put("ok", false).put("error", "No data"))
                }
            } else {
                notifyJs("onSaveComplete", JSONObject().put("ok", false).put("error", "cancelled"))
            }
            pendingSaveBytes = null
        }

    private val openDocumentLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                val uri = result.data?.data
                if (uri != null) {
                    try {
                        val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() }
                        if (bytes != null) {
                            val b64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
                            notifyJs(
                                "onOpenComplete",
                                JSONObject().put("ok", true).put("dataBase64", b64).put("name", queryDisplayName(uri))
                            )
                        } else {
                            notifyJs("onOpenComplete", JSONObject().put("ok", false).put("error", "empty file"))
                        }
                    } catch (e: Exception) {
                        notifyJs("onOpenComplete", JSONObject().put("ok", false).put("error", e.message))
                    }
                } else {
                    notifyJs("onOpenComplete", JSONObject().put("ok", false).put("error", "No data"))
                }
            } else {
                notifyJs("onOpenComplete", JSONObject().put("ok", false).put("error", "cancelled"))
            }
        }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.decorView.systemUiVisibility =
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN

        webView = WebView(this)
        setContentView(webView)

        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        webView.addJavascriptInterface(Bridge(), "AndroidBridge")
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()
        webView.loadUrl("file:///android_asset/www/index.html")
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        // Delegate to the web app's own router so the hardware/gesture
        // back button behaves identically to the in-app back arrow
        // (e.g. triggers the "leave editor?" confirm rather than just
        // popping WebView history or exiting the app).
        webView.evaluateJavascript(
            "window.App && window.App.handleNativeBack && window.App.handleNativeBack()"
        ) { result ->
            if (result == "false") {
                runOnUiThread { super.onBackPressed() }
            }
        }
    }

    private fun notifyJs(fn: String, payload: JSONObject) {
        runOnUiThread {
            val js = "window.AndroidCallbacks && window.AndroidCallbacks.$fn(${payload})"
            webView.evaluateJavascript(js, null)
        }
    }

    private fun queryDisplayName(uri: Uri): String {
        return try {
            contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                if (cursor.moveToFirst() && nameIndex >= 0) cursor.getString(nameIndex) else "project"
            } ?: "project"
        } catch (e: Exception) {
            "project"
        }
    }

    /** JS-facing bridge. Every method here is callable from the web app as AndroidBridge.xxx(...) */
    inner class Bridge {

        @JavascriptInterface
        fun saveFile(suggestedName: String, mimeType: String, base64Data: String) {
            pendingSaveBytes = Base64.decode(base64Data, Base64.NO_WRAP)
            val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = mimeType
                putExtra(Intent.EXTRA_TITLE, suggestedName)
            }
            runOnUiThread { createDocumentLauncher.launch(intent) }
        }

        @JavascriptInterface
        fun openFile(mimeType: String) {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = mimeType
            }
            runOnUiThread { openDocumentLauncher.launch(intent) }
        }

        @JavascriptInterface
        fun toast(message: String) {
            runOnUiThread {
                android.widget.Toast.makeText(this@MainActivity, message, android.widget.Toast.LENGTH_SHORT).show()
            }
        }
    }
}
