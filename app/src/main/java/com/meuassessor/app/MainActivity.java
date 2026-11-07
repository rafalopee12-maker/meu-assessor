package com.meuassessor.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends Activity {

    private static final int REQ_VOZ = 101;
    private static final int REQ_ARQUIVO = 102;
    private static final String ARQ_DADOS = "dados.json";

    private WebView web;
    private TextToSpeech tts;
    private boolean ttsPronto = false;
    private ValueCallback<Uri[]> callbackArquivo;
    private final Object travaDados = new Object();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout raiz = new FrameLayout(this);
        raiz.setBackgroundColor(getResources().getColor(R.color.app_bg, getTheme()));
        web = new WebView(this);
        web.setBackgroundColor(getResources().getColor(R.color.app_bg, getTheme()));
        raiz.addView(web, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(raiz);

        // Android 11+: desenha atrás das barras e respeita as margens (inclusive teclado)
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            raiz.setOnApplyWindowInsetsListener((v, insets) -> {
                android.graphics.Insets b = insets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.ime() | WindowInsets.Type.displayCutout());
                v.setPadding(b.left, b.top, b.right, b.bottom);
                return WindowInsets.CONSUMED;
            });
        }

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(true);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.addJavascriptInterface(new Ponte(), "AndroidBridge");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("file".equals(u.getScheme())) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (Exception ignored) {
                }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (callbackArquivo != null) callbackArquivo.onReceiveValue(null);
                callbackArquivo = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try {
                    startActivityForResult(Intent.createChooser(i, "Escolha o arquivo de backup"), REQ_ARQUIVO);
                } catch (ActivityNotFoundException e) {
                    callbackArquivo = null;
                    cb.onReceiveValue(null);
                }
                return true;
            }
        });

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int r = tts.setLanguage(Locale.forLanguageTag("pt-BR"));
                ttsPronto = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
            }
        });

        web.loadUrl("file:///android_asset/index.html");
    }

    private void js(final String codigo) {
        runOnUiThread(() -> web.evaluateJavascript(codigo, null));
    }

    private void abrirVoz() {
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "pt-BR");
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "pt-BR");
        i.putExtra(RecognizerIntent.EXTRA_PROMPT, "Fale com seu assessor…");
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
        try {
            startActivityForResult(i, REQ_VOZ);
        } catch (ActivityNotFoundException e) {
            js("window.__onVoiceError && window.__onVoiceError(" + JSONObject.quote(
                    "Não achei o reconhecimento de voz do Google. Use o microfone do teclado.") + ")");
        }
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == REQ_VOZ) {
            if (res == RESULT_OK && data != null) {
                ArrayList<String> r = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                JSONArray arr = new JSONArray();
                if (r != null) for (String t : r) arr.put(t);
                js("window.__onVoice && window.__onVoice(" + arr.toString() + ")");
            } else {
                js("window.__onVoiceError && window.__onVoiceError('')");
            }
        } else if (req == REQ_ARQUIVO) {
            if (callbackArquivo != null) {
                Uri[] resultado = null;
                if (res == RESULT_OK && data != null && data.getData() != null) {
                    resultado = new Uri[]{data.getData()};
                }
                callbackArquivo.onReceiveValue(resultado);
                callbackArquivo = null;
            }
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        web.evaluateJavascript("(window.__onBack && window.__onBack()) ? 'sim' : 'nao'", valor -> {
            if (!"\"sim\"".equals(valor)) voltarPadrao();
        });
    }

    @SuppressWarnings("deprecation")
    private void voltarPadrao() {
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        if (web != null) web.destroy();
        super.onDestroy();
    }

    /** Ponte chamada pelo JavaScript do app. */
    public class Ponte {

        @JavascriptInterface
        public String loadData() {
            synchronized (travaDados) {
                File f = new File(getFilesDir(), ARQ_DADOS);
                if (!f.exists()) return "";
                try (InputStream in = new FileInputStream(f)) {
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    byte[] buf = new byte[8192];
                    int n;
                    while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                    return new String(out.toByteArray(), StandardCharsets.UTF_8);
                } catch (Exception e) {
                    return "";
                }
            }
        }

        @JavascriptInterface
        public boolean saveData(String json) {
            synchronized (travaDados) {
                File dir = getFilesDir();
                File tmp = new File(dir, ARQ_DADOS + ".tmp");
                File dest = new File(dir, ARQ_DADOS);
                File bak = new File(dir, "dados-anterior.json");
                try (OutputStream out = new FileOutputStream(tmp)) {
                    out.write(json.getBytes(StandardCharsets.UTF_8));
                    out.flush();
                } catch (Exception e) {
                    return false;
                }
                if (dest.exists()) {
                    if (bak.exists()) bak.delete();
                    dest.renameTo(bak);
                }
                return tmp.renameTo(dest);
            }
        }

        @JavascriptInterface
        public void startVoice() {
            runOnUiThread(MainActivity.this::abrirVoz);
        }

        @JavascriptInterface
        public void speak(String texto) {
            if (tts != null && ttsPronto && texto != null) {
                tts.speak(texto, TextToSpeech.QUEUE_FLUSH, null, "assessor");
            }
        }

        @JavascriptInterface
        public void stopSpeaking() {
            if (tts != null) tts.stop();
        }

        @JavascriptInterface
        public String appVersion() {
            try {
                PackageInfo p = getPackageManager().getPackageInfo(getPackageName(), 0);
                return p.versionName;
            } catch (Exception e) {
                return "";
            }
        }

        @JavascriptInterface
        public String saveFile(String nome, String mime, String conteudo) {
            byte[] bytes = conteudo.getBytes(StandardCharsets.UTF_8);
            if (Build.VERSION.SDK_INT >= 29) {
                try {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.MediaColumns.DISPLAY_NAME, nome);
                    cv.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                    cv.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                    if (uri == null) throw new Exception("sem uri");
                    try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                        if (os == null) throw new Exception("sem saída");
                        os.write(bytes);
                    }
                    return "Salvo em Downloads: " + nome;
                } catch (Exception e) {
                    // cai para o compartilhamento abaixo
                }
            }
            final Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_SUBJECT, nome);
            send.putExtra(Intent.EXTRA_TEXT, conteudo);
            runOnUiThread(() -> {
                try {
                    startActivity(Intent.createChooser(send, "Salvar " + nome));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Não consegui salvar o arquivo", Toast.LENGTH_LONG).show();
                }
            });
            return "";
        }
    }
}
