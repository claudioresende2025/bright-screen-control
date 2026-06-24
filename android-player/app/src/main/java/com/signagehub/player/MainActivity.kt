package com.signagehub.player

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.CookieManager
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Keep screen on at all times — TV must never sleep.
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                mediaPlaybackRequiresUserGesture = false
                // Forçar sempre buscar do servidor: evita ficar preso em
                // builds antigos do painel publicado.
                cacheMode = WebSettings.LOAD_NO_CACHE
                useWideViewPort = true
                loadWithOverviewMode = true
                allowFileAccess = false
                allowContentAccess = false
                mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                userAgentString = userAgentString + " SignageHubPlayer/1.0 (AndroidTV)"
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    safeBrowsingEnabled = true
                }
            }
            // Limpar cache antigo do WebView ao iniciar — garante que o
            // app pegue a última versão publicada do /player.
            clearCache(true)
            clearHistory()
            CookieManager.getInstance().removeAllCookies(null)
            CookieManager.getInstance().flush()
            webViewClient = object : WebViewClient() {
                override fun onReceivedError(
                    view: WebView,
                    request: WebResourceRequest,
                    error: WebResourceError
                ) {
                    if (!request.isForMainFrame) return
                    val url = getString(R.string.player_url)
                    val failedUrl = request.url?.toString() ?: url
                    val msg = "Falha ao carregar: ${error.description} (código ${error.errorCode})"
                    val html = """
                        <html><body style='background:#000;color:#fff;font-family:sans-serif;
                          display:flex;flex-direction:column;align-items:center;justify-content:center;
                          height:100vh;text-align:center;padding:24px;'>
                          <h2 style='margin:0 0 12px 0'>SignageHub Player</h2>
                          <p style='opacity:.8;margin:0 0 8px 0'>$msg</p>
                          <p style='opacity:.6;font-size:13px;word-break:break-all'>$failedUrl</p>
                          <p style='opacity:.6;font-size:13px;margin-top:16px'>
                            Para testar, abra a mesma URL no navegador do celular.
                          </p>
                          <p style='opacity:.5;font-size:12px;margin-top:24px'>Tentando novamente em 10s…</p>
                        </body></html>
                    """.trimIndent()
                    view.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
                    Handler(Looper.getMainLooper()).postDelayed({
                        view.clearCache(true)
                        view.loadUrl(url)
                    }, 10_000)
                }
            }
            webChromeClient = WebChromeClient()
            setBackgroundColor(android.graphics.Color.BLACK)
        }

        setContentView(webView)
        enterImmersiveMode()

        // Cache-bust: força o host a entregar o build mais recente,
        // evitando que o WebView fique preso em uma resposta antiga.
        val base = getString(R.string.player_url)
        val sep = if (base.contains("?")) "&" else "?"
        webView.loadUrl("$base${sep}v=${System.currentTimeMillis()}")
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) enterImmersiveMode()
    }

    @Suppress("DEPRECATION")
    private fun enterImmersiveMode() {
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            )
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}