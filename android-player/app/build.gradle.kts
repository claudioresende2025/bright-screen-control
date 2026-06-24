plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.signagehub.player"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.signagehub.player"
        minSdk = 24
        targetSdk = 34
        versionCode = 4
        versionName = "1.0.3"

        ndk {
            // APK universal: roda em TVs/celulares 32-bit (armv7, x86)
            // e 64-bit (arm64, x86_64). Sem código nativo, mas declarar
            // ABIs evita que instaladores recusem o pacote.
            abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
        }
    }

    // Garante um único APK universal (sem dividir por ABI),
    // preservando o mesmo nome de arquivo e a mesma URL pública.
    splits {
        abi {
            isEnable = false
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.webkit:webkit:1.11.0")
    implementation("androidx.leanback:leanback:1.0.0")
}