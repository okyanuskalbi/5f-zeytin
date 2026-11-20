import { bindTestD1, createTestD1 } from "./helpers/d1-sqlite";

// Her test dosyası kendi bellek içi D1 uyumlu veritabanını (db/d1 göçleri uygulanmış) alır.
bindTestD1(createTestD1());
