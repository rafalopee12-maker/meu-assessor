plugins {
    id("com.android.application")
}

val numeroBuild = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()

android {
    namespace = "com.meuassessor.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.meuassessor.app"
        minSdk = 24
        targetSdk = 35
        versionCode = numeroBuild
        versionName = "1.0.$numeroBuild"
    }

    signingConfigs {
        create("assessor") {
            // Chave fixa: permite instalar as próximas versões por cima, sem perder os dados.
            storeFile = file("assessor.keystore")
            storePassword = "meuassessor"
            keyAlias = "assessor"
            keyPassword = "meuassessor"
            storeType = "pkcs12"
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("assessor")
        }
        getByName("debug") {
            signingConfig = signingConfigs.getByName("assessor")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        buildConfig = false
    }

    lint {
        checkReleaseBuilds = false
        abortOnError = false
    }
}
